import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useVoiceNavigation = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };

  // Listen for spacebar from anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          const enabled = localStorage.getItem('voiceNavEnabled') !== 'false';
          
          if (!enabled) {
            e.preventDefault();
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance('Voice navigation is disabled. Please enable it first.');
              utterance.rate = 1.3;
              window.speechSynthesis.speak(utterance);
            }
            return;
          }
          
          e.preventDefault();
          setIsListening(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Speech recognition effect
  useEffect(() => {
    if (!isListening) return;

    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    if (!hasSpeechRecognition) {
      alert('Voice navigation is not supported in your browser. Please use Chrome, Edge, or Safari.');
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Voice navigation started');
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      
      if (!result.isFinal) {
        setTranscript(result[0].transcript);
        return;
      }

      const command = result[0].transcript.toLowerCase().trim();
      console.log('Command:', command);
      setTranscript(command);
      
      const hasAccess = (allowedRoles: string[]) => {
        return user && allowedRoles.includes(user.role);
      };

      const speak = (text: string) => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.3;
          window.speechSynthesis.speak(utterance);
        }
      };

      if (command.includes('lesson')) {
        if (hasAccess(['teacher', 'student'])) {
          speak('Going to lessons');
          navigate('/lessons');
        } else {
          speak('You do not have access to lessons page');
        }
      } else if (command.includes('quiz')) {
        if (hasAccess(['teacher', 'student'])) {
          speak('Going to quizzes');
          navigate('/quizzes');
        } else {
          speak('You do not have access to quizzes page');
        }
      } else if (command.includes('dashboard') || command.includes('home')) {
        speak('Going to dashboard');
        navigate('/dashboard');
      } else if (command.includes('setting')) {
        speak('Going to settings');
        navigate('/settings');
      } else if (command.includes('stop') || command.includes('cancel')) {
        speak('Voice navigation off');
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access.');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    };
  }, [isListening, navigate, user]);

  return {
    isListening,
    toggleListening,
    transcript,
  };
};
