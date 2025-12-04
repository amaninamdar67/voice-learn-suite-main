import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// TypeScript declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
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
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionActiveRef = useRef(false);
  const isListeningRef = useRef(false);
  
  const voiceFeedbackEnabled = localStorage.getItem('voiceFeedbackEnabled') !== 'false';

  const speak = useCallback((text: string) => {
    if (!voiceFeedbackEnabled) return;
    window.speechSynthesis.cancel();
    
    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const selectedVoiceName = localStorage.getItem('selectedVoice');
    let selectedVoice = voices.find(v => v.name === selectedVoiceName);
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'en-US') || voices[0];
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 1.2;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  }, [voiceFeedbackEnabled]);

  const parseNumber = (word: string): number => {
    const numbers: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    return numbers[word.toLowerCase()] || parseInt(word);
  };

  const commands: VoiceCommand[] = [
    {
      patterns: ['dashboard', 'home', 'go to dashboard'],
      action: () => {
        navigate('/dashboard');
        speak('Opening dashboard');
      },
      description: 'Navigate to dashboard'
    },
    {
      patterns: ['settings', 'go to settings'],
      action: () => {
        navigate('/settings');
        speak('Opening settings');
      },
      description: 'Navigate to settings'
    },
    {
      patterns: ['leaderboard', 'rankings'],
      action: () => {
        navigate('/leaderboard');
        speak('Opening leaderboard');
      },
      description: 'Navigate to leaderboard'
    },
    {
      patterns: ['lessons', 'study materials'],
      action: () => {
        navigate('/lessons');
        speak('Opening study materials');
      },
      description: 'Navigate to study materials'
    },
    {
      patterns: ['courses', 'videos', 'video lessons'],
      action: () => {
        navigate('/student/video-lessons');
        speak('Opening courses');
      },
      description: 'Navigate to courses'
    },
    {
      patterns: ['quiz', 'quizzes', 'take quiz'],
      action: () => {
        navigate('/student/quizzes');
        speak('Opening quizzes');
      },
      description: 'Navigate to quizzes'
    },
    {
      patterns: ['ai tutor', 'tutor', 'ask ai', 'ai assistant'],
      action: () => {
        navigate('/student/ai-tutor');
        speak('Opening AI Tutor');
      },
      description: 'Navigate to AI Tutor'
    },
    {
      patterns: ['assignments', 'projects'],
      action: () => {
        navigate('/projects');
        speak('Opening assignments');
      },
      description: 'Navigate to assignments'
    },
    {
      patterns: ['community', 'discussions'],
      action: () => {
        navigate('/community');
        speak('Opening community');
      },
      description: 'Navigate to community'
    },
    {
      patterns: ['back', 'go back'],
      action: () => {
        window.history.back();
        speak('Going back');
      },
      description: 'Go back'
    },
    {
      patterns: ['scroll up', 'go up'],
      action: () => {
        window.scrollBy({ top: -300, behavior: 'smooth' });
        speak('Scrolling up');
      },
      description: 'Scroll up'
    },
    {
      patterns: ['scroll down', 'go down'],
      action: () => {
        window.scrollBy({ top: 300, behavior: 'smooth' });
        speak('Scrolling down');
      },
      description: 'Scroll down'
    },
    {
      patterns: ['help', 'commands'],
      action: () => {
        speak('Available commands: Dashboard, Settings, Courses, Quiz, Assignments, Community, Back, Scroll up, Scroll down, and more');
      },
      description: 'Show help'
    }
  ];

  const processCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    setLastCommand(transcript);

    let commandFound = false;
    for (const command of commands) {
      if (command.patterns.some(pattern => lowerTranscript.includes(pattern))) {
        command.action(transcript);
        commandFound = true;
        break;
      }
    }

    if (!commandFound) {
      speak(`Command not recognized: ${transcript}`);
    }
  }, [commands, speak]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      processCommand(transcript);
    };

    recognition.onstart = () => {
      isRecognitionActiveRef.current = true;
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isRecognitionActiveRef.current = false;
    };

    recognition.onend = () => {
      isRecognitionActiveRef.current = false;
      
      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current && !isRecognitionActiveRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.log('Could not restart:', e);
            }
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [processCommand]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      isRecognitionActiveRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Stop error:', e);
      }
      window.speechSynthesis.cancel();
      speak('Mic off');
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      window.speechSynthesis.cancel();
      
      if (!isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.start();
          speak('Listening');
        } catch (e) {
          console.log('Start error:', e);
          isListeningRef.current = false;
          setIsListening(false);
          isRecognitionActiveRef.current = false;
        }
      }
    }
  }, [speak]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
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
    lastCommand,
    toggleListening,
    commands
  };
};

