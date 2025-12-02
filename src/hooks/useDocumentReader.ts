import { useState, useCallback, useRef } from 'react';

interface ReadingState {
  isReading: boolean;
  isPaused: boolean;
  currentChunk: number;
  totalChunks: number;
}

export const useDocumentReader = () => {
  const [state, setState] = useState<ReadingState>({
    isReading: false,
    isPaused: false,
    currentChunk: 0,
    totalChunks: 0
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef = useRef<string[]>([]);

  // Get voice settings from localStorage
  const getVoiceSettings = () => {
    const saved = localStorage.getItem('voiceSettings');
    if (saved) return JSON.parse(saved);
    
    // Better defaults - slower, natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') ||
      v.name.includes('Zira') ||
      v.name.includes('David')
    );
    
    return {
      voiceName: preferredVoice?.name || '',
      rate: 0.9,  // Slower, more natural
      pitch: 1.0,
      volume: 1.0
    };
  };

  // Extract structured text from page
  const extractStructuredText = (element: HTMLElement): string => {
    const parts: string[] = [];
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) parts.push(text);
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      // Skip hidden, script, style elements
      if (el.style.display === 'none' || el.style.visibility === 'hidden') return;
      if (['script', 'style', 'nav', 'header', 'footer', 'button'].includes(tagName)) return;

      // Handle specific elements with structure
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          parts.push(`\n\nHeading: ${el.textContent?.trim()}\n`);
          break;
        
        case 'p':
          parts.push(`${el.textContent?.trim()}\n`);
          break;
        
        case 'li':
          parts.push(`• ${el.textContent?.trim()}\n`);
          break;
        
        case 'td':
        case 'th':
          parts.push(`${el.textContent?.trim()} | `);
          break;
        
        case 'tr':
          Array.from(el.children).forEach(child => processNode(child));
          parts.push('\n');
          break;
        
        case 'br':
          parts.push('\n');
          break;
        
        default:
          Array.from(el.childNodes).forEach(child => processNode(child));
      }
    };

    Array.from(element.childNodes).forEach(child => processNode(child));
    
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  // Split text into chunks (for smooth reading)
  const chunkText = (text: string, maxLength: number = 500): string[] => {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  };

  // Read a specific chunk
  const readChunk = useCallback((chunkIndex: number) => {
    if (chunkIndex >= chunksRef.current.length) {
      // Finished reading all chunks
      setState({
        isReading: false,
        isPaused: false,
        currentChunk: 0,
        totalChunks: chunksRef.current.length
      });
      
      const settings = getVoiceSettings();
      const endUtterance = new SpeechSynthesisUtterance('Finished reading');
      endUtterance.rate = settings.rate;
      window.speechSynthesis.speak(endUtterance);
      return;
    }

    const settings = getVoiceSettings();
    const text = chunksRef.current[chunkIndex];
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name === settings.voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    // Handle end of chunk - auto-advance
    utterance.onend = () => {
      if (!state.isPaused) {
        readChunk(chunkIndex + 1);
      }
    };

    utterance.onerror = () => {
      setState(prev => ({ ...prev, isReading: false }));
    };

    utteranceRef.current = utterance;
    
    setState(prev => ({
      ...prev,
      currentChunk: chunkIndex + 1
    }));

    window.speechSynthesis.speak(utterance);
  }, [state.isPaused]);

  // Start reading from beginning
  const startReading = useCallback(() => {
    // Extract content
    const mainContent = document.querySelector('main') || document.body;
    const fullText = extractStructuredText(mainContent as HTMLElement);
    
    // Split into chunks
    const chunks = chunkText(fullText);
    chunksRef.current = chunks;
    
    setState({
      isReading: true,
      isPaused: false,
      currentChunk: 0,
      totalChunks: chunks.length
    });

    // Start reading first chunk
    readChunk(0);
  }, [readChunk]);

  // Stop reading
  const stopReading = useCallback(() => {
    window.speechSynthesis.cancel();
    setState({
      isReading: false,
      isPaused: false,
      currentChunk: 0,
      totalChunks: 0
    });
    chunksRef.current = [];
  }, []);

  // Pause reading
  const pauseReading = useCallback(() => {
    if (state.isReading && !state.isPaused) {
      window.speechSynthesis.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [state.isReading, state.isPaused]);

  // Resume reading
  const resumeReading = useCallback(() => {
    if (state.isReading && state.isPaused) {
      window.speechSynthesis.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [state.isReading, state.isPaused]);

  return {
    ...state,
    startReading,
    stopReading,
    pauseReading,
    resumeReading
  };
};
