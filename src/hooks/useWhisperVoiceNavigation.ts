import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface VoiceCommand {
  patterns: string[];
  action: (transcript: string) => void;
  description: string;
}

export const useWhisperVoiceNavigation = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isListeningRef = useRef(false);

  const voiceFeedbackEnabled = localStorage.getItem('voiceFeedbackEnabled') !== 'false';

  // Voice feedback
  const speak = useCallback((text: string) => {
    if (!voiceFeedbackEnabled) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
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

  // Helper: Convert word numbers to digits
  const parseNumber = (word: string): number => {
    const numbers: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    return numbers[word.toLowerCase()] || parseInt(word);
  };

  // Command definitions (same as before)
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
      patterns: ['leaderboard', 'rankings', 'go to leaderboard'],
      action: () => {
        navigate('/leaderboard');
        speak('Opening leaderboard');
      },
      description: 'Navigate to leaderboard'
    },
    {
      patterns: ['lessons', 'study materials', 'go to lessons'],
      action: () => {
        navigate('/lessons');
        speak('Opening study materials');
      },
      description: 'Navigate to study materials'
    },
    {
      patterns: ['courses', 'video lessons', 'videos'],
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
      patterns: ['recorded videos', 'recorded classes'],
      action: () => {
        navigate('/student/recorded-videos');
        speak('Opening recorded classes');
      },
      description: 'Navigate to recorded videos'
    },
    {
      patterns: ['live classes', 'live'],
      action: () => {
        navigate('/student/live-classes');
        speak('Opening live classes');
      },
      description: 'Navigate to live classes'
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
      patterns: ['read page', 'read headings'],
      action: () => {
        speak('Reading page headings');
        window.dispatchEvent(new Event('readHeadings'));
      },
      description: 'Read page headings'
    },
    {
      patterns: ['stop reading', 'stop'],
      action: () => {
        window.speechSynthesis.cancel();
        speak('Stopped');
      },
      description: 'Stop reading'
    },
    {
      patterns: ['help', 'commands'],
      action: () => {
        speak('Available commands: Dashboard, Settings, Courses, Quiz, Assignments, Community, Back, Scroll up, Scroll down, Read page, and more');
      },
      description: 'Show help'
    }
  ];

  // Process command
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

  // Send audio to Whisper server
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('http://localhost:3002/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      if (data.transcript) {
        processCommand(data.transcript);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio');
      speak('Transcription failed');
    }
  }, [processCommand, speak]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        transcribeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording');
      speak('Microphone access denied');
    }
  }, [transcribeAudio, speak]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Toggle listening (continuous mode)
  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      // Turn OFF
      isListeningRef.current = false;
      setIsListening(false);
      stopRecording();
      speak('Mic off');
    } else {
      // Turn ON
      isListeningRef.current = true;
      setIsListening(true);
      speak('Listening');
      startContinuousListening();
    }
  }, [speak, stopRecording]);

  // Continuous listening loop
  const startContinuousListening = useCallback(async () => {
    while (isListeningRef.current) {
      await startRecording();
      
      // Record for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      stopRecording();
      
      // Wait 500ms before next recording
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [startRecording, stopRecording]);

  // Spacebar toggle
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
    isRecording,
    lastCommand,
    error,
    toggleListening,
    commands
  };
};
