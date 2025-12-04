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
  const [isWakeWordMode, setIsWakeWordMode] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionActiveRef = useRef(false);
  const isListeningRef = useRef(false);
  
  // Check if voice feedback is enabled (default: OFF to prevent loops)
  const voiceFeedbackEnabled = localStorage.getItem('voiceFeedbackEnabled') === 'true';

  // Voice feedback with Hindi as default
  const speak = useCallback((text: string) => {
    // Skip if voice feedback is disabled
    if (!voiceFeedbackEnabled) return;
    
    // CRITICAL: Stop recognition while speaking to prevent feedback loop
    const wasListening = isRecognitionActiveRef.current;
    if (wasListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        isRecognitionActiveRef.current = false;
      } catch (e) {
        console.log('Could not stop for speech');
      }
    }
    
    // Cancel any ongoing speech first to prevent overlap
    window.speechSynthesis.cancel();
    
    // Small delay to ensure cancellation completes
    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Voices not loaded yet, wait and retry
        window.speechSynthesis.onvoiceschanged = () => {
          speak(text);
        };
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get selected voice from localStorage or use Hindi as default
      const selectedVoiceName = localStorage.getItem('selectedVoice');
      
      let selectedVoice;
      if (selectedVoiceName) {
        selectedVoice = voices.find(v => v.name === selectedVoiceName);
      }
      
      // Default to Google Hindi if no selection or voice not found
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.name.includes('Google हिन्दी') || 
          v.name.includes('Google Hindi')
        ) || voices.find(v => v.lang.startsWith('hi')) || voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Consistent settings
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // CRITICAL: Restart recognition after speech ends
      utterance.onend = () => {
        if (wasListening && isListeningRef.current && recognitionRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && !isRecognitionActiveRef.current) {
              try {
                recognitionRef.current?.start();
                console.log('🔄 Restarted after speech');
              } catch (e) {
                console.log('Could not restart after speech');
              }
            }
          }, 300);
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [voiceFeedbackEnabled]);

  // Command definitions
  const commands: VoiceCommand[] = [
    // === NAVIGATION COMMANDS (Sidebar Pages) ===
    {
      patterns: [
        'go to dashboard', 'open dashboard', 'dashboard', 'home',
        'dash board', 'dash', 'dashbord', 'dasboard'
      ],
      action: () => {
        navigate('/dashboard');
        speak('Opening dashboard');
      },
      description: 'Navigate to dashboard'
    },
    {
      patterns: [
        'go to settings', 'open settings', 'settings', 'setting',
        'setings', 'seting', 'settins'
      ],
      action: () => {
        navigate('/settings');
        speak('Opening settings');
      },
      description: 'Navigate to settings'
    },
    {
      patterns: [
        'go to leaderboard', 'open leaderboard', 'leaderboard', 'leader board',
        'rankings', 'ranking', 'rank', 'leaderboards', 'leader'
      ],
      action: () => {
        navigate('/leaderboard');
        speak('Opening leaderboard');
      },
      description: 'Navigate to leaderboard'
    },
    {
      patterns: [
        'go to study materials', 'open study materials', 'study materials',
        'study material', 'study', 'materials', 'recourses', 'resources',
        'lessons', 'my lessons', 'lesson', 'study matriels', 'study meterial'
      ],
      action: () => {
        navigate('/lessons');
        speak('Opening study materials');
      },
      description: 'Navigate to study materials'
    },
    {
      patterns: [
        'go to courses', 'open courses', 'courses', 'course',
        'video lessons', 'video lesson', 'videos', 'video',
        'corses', 'cources', 'coarses'
      ],
      action: () => {
        navigate('/student/video-lessons');
        speak('Opening courses');
      },
      description: 'Navigate to courses'
    },
    {
      patterns: [
        'go to take quiz', 'open take quiz', 'take quiz', 'quiz',
        'quizzes', 'my quizzes', 'quizes', 'quis', 'quizz'
      ],
      action: () => {
        navigate('/student/quizzes');
        speak('Opening take quiz');
      },
      description: 'Navigate to take quiz'
    },
    {
      patterns: [
        'go to assignments', 'open assignments', 'assignments', 'assignment',
        'my assignments', 'projects', 'project', 'asignments', 'assigments'
      ],
      action: () => {
        navigate('/projects');
        speak('Opening assignments');
      },
      description: 'Navigate to assignments'
    },
    {
      patterns: [
        'go to community', 'open community', 'community', 'comunity',
        'discussions', 'discussion', 'comuniti', 'communitty'
      ],
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

    // === STUDENT MODULE OPTIMIZED COMMANDS ===
    {
      patterns: [
        'open recorded videos', 'recorded videos', 'recorded classes', 
        'open recorded classes', 'recorded videos page', 'recorded classes page',
        'go to recorded videos', 'go to recorded classes', 'recorded', 'record',
        'recorded class', 'record class', 'recoded', 'recoreded'
      ],
      action: () => {
        navigate('/student/recorded-videos');
        speak('Opening recorded classes');
      },
      description: 'Navigate to recorded videos (Student)'
    },
    {
      patterns: [
        'open courses', 'courses', 'courses page', 'course',
        'go to courses', 'video lessons', 'open video lessons',
        'corses', 'cources', 'coarses'
      ],
      action: () => {
        navigate('/student/video-lessons');
        speak('Opening courses');
      },
      description: 'Navigate to courses (Student)'
    },
    {
      patterns: [
        'open live classes', 'live classes', 'live classes page', 'live class',
        'go to live classes', 'join live class', 'live sessions', 'live',
        'life classes', 'live clas', 'life class'
      ],
      action: () => {
        navigate('/student/live-classes');
        speak('Opening live classes');
      },
      description: 'Navigate to live classes (Student)'
    },
    {
      patterns: [
        'open student quizzes', 'student quizzes', 'my quizzes page',
        'go to student quizzes', 'take quiz', 'quiz page', 'quiz',
        'quizes', 'quis', 'quizz'
      ],
      action: () => {
        navigate('/student/quizzes');
        speak('Opening take quiz');
      },
      description: 'Navigate to quizzes (Student)'
    },
    {
      patterns: [
        'open quiz rankings', 'quiz rankings', 'quiz leaderboard', 'quiz ranking',
        'go to quiz rankings', 'quiz rankings page', 'quiz scores', 'quiz rank',
        'quis rankings', 'quizz rankings'
      ],
      action: () => {
        navigate('/student/quiz-rankings');
        speak('Opening quiz rankings');
      },
      description: 'Navigate to quiz rankings (Student)'
    },
    {
      patterns: [
        'open overall rankings', 'overall rankings', 'overall leaderboard', 'overall ranking',
        'go to overall rankings', 'overall rankings page', 'my rank', 'overall',
        'over all rankings', 'overall rank'
      ],
      action: () => {
        navigate('/student/overall-rankings');
        speak('Opening overall rankings');
      },
      description: 'Navigate to overall rankings (Student)'
    },
    {
      patterns: [
        'open student assignments', 'student assignments', 'my assignments page',
        'go to student assignments', 'view assignments', 'assignments page',
        'assignment', 'asignments', 'assigments'
      ],
      action: () => {
        navigate('/student/assignments');
        speak('Opening assignments');
      },
      description: 'Navigate to assignments (Student)'
    },
    {
      patterns: [
        'continue watching', 'resume watching', 'continue learning',
        'open continue watching', 'read continue watching'
      ],
      action: () => {
        speak('Reading continue watching section');
        window.dispatchEvent(new CustomEvent('readComponent', { 
          detail: { name: 'continue watching' } 
        }));
      },
      description: 'Read continue watching section'
    },
    {
      patterns: [
        'my progress', 'show progress', 'read progress',
        'open progress', 'check progress', 'progress section'
      ],
      action: () => {
        speak('Reading your progress');
        window.dispatchEvent(new CustomEvent('readComponent', { 
          detail: { name: 'progress' } 
        }));
      },
      description: 'Read progress section'
    },
    {
      patterns: [
        'recent activity', 'show activity', 'read activity',
        'my activity', 'recent activity section'
      ],
      action: () => {
        speak('Reading recent activity');
        window.dispatchEvent(new CustomEvent('readComponent', { 
          detail: { name: 'recent activity' } 
        }));
      },
      description: 'Read recent activity section'
    },
    {
      patterns: [
        'statistics', 'my statistics', 'show statistics',
        'read statistics', 'stats', 'my stats'
      ],
      action: () => {
        speak('Reading statistics');
        window.dispatchEvent(new CustomEvent('readComponent', { 
          detail: { name: 'statistics' } 
        }));
      },
      description: 'Read statistics section'
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

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // IMPORTANT: continuous must be true AND we need proper restart logic
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
      console.log('🎤 Recognition started');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isRecognitionActiveRef.current = false;
      
      // Handle specific errors
      if (event.error === 'aborted') {
        console.log('Recognition aborted - will not restart');
        return;
      }
      
      // For other errors, if user wants mic on, restart after delay (use ref)
      if (isListeningRef.current && event.error === 'no-speech') {
        setTimeout(() => {
          if (isListeningRef.current && !isRecognitionActiveRef.current) {
            try {
              recognition.start();
              console.log('🔄 Restarted after no-speech');
            } catch (e) {
              console.log('Could not restart');
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('🛑 Recognition ended');
      isRecognitionActiveRef.current = false;
      
      // CRITICAL: Restart if user still wants mic on (use ref, not state)
      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current && !isRecognitionActiveRef.current) {
            try {
              recognition.start();
              console.log('🔄 Restarted recognition');
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
          // Ignore errors on cleanup
        }
      }
    };
  }, [processCommand]); // Removed isListening dependency to prevent recreation

  // SIMPLE toggle - just ON or OFF
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListeningRef.current) {
      // Turn OFF
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
      // Turn ON
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
