import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Mic, MicOff, Send, Upload, Volume2, VolumeX, PanelRight, Square, History, Settings } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UIMode {
  type: 'popup' | 'left-panel' | 'right-panel' | 'fullscreen';
}

export const AITutorEnhanced: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uiMode, setUiMode] = useState<UIMode>({ type: 'popup' });
  const [isMicActive, setIsMicActive] = useState(false);
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:1.5b');
  const [availableModels, setAvailableModels] = useState<string[]>(['deepseek-r1:1.5b', 'deepseek-r1:1b', 'llama2']);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadChatHistory();
    fetchAvailableModels();
    initializeSpeechRecognition();
    setupKeyboardShortcuts();
    
    const handleOpenAITutor = () => {
      setIsOpen(true);
      setUiMode({ type: 'popup' });
    };
    
    window.addEventListener('open-ai-tutor', handleOpenAITutor);
    return () => window.removeEventListener('open-ai-tutor', handleOpenAITutor);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && uiMode.type === 'popup') {
      setTimeout(() => {
        setUiMode({ type: 'right-panel' });
      }, 400);
    }
  }, [isOpen]);

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        if (models.length > 0) {
          setAvailableModels(models);
          // Set first available model as default
          if (!models.includes(selectedModel)) {
            setSelectedModel(models[0]);
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch models from Ollama:', error);
      // Keep default models if Ollama is not accessible
    }
  };

  const loadChatHistory = () => {
    const saved = localStorage.getItem('aiTutorCurrentSession');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  };

  const saveChatHistory = (msgs: Message[]) => {
    // Save current session to localStorage
    localStorage.setItem('aiTutorCurrentSession', JSON.stringify(msgs));
  };

  const saveSessionToHistory = () => {
    if (messages.length === 0) return;
    
    // Get existing history sessions
    const historyKey = 'aiTutorSessions';
    const existingSessions = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Create new session
    const newSession = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      messageCount: messages.length,
      preview: messages[0]?.content.substring(0, 50) || 'Empty session',
      messages: messages
    };
    
    // Add to history (keep last 10 sessions)
    existingSessions.unshift(newSession);
    if (existingSessions.length > 10) {
      existingSessions.pop();
    }
    
    localStorage.setItem(historyKey, JSON.stringify(existingSessions));
  };

  const clearCurrentSession = () => {
    setMessages([]);
    setCurrentSessionId(null);
    localStorage.removeItem('aiTutorCurrentSession');
  };

  const loadSession = (sessionId: number) => {
    const sessions = JSON.parse(localStorage.getItem('aiTutorSessions') || '[]');
    const session = sessions.find((s: any) => s.id === sessionId);
    
    if (session && session.messages && session.messages.length > 0) {
      try {
        const loadedMessages = session.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(loadedMessages);
        setCurrentSessionId(sessionId);
        localStorage.setItem('aiTutorCurrentSession', JSON.stringify(loadedMessages));
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
  };

  const deleteSession = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const sessions = JSON.parse(localStorage.getItem('aiTutorSessions') || '[]');
    const filtered = sessions.filter((s: any) => s.id !== sessionId);
    localStorage.setItem('aiTutorSessions', JSON.stringify(filtered));
    
    // If deleted session was current, clear it
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
      localStorage.removeItem('aiTutorCurrentSession');
    }
    
    // Force re-render by updating state
    setShowHistory(!showHistory);
    setTimeout(() => setShowHistory(!showHistory), 0);
  };

  const startNewSession = () => {
    saveSessionToHistory();
    setMessages([]);
    setCurrentSessionId(null);
    localStorage.removeItem('aiTutorCurrentSession');
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInputValue(prev => prev + transcript);
          } else {
            interim += transcript;
          }
        }
      };
    }
  };

  const setupKeyboardShortcuts = () => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isOpen) {
        e.preventDefault();
        toggleMic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    
    if (isMicActive) {
      recognitionRef.current.stop();
      setIsMicActive(false);
      showNotification('Mic off');
    } else {
      recognitionRef.current.start();
      setIsMicActive(true);
      showNotification('Mic on');
    }
  };

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageToSend = inputValue; // Store message before clearing

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use Ollama endpoint for local models
      const endpoint = selectedModel.includes('deepseek') || selectedModel.includes('llama') 
        ? '/api/ollama/chat' 
        : '/api/ai-tutor/chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, model: selectedModel })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'No response generated',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${error instanceof Error ? error.message : 'Failed to get response'}\n\nTo use Ollama locally:\n1. Install Ollama from https://ollama.ai/\n2. Pull the model: ollama pull deepseek-r1:1.5b\n3. Start Ollama: ollama serve\n4. Ollama will run on http://localhost:11434`,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      showNotification(`File uploaded: ${file.name}`);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Analyzing document: ${file.name}`,
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Document received. Analyzing now.\n\nSummary: Processing file...\nKey Points: Extracting content...\nMistakes: Reviewing...\nImprovements: Suggesting...\nRelated Concepts: Finding...`,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    }
  };

  const handleReadMessage = (messageId: string, content: string) => {
    if (readingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setReadingMessageId(null);
      showNotification('Reading stopped');
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onend = () => setReadingMessageId(null);
      window.speechSynthesis.speak(utterance);
      setReadingMessageId(messageId);
      showNotification('Reading started');
    }
  };

  const setMode = (mode: UIMode['type']) => {
    setUiMode({ type: mode });
  };

  const getContainerClasses = () => {
    const base = 'fixed bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-blue-500/30 shadow-2xl flex flex-col';
    
    switch (uiMode.type) {
      case 'popup':
        return `${base} w-[48rem] h-[48rem] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] rounded-2xl`;
      case 'right-panel':
        return `${base} right-0 top-0 w-1/2 h-screen z-[9998] rounded-none`;
      case 'fullscreen':
        return `${base} inset-0 z-[9999] rounded-none`;
      default:
        return base;
    }
  };

  const getOverlayClasses = () => {
    if (isOpen && (uiMode.type === 'popup' || uiMode.type === 'right-panel')) {
      return 'fixed inset-0 bg-black/40 backdrop-blur-sm z-[9997]';
    }
    return '';
  };

  return (
    <>
      {getOverlayClasses() && (
        <div 
          className={getOverlayClasses()} 
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      )}
      
      {isOpen && (
        <div className={getContainerClasses()}>
          <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-blue-300">AI Tutor</h2>
              {/* History Button - Left Side */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition ${showHistory ? 'bg-blue-500/40 text-blue-200' : 'hover:bg-blue-500/20 text-blue-300'}`}
                title="Chat History"
              >
                <History size={16} />
              </button>
            </div>
            <div className="flex gap-1 items-center">
              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={(e) => {
                  // Save current session before switching models
                  if (messages.length > 0) {
                    saveSessionToHistory();
                  }
                  setSelectedModel(e.target.value);
                  // Clear messages for new model
                  setMessages([]);
                  localStorage.removeItem('aiTutorCurrentSession');
                }}
                className="px-2 py-1 text-xs bg-slate-700 text-blue-300 rounded border border-blue-500/30 focus:outline-none focus:border-blue-500"
              >
                {availableModels.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))
                )}
              </select>
              <button
                onClick={() => setMode('popup')}
                className={`p-2 rounded-lg transition ${uiMode.type === 'popup' ? 'bg-blue-500/40 text-blue-200' : 'hover:bg-blue-500/20 text-blue-300'}`}
                title="Pop-up mode"
              >
                <Square size={16} />
              </button>
              <button
                onClick={() => setMode('right-panel')}
                className={`p-2 rounded-lg transition ${uiMode.type === 'right-panel' ? 'bg-blue-500/40 text-blue-200' : 'hover:bg-blue-500/20 text-blue-300'}`}
                title="Right panel"
              >
                <PanelRight size={16} />
              </button>
              <button
                onClick={() => setMode('fullscreen')}
                className={`p-2 rounded-lg transition ${uiMode.type === 'fullscreen' ? 'bg-blue-500/40 text-blue-200' : 'hover:bg-blue-500/20 text-blue-300'}`}
                title="Full screen"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => {
                  if (messages.length > 0) {
                    saveSessionToHistory();
                  }
                  setIsOpen(false);
                }}
                className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-300 ml-2"
                title="Close and save session"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* History Sidebar */}
            {showHistory && (
              <div className="w-56 border-r border-blue-500/20 overflow-y-auto bg-slate-800/50 p-3 flex flex-col">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <h3 className="text-sm font-semibold text-blue-300">Sessions</h3>
                  <button
                    onClick={startNewSession}
                    className="text-xs px-2 py-1 bg-green-500/30 text-green-300 rounded hover:bg-green-500/50"
                    title="Start new session"
                  >
                    + New
                  </button>
                </div>
                
                {/* Current Session */}
                <div className="mb-3 pb-3 border-b border-blue-500/20">
                  <p className="text-xs text-blue-400 font-semibold mb-2">Current Session</p>
                  <div className="text-xs text-slate-300 p-2 bg-blue-500/20 rounded">
                    <p className="font-semibold">{messages.length} messages</p>
                    {messages.length > 0 && (
                      <p className="text-slate-400 mt-1 truncate">
                        {messages[0]?.content.substring(0, 40)}...
                      </p>
                    )}
                    {messages.length === 0 && (
                      <p className="text-slate-500 mt-1">Empty</p>
                    )}
                  </div>
                </div>

                {/* Previous Sessions */}
                <p className="text-xs text-slate-400 font-semibold mb-2">Previous Sessions</p>
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {(() => {
                    try {
                      const sessions = JSON.parse(localStorage.getItem('aiTutorSessions') || '[]');
                      return sessions.length === 0 ? (
                        <p className="text-xs text-slate-500">No previous sessions</p>
                      ) : (
                        sessions.map((session: any, idx: number) => (
                          <div 
                            key={session.id}
                            className={`text-xs p-2 rounded transition flex items-start justify-between group ${
                              currentSessionId === session.id
                                ? 'bg-blue-500/40 text-blue-200'
                                : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700'
                            }`}
                            title={new Date(session.timestamp).toLocaleString()}
                          >
                            <div 
                              onClick={() => loadSession(session.id)}
                              className="flex-1 cursor-pointer"
                            >
                              <p className="font-semibold">Session {idx + 1}</p>
                              <p className="text-slate-400">{session.messageCount} messages</p>
                              <p className="text-slate-500 truncate mt-1">{session.preview}</p>
                            </div>
                            <button
                              onClick={(e) => deleteSession(session.id, e)}
                              className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                              title="Delete session"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      );
                    } catch (e) {
                      console.error('Error loading sessions:', e);
                      return <p className="text-xs text-red-400">Error loading sessions</p>;
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <p>Start a conversation...</p>
                </div>
              ) : (
                messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-700 text-slate-100 rounded-bl-none'
                    } shadow-lg`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleReadMessage(msg.id, msg.content)}
                        className="mt-2 text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded transition flex items-center gap-1"
                      >
                        {readingMessageId === msg.id ? (
                          <>
                            <VolumeX size={12} /> Stop
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} /> Read
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
          </div>

          <div className="p-4 border-t border-blue-500/20 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type or speak..."
                className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-blue-500/30 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={toggleMic}
                className={`p-2 rounded-lg transition ${
                  isMicActive ? 'bg-red-500/30 text-red-300' : 'bg-blue-500/30 text-blue-300'
                }`}
              >
                {isMicActive ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/50 transition"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />
          </div>

          {notification && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm animate-pulse">
              {notification}
            </div>
          )}
        </div>
      )}


    </>
  );
};
