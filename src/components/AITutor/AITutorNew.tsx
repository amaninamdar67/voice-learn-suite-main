import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Mic, MicOff, Volume2, VolumeX, Image as ImageIcon, Loader, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

export const AITutorNew: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSpeech, setAutoSpeech] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputValueRef = useRef<string>('');

  // Check if user has access (all roles except parent)
  const hasAccess = user?.role && user.role !== 'parent';

  useEffect(() => {
    initializeSpeechRecognition();
    
    const handleOpenAITutor = () => {
      setIsOpen(true);
    };
    
    window.addEventListener('open-ai-tutor-new', handleOpenAITutor);
    return () => window.removeEventListener('open-ai-tutor-new', handleOpenAITutor);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() && !uploadedImage) return;

    const messageContent = inputValue || (uploadedImage ? 'Analyze this image' : '');
    
    // Create new session if needed
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        const authHeader = await getAuthHeader();
        const response = await fetch('/api/ai-tutor/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({ title: messageContent.substring(0, 50) || 'New Chat' }),
        });
        if (response.ok) {
          const data = await response.json();
          sessionId = data.session.id;
          setCurrentSessionId(sessionId);
        }
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      image: uploadedImage,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    inputValueRef.current = '';
    setUploadedImage(null);
    setIsLoading(true);

    // Save user message to database
    if (sessionId) {
      try {
        const authHeader = await getAuthHeader();
        await fetch(`/api/ai-tutor/sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({
            role: 'user',
            content: messageContent,
            imageData: uploadedImage || null,
          }),
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }

    try {
      // Determine endpoint based on whether image is present
      let endpoint = '/api/groq/chat'; // Default: Groq for text
      let payload: any = {
        message: messageContent,
        model: 'llama-3.1-8b-instant'
      };
      
      // For now, always use Groq (text-only)
      // Image support coming soon with proper provider
      if (uploadedImage) {
        console.log('[AI Chat] Image detected - describing image in text instead');
        // User can describe the image in their message
      } else {
        console.log('[AI Chat] Text only - using Groq');
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[Frontend] Failed to parse response:', parseError);
        throw new Error('Server returned invalid response');
      }
      
      if (!response.ok) {
        console.error('[Frontend] API error:', data.error);
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'No response generated',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save AI response to database
      if (sessionId) {
        try {
          const authHeader = await getAuthHeader();
          await fetch(`/api/ai-tutor/sessions/${sessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify({
              role: 'assistant',
              content: assistantMessage.content,
            }),
          });
        } catch (error) {
          console.error('Error saving AI message:', error);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get response';
      console.error('[Frontend] Error:', errorMsg);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${errorMsg}`,
        timestamp: new Date()
      };

      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, uploadedImage, currentSessionId, messages]);

  useEffect(() => {
    const handleAutoSend = () => {
      if (inputValueRef.current.trim()) {
        sendMessage();
      }
    };
    
    window.addEventListener('ai-tutor-auto-send', handleAutoSend);
    return () => window.removeEventListener('ai-tutor-auto-send', handleAutoSend);
  }, [sendMessage]);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        let hasFinal = false;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const newValue = inputValueRef.current + (inputValueRef.current ? ' ' : '') + transcript;
            inputValueRef.current = newValue;
            setInputValue(newValue);
            hasFinal = true;
          }
        }

        if (hasFinal) {
          silenceTimerRef.current = setTimeout(() => {
            if (inputValueRef.current.trim()) {
              window.dispatchEvent(new CustomEvent('ai-tutor-auto-send'));
            }
          }, 2000);
        }
      };

      recognitionRef.current.onend = () => {
        setIsMicActive(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsMicActive(false);
      };
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    
    if (isMicActive) {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      recognitionRef.current.stop();
      setIsMicActive(false);
    } else {
      recognitionRef.current.start();
      setIsMicActive(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setUploadedImage(base64String);
      console.log('[Image Upload] Image loaded successfully');
    };
    reader.onerror = () => {
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReadMessage = (messageId: string, content: string) => {
    if (readingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setReadingMessageId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => setReadingMessageId(null);
      window.speechSynthesis.speak(utterance);
      setReadingMessageId(messageId);
    }
  };

  // Auto-speak AI responses
  useEffect(() => {
    if (autoSpeech && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isLoading) {
        const timer = setTimeout(() => {
          handleReadMessage(lastMessage.id, lastMessage.content);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, autoSpeech, isLoading]);

  const getAuthHeader = async () => {
    try {
      let token = localStorage.getItem('sb-token') || sessionStorage.getItem('sb-token');
      if (!token) {
        token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      }
      if (token) {
        return { 'Authorization': `Bearer ${token}` };
      }
    } catch (error) {
      console.warn('[Auth] Could not get auth token:', error);
    }
    return {};
  };

  return (
    <>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9997]"
            onClick={() => setIsOpen(false)}
          />
          
          <div className={`fixed z-[9998] flex items-center justify-center ${isFullscreen ? 'inset-0 p-0' : 'inset-0 p-4'}`}>
            {!hasAccess ? (
              <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border border-red-500/30 flex flex-col items-center justify-center overflow-hidden ${
                isFullscreen 
                  ? 'w-full h-full rounded-none' 
                  : 'w-full h-full max-w-4xl max-h-[90vh] rounded-2xl'
              }`}>
                <div className="text-center space-y-6 p-8">
                  <div className="text-6xl">🔒</div>
                  <h2 className="text-3xl font-bold text-red-400">Access Denied</h2>
                  <p className="text-xl text-slate-300">AI Tutor is not available for Parent accounts.</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border border-blue-500/30 flex flex-col overflow-hidden ${
                isFullscreen 
                  ? 'w-full h-full rounded-none' 
                  : 'w-full h-full max-w-4xl max-h-[90vh] rounded-2xl'
              }`}>
              
              <div className="flex items-center justify-between p-6 border-b border-blue-500/20 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🤖</div>
                  <h2 className="text-2xl font-bold text-blue-300">AI Tutor</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoSpeech(!autoSpeech)}
                    title={autoSpeech ? 'Auto speech ON' : 'Auto speech OFF'}
                    className={`p-2 rounded-lg transition ${
                      autoSpeech
                        ? 'bg-green-500/30 text-green-300 hover:bg-green-500/50'
                        : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                    }`}
                  >
                    {autoSpeech ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-300"
                  >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-300"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-xl">Start a conversation with AI</p>
                    <p className="text-sm mt-2">Ask questions or upload images for analysis</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`${isFullscreen ? 'max-w-[70%]' : 'max-w-2xl'} ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-3xl rounded-tr-none'
                            : 'bg-slate-700 text-slate-100 rounded-3xl rounded-tl-none'
                        } shadow-lg p-6`}
                      >
                        {msg.image && (
                          <img 
                            src={msg.image} 
                            alt="uploaded" 
                            className="max-w-sm rounded-lg mb-3 max-h-64 object-contain"
                          />
                        )}
                        <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => handleReadMessage(msg.id, msg.content)}
                            className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition flex items-center gap-2 text-sm font-medium"
                          >
                            {readingMessageId === msg.id ? (
                              <>
                                <VolumeX size={16} /> Stop Reading
                              </>
                            ) : (
                              <>
                                <Volume2 size={16} /> Read (Hindi)
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 border-t border-blue-500/20 bg-slate-800/50 space-y-4">
                {uploadedImage && (
                  <div className="relative inline-block">
                    <img 
                      src={uploadedImage} 
                      alt="preview" 
                      className="max-h-32 rounded-lg border border-blue-500/30"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => {
                      inputValueRef.current = e.target.value;
                      setInputValue(e.target.value);
                    }}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your question or speak..."
                    className="flex-1 bg-slate-700 text-white px-6 py-4 rounded-xl border border-blue-500/30 focus:outline-none focus:border-blue-500 text-lg placeholder-slate-400"
                  />
                  
                  <button
                    onClick={toggleMic}
                    className={`p-4 rounded-xl transition ${
                      isMicActive 
                        ? 'bg-red-500/30 text-red-300 hover:bg-red-500/50' 
                        : 'bg-blue-500/30 text-blue-300 hover:bg-blue-500/50'
                    }`}
                    title="Voice input (English)"
                  >
                    {isMicActive ? <Mic size={24} /> : <MicOff size={24} />}
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-500/50 transition"
                    title="Upload image or document"
                    type="button"
                  >
                    <ImageIcon size={24} />
                  </button>
                  
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || (!inputValue.trim() && !uploadedImage)}
                    className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader size={24} className="animate-spin" /> : <Send size={24} />}
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
