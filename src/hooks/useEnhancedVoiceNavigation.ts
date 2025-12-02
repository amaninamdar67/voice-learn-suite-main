import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// TypeScript declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceCommand {
  patterns: string[];
  action: (transcript: string) => void;
  description: string;
}

export const useEnhancedVoiceNavigation = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordMode, setIsWakeWordMode] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize default voice settings for new users
  const initializeDefaultVoice = useCallback(() => {
    const savedSettings = localStorage.getItem('voiceSettings');
    if (!savedSettings) {
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google'));
      
      if (hindiVoice) {
        const defaultSettings = {
          voiceName: hindiVoice.name,
          rate: 0.85,
          pitch: 1.0,
          volume: 1.0
        };
        localStorage.setItem('voiceSettings', JSON.stringify(defaultSettings));
      }
    }
  }, []);

  // Voice feedback with enhanced quality
  const speak = useCallback((text: string) => {
    // Ensure voices are loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Voices not loaded yet, wait and retry
      window.speechSynthesis.onvoiceschanged = () => {
        speak(text);
      };
      return;
    }

    const savedSettings = localStorage.getItem('voiceSettings');
    let settings: {
      voiceName: string;
      rate: number;
      pitch: number;
      volume: number;
    };
    
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    } else {
      // Initialize default for new users
      const hindiVoice = voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google'));
      settings = {
        voiceName: hindiVoice?.name || '',
        rate: 0.85,
        pitch: 1.0,
        volume: 1.0
      };
      // Save default settings
      localStorage.setItem('voiceSettings', JSON.stringify(settings));
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice
    if (settings.voiceName) {
      const selectedVoice = voices.find(v => v.name === settings.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // Command definitions
  const commands: VoiceCommand[] = [
    // === NAVIGATION COMMANDS (Sidebar Pages) ===
    {
      patterns: ['go to dashboard', 'open dashboard', 'dashboard', 'home'],
      action: () => {
        navigate('/dashboard');
        speak('Opening dashboard');
      },
      description: 'Navigate to dashboard'
    },
    {
      patterns: ['go to settings', 'open settings', 'settings'],
      action: () => {
        navigate('/settings');
        speak('Opening settings');
      },
      description: 'Navigate to settings'
    },
    {
      patterns: ['go to leaderboard', 'open leaderboard', 'leaderboard', 'rankings'],
      action: () => {
        navigate('/leaderboard');
        speak('Opening leaderboard');
      },
      description: 'Navigate to leaderboard'
    },
    {
      patterns: ['go to lessons', 'open lessons', 'lessons', 'my lessons'],
      action: () => {
        navigate('/lessons');
        speak('Opening lessons');
      },
      description: 'Navigate to lessons'
    },
    {
      patterns: ['go to videos', 'open videos', 'videos', 'video lessons'],
      action: () => {
        navigate('/videos');
        speak('Opening videos');
      },
      description: 'Navigate to videos'
    },
    {
      patterns: ['go to quizzes', 'open quizzes', 'quizzes', 'my quizzes'],
      action: () => {
        navigate('/quizzes');
        speak('Opening quizzes');
      },
      description: 'Navigate to quizzes'
    },
    {
      patterns: ['go to assignments', 'open assignments', 'assignments', 'my assignments'],
      action: () => {
        navigate('/assignments');
        speak('Opening assignments');
      },
      description: 'Navigate to assignments'
    },
    {
      patterns: ['go to community', 'open community', 'community', 'discussions'],
      action: () => {
        navigate('/community');
        speak('Opening community');
      },
      description: 'Navigate to community'
    },
    {
      patterns: ['go to projects', 'open projects', 'projects'],
      action: () => {
        navigate('/projects');
        speak('Opening projects');
      },
      description: 'Navigate to projects'
    },
    {
      patterns: ['go back', 'back', 'return'],
      action: () => {
        window.history.back();
        speak('Going back');
      },
      description: 'Go to previous page'
    },

    // === DOCUMENT COMMANDS ===
    {
      patterns: ['open document', 'show document', 'view document'],
      action: () => {
        speak('Opening document');
        window.dispatchEvent(new CustomEvent('openContent', { 
          detail: { type: 'document', action: 'open' } 
        }));
      },
      description: 'Open document'
    },
    {
      patterns: ['open title', 'open card'],
      action: (transcript) => {
        const match = transcript.match(/(?:open title|open card)\s+(.+)/i);
        if (match) {
          const title = match[1];
          speak(`Opening ${title}`);
          window.dispatchEvent(new CustomEvent('openContent', { 
            detail: { type: 'document', title } 
          }));
        }
      },
      description: 'Open document by title'
    },
    {
      patterns: ['read document', 'read this document'],
      action: () => {
        speak('Reading document');
        window.dispatchEvent(new CustomEvent('readContent', { 
          detail: { type: 'document' } 
        }));
      },
      description: 'Read document aloud'
    },

    // === VIDEO COMMANDS ===
    {
      patterns: ['open video', 'play video', 'watch video'],
      action: (transcript) => {
        const match = transcript.match(/(?:open|play|watch)\s+video\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
        if (match) {
          const num = parseNumber(match[1]);
          speak(`Opening video ${num}`);
          window.dispatchEvent(new CustomEvent('openContent', { 
            detail: { type: 'video', number: num } 
          }));
        } else {
          speak('Please specify video number');
        }
      },
      description: 'Open video by number'
    },
    {
      patterns: ['open lecture', 'play lecture', 'watch lecture'],
      action: (transcript) => {
        const match = transcript.match(/(?:open|play|watch)\s+lecture\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
        if (match) {
          const num = parseNumber(match[1]);
          speak(`Opening lecture ${num}`);
          window.dispatchEvent(new CustomEvent('openContent', { 
            detail: { type: 'video', number: num } 
          }));
        } else {
          speak('Please specify lecture number');
        }
      },
      description: 'Open lecture by number'
    },
    {
      patterns: ['play lesson titled'],
      action: (transcript) => {
        const match = transcript.match(/play lesson titled\s+(.+)/i);
        if (match) {
          const title = match[1];
          speak(`Playing lesson ${title}`);
          window.dispatchEvent(new CustomEvent('openContent', { 
            detail: { type: 'video', title } 
          }));
        }
      },
      description: 'Play lesson by title'
    },

    // === QUIZ COMMANDS ===
    {
      patterns: ['open quiz', 'start quiz', 'take quiz'],
      action: (transcript) => {
        const match = transcript.match(/(?:open|start|take)\s+quiz\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
        if (match) {
          const num = parseNumber(match[1]);
          speak(`Opening quiz ${num}`);
          window.dispatchEvent(new CustomEvent('openContent', { 
            detail: { type: 'quiz', number: num } 
          }));
        } else {
          speak('Please specify quiz number');
        }
      },
      description: 'Open quiz by number'
    },

    // === ASSIGNMENT COMMANDS ===
    {
      patterns: ['open assignment', 'view assignment', 'show assignment'],
      action: (transcript) => {
        const match = transcript.match(/(?:open|view|show)\s+assignment\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
        if (match) {
          const num = parseNumber(match[1]);
          speak(`Opening assignment ${num}`);
          window.dispatchEvent(new CustomEvent('openContent', { 
            detail: { type: 'assignment', number: num } 
          }));
        } else {
          speak('Please specify assignment number');
        }
      },
      description: 'Open assignment by number'
    },

    // === GENERIC ITEM COMMANDS ===
    {
      patterns: ['open item', 'select item', 'choose item'],
      action: (transcript) => {
        const match = transcript.match(/(?:open|select|choose)\s+item\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
        if (match) {
          const num = parseNumber(match[1]);
          speak(`Opening item ${num}`);
          window.dispatchEvent(new CustomEvent('openContent', { 
            detail: { type: 'item', number: num } 
          }));
        } else {
          speak('Please specify item number');
        }
      },
      description: 'Open item by number'
    },

    // === READING COMMANDS ===
    {
      patterns: ['read page', 'read this page', 'read headings'],
      action: () => {
        speak('Reading page headings');
        window.dispatchEvent(new Event('readHeadings'));
      },
      description: 'Read only headings on current page'
    },
    {
      patterns: ['read', 'read section', 'read component'],
      action: (transcript) => {
        // Extract component name after "read"
        const match = transcript.match(/read\s+(.+)/i);
        if (match) {
          const componentName = match[1]
            .replace(/section|component|area|part/gi, '')
            .trim();
          
          // Avoid triggering on "read page" or similar
          if (componentName && 
              componentName !== 'page' && 
              componentName !== 'this page' &&
              componentName !== 'headings') {
            speak(`Reading ${componentName}`);
            window.dispatchEvent(new CustomEvent('readComponent', { 
              detail: { name: componentName } 
            }));
          }
        }
      },
      description: 'Read specific component by name'
    },
    {
      patterns: ['stop reading', 'stop'],
      action: () => {
        window.speechSynthesis.cancel();
        speak('Stopped reading');
        window.dispatchEvent(new Event('stopReading'));
      },
      description: 'Stop reading'
    },
    {
      patterns: ['pause reading', 'pause'],
      action: () => {
        window.speechSynthesis.pause();
        speak('Paused');
        window.dispatchEvent(new Event('pauseReading'));
      },
      description: 'Pause reading'
    },
    {
      patterns: ['continue reading', 'resume reading', 'resume', 'continue'],
      action: () => {
        window.speechSynthesis.resume();
        speak('Continuing');
        window.dispatchEvent(new Event('resumeReading'));
      },
      description: 'Resume reading'
    },

    // === PAGE NAVIGATION COMMANDS ===
    {
      patterns: ['next page', 'next'],
      action: () => {
        speak('Next page');
        window.dispatchEvent(new Event('nextPage'));
      },
      description: 'Go to next page'
    },
    {
      patterns: ['previous page', 'previous'],
      action: () => {
        speak('Previous page');
        window.dispatchEvent(new Event('previousPage'));
      },
      description: 'Go to previous page'
    },

    // === SCROLL COMMANDS ===
    {
      patterns: ['scroll up', 'scroll top', 'go up'],
      action: () => {
        window.scrollBy({ top: -300, behavior: 'smooth' });
        speak('Scrolling up');
      },
      description: 'Scroll up'
    },
    {
      patterns: ['scroll down', 'scroll bottom', 'go down'],
      action: () => {
        window.scrollBy({ top: 300, behavior: 'smooth' });
        speak('Scrolling down');
      },
      description: 'Scroll down'
    },

    // === CONTROL COMMANDS ===
    {
      patterns: ['close', 'close this', 'dismiss', 'exit'],
      action: () => {
        speak('Closing');
        window.dispatchEvent(new Event('closeModal'));
      },
      description: 'Close modal or overlay'
    },
    {
      patterns: ['search for', 'find', 'search'],
      action: (transcript) => {
        const match = transcript.match(/(?:search for|find|search)\s+(.+)/i);
        if (match) {
          const query = match[1];
          speak(`Searching for ${query}`);
          window.dispatchEvent(new CustomEvent('search', { detail: { query } }));
        }
      },
      description: 'Search for content'
    },

    // === HELP COMMAND ===
    {
      patterns: ['help', 'what can you do', 'commands', 'show commands'],
      action: () => {
        speak('Available commands: Open dashboard, Open videos, Open quiz 1, Read page, Scroll up, Go back, and many more. Check the voice navigation guide for full list.');
      },
      description: 'Show available commands'
    },

    // === VOICE NAVIGATION CONTROL ===
    {
      patterns: ['voice navigation off', 'turn off voice', 'disable navigation', 'stop listening'],
      action: () => {
        speak('Voice navigation disabled. Say voice navigation on to re-enable');
        setIsWakeWordMode(true);
        setIsListening(false);
      },
      description: 'Disable voice navigation (wake-word mode)'
    }
  ];

  // Wake-word commands (only active when voice nav is OFF)
  const wakeWordCommands = [
    'voice navigation on',
    'turn on voice navigation',
    'enable voice navigation',
    'navigation on',
    'start voice navigation'
  ];

  // Helper: Convert word numbers to digits
  const parseNumber = (word: string): number => {
    const numbers: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20
    };
    return numbers[word.toLowerCase()] || parseInt(word);
  };

  // Helper: Find closest matching command
  const findClosestCommand = (transcript: string): string | null => {
    const commonCommands = [
      'go to dashboard',
      'open videos',
      'open quiz 1',
      'read page',
      'scroll down',
      'go back',
      'next page',
      'open item 1'
    ];

    // Simple fuzzy matching - find commands with similar words
    for (const cmd of commonCommands) {
      const cmdWords = cmd.split(' ');
      const transcriptWords = transcript.split(' ');
      const matchCount = cmdWords.filter(word => transcriptWords.includes(word)).length;
      
      if (matchCount >= 2) {
        return cmd;
      }
    }
    return null;
  };

  // Process voice command
  const processCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    setLastCommand(transcript);

    // Check if in wake-word mode
    if (isWakeWordMode) {
      if (wakeWordCommands.some(cmd => lowerTranscript.includes(cmd))) {
        setIsWakeWordMode(false);
        setIsListening(true);
        speak('Voice navigation enabled');
        return;
      }
      return; // Ignore all other commands in wake-word mode
    }

    // Find matching command
    let commandFound = false;
    for (const command of commands) {
      if (command.patterns.some(pattern => lowerTranscript.includes(pattern))) {
        command.action(transcript);
        commandFound = true;
        break;
      }
    }

    // Error handling - command not recognized
    if (!commandFound) {
      // Find closest matching command
      const closestMatch = findClosestCommand(lowerTranscript);
      if (closestMatch) {
        speak(`I heard: ${transcript}. Did you mean: ${closestMatch}?`);
      } else {
        speak(`I heard: ${transcript}. Command not recognized. Say help for available commands.`);
      }
    }
  }, [isWakeWordMode, commands, speak]);

  // Initialize speech recognition and default voice
  useEffect(() => {
    // Initialize default voice settings for new users
    const initVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        initializeDefaultVoice();
      }
    };

    // Load voices
    if (window.speechSynthesis.getVoices().length > 0) {
      initVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition
        if (isListening || isWakeWordMode) {
          recognition.start();
        }
      }
    };

    recognition.onend = () => {
      // Auto-restart if still listening or in wake-word mode
      if (isListening || isWakeWordMode) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isListening, isWakeWordMode, processCommand, initializeDefaultVoice]);

  // Start/stop listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      speak('Voice navigation stopped');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        speak('Voice navigation active');
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [isListening, speak]);

  // Spacebar toggle (only when not in input fields)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        // Only toggle if not in input/textarea
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault();
          toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  return {
    isListening,
    isWakeWordMode,
    lastCommand,
    toggleListening,
    commands
  };
};
