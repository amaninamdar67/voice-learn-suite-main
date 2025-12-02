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
    
    // Default to Hindi female voice for new users
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google'));
    
    const defaultSettings = {
      voiceName: hindiVoice?.name || '',
      rate: 0.85,
      pitch: 1.0,
      volume: 1.0
    };
    
    // Save default settings for consistency
    localStorage.setItem('voiceSettings', JSON.stringify(defaultSettings));
    
    return defaultSettings;
  };

  // Stop any ongoing speech before starting new one
  const stopCurrentSpeech = () => {
    window.speechSynthesis.cancel();
    setState({
      isReading: false,
      isPaused: false,
      currentChunk: 0,
      totalChunks: 0
    });
    chunksRef.current = [];
  };

  // Extract ONLY headings from page (for "Read Page" command)
  const extractHeadings = (element: HTMLElement): string[] => {
    const headings: string[] = [];
    
    const headingSelectors = 'h1, h2, h3, h4, h5, h6, [role="heading"]';
    const headingElements = element.querySelectorAll(headingSelectors);
    
    headingElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      
      // Skip hidden elements
      if (htmlEl.style.display === 'none' || htmlEl.style.visibility === 'hidden') return;
      if (htmlEl.offsetParent === null) return; // Element not visible
      
      const text = htmlEl.textContent?.trim();
      if (text && text.length > 0) {
        headings.push(text);
      }
    });
    
    // Also look for card titles and section titles (common patterns)
    const titleSelectors = '.card-title, .section-title, .component-title, [class*="title"]';
    const titleElements = element.querySelectorAll(titleSelectors);
    
    titleElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      
      // Skip if already captured as heading
      if (htmlEl.matches(headingSelectors)) return;
      
      // Skip hidden elements
      if (htmlEl.style.display === 'none' || htmlEl.style.visibility === 'hidden') return;
      if (htmlEl.offsetParent === null) return;
      
      const text = htmlEl.textContent?.trim();
      if (text && text.length > 0 && text.length < 100) { // Titles are usually short
        headings.push(text);
      }
    });
    
    return headings;
  };

  // Extract ALL content from a specific component
  const extractComponentContent = (element: HTMLElement): string => {
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
      if (el.offsetParent === null) return; // Not visible
      if (['script', 'style', 'svg', 'path'].includes(tagName)) return;

      // Handle specific elements with structure
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          parts.push(`Heading: ${el.textContent?.trim()}.`);
          break;
        
        case 'p':
          parts.push(`${el.textContent?.trim()}.`);
          break;
        
        case 'li':
          parts.push(`Item: ${el.textContent?.trim()}.`);
          break;
        
        case 'button':
          parts.push(`Button: ${el.textContent?.trim()}.`);
          break;
        
        case 'a':
          parts.push(`Link: ${el.textContent?.trim()}.`);
          break;
        
        case 'label':
          parts.push(`${el.textContent?.trim()}.`);
          break;
        
        case 'br':
          parts.push(' ');
          break;
        
        default:
          Array.from(el.childNodes).forEach(child => processNode(child));
      }
    };

    Array.from(element.childNodes).forEach(child => processNode(child));
    
    return parts.join(' ').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
  };

  // Find component by name (fuzzy matching)
  const findComponentByName = (name: string): HTMLElement | null => {
    const lowerName = name.toLowerCase();
    
    // Try exact ID match first
    const byId = document.getElementById(lowerName);
    if (byId) return byId;
    
    // Try class name match
    const byClass = document.querySelector(`.${lowerName.replace(/\s+/g, '-')}`);
    if (byClass) return byClass as HTMLElement;
    
    // Try data attribute match
    const byData = document.querySelector(`[data-component="${lowerName}"]`);
    if (byData) return byData as HTMLElement;
    
    // Fuzzy match by text content in headings or aria-labels
    const allElements = document.querySelectorAll('section, div[class*="section"], div[class*="card"], aside, nav, main');
    
    for (const el of Array.from(allElements)) {
      const htmlEl = el as HTMLElement;
      
      // Check aria-label
      const ariaLabel = htmlEl.getAttribute('aria-label')?.toLowerCase();
      if (ariaLabel && ariaLabel.includes(lowerName)) return htmlEl;
      
      // Check heading inside
      const heading = htmlEl.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const headingText = heading.textContent?.toLowerCase();
        if (headingText && headingText.includes(lowerName)) return htmlEl;
      }
      
      // Check class name
      const className = htmlEl.className.toLowerCase();
      if (className.includes(lowerName.replace(/\s+/g, ''))) return htmlEl;
    }
    
    // Special cases
    if (lowerName.includes('sidebar') || lowerName.includes('side bar')) {
      return document.querySelector('aside, nav[class*="sidebar"], div[class*="sidebar"]') as HTMLElement;
    }
    
    if (lowerName.includes('main') || lowerName.includes('content')) {
      return document.querySelector('main') as HTMLElement;
    }
    
    return null;
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
      
      // Apply voice settings to end message
      const voices = window.speechSynthesis.getVoices();
      if (settings.voiceName) {
        const selectedVoice = voices.find(v => v.name === settings.voiceName);
        if (selectedVoice) endUtterance.voice = selectedVoice;
      }
      endUtterance.rate = settings.rate;
      
      window.speechSynthesis.speak(endUtterance);
      return;
    }

    const settings = getVoiceSettings();
    const text = chunksRef.current[chunkIndex];
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    const voices = window.speechSynthesis.getVoices();
    if (settings.voiceName) {
      const selectedVoice = voices.find(v => v.name === settings.voiceName);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    
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

  // Read only headings (for "Read Page" command)
  const readHeadings = useCallback(() => {
    // Stop any ongoing speech first
    stopCurrentSpeech();
    
    const mainContent = document.querySelector('main') || document.body;
    const headings = extractHeadings(mainContent as HTMLElement);
    
    if (headings.length === 0) {
      const settings = getVoiceSettings();
      const utterance = new SpeechSynthesisUtterance('No headings found on this page');
      
      const voices = window.speechSynthesis.getVoices();
      if (settings.voiceName) {
        const selectedVoice = voices.find(v => v.name === settings.voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;
      }
      utterance.rate = settings.rate;
      
      window.speechSynthesis.speak(utterance);
      return;
    }
    
    // Create intro + headings text
    const introText = `Reading ${headings.length} headings on this page.`;
    const headingsText = headings.join('. ');
    const fullText = `${introText} ${headingsText}`;
    
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
  }, []);

  // Read specific component by name
  const readComponent = useCallback((componentName: string) => {
    // Stop any ongoing speech first
    stopCurrentSpeech();
    
    const component = findComponentByName(componentName);
    
    if (!component) {
      const settings = getVoiceSettings();
      const utterance = new SpeechSynthesisUtterance(`Could not find ${componentName} on this page`);
      
      const voices = window.speechSynthesis.getVoices();
      if (settings.voiceName) {
        const selectedVoice = voices.find(v => v.name === settings.voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;
      }
      utterance.rate = settings.rate;
      
      window.speechSynthesis.speak(utterance);
      return;
    }
    
    const content = extractComponentContent(component);
    
    if (!content || content.length === 0) {
      const settings = getVoiceSettings();
      const utterance = new SpeechSynthesisUtterance(`${componentName} is empty`);
      
      const voices = window.speechSynthesis.getVoices();
      if (settings.voiceName) {
        const selectedVoice = voices.find(v => v.name === settings.voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;
      }
      utterance.rate = settings.rate;
      
      window.speechSynthesis.speak(utterance);
      return;
    }
    
    // Create intro + content text
    const introText = `Reading ${componentName}.`;
    const fullText = `${introText} ${content}`;
    
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
  }, []);

  // Stop reading
  const stopReading = useCallback(() => {
    stopCurrentSpeech();
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
    readHeadings,
    readComponent,
    stopReading,
    pauseReading,
    resumeReading
  };
};
