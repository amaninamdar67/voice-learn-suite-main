import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useVoiceNavigation = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceNavEnabled, setVoiceNavEnabled] = useState(() => {
    return localStorage.getItem('voiceNavEnabled') !== 'false';
  });
  const navigate = useNavigate();
  
  // Listen for voice nav enabled/disabled events
  useEffect(() => {
    const handleVoiceNavToggle = () => {
      const enabled = localStorage.getItem('voiceNavEnabled') !== 'false';
      setVoiceNavEnabled(enabled);
      
      // If disabled and currently listening, stop immediately
      if (!enabled && isListening) {
        setIsListening(false);
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
    };

    window.addEventListener('voiceNavToggled', handleVoiceNavToggle);
    return () => window.removeEventListener('voiceNavToggled', handleVoiceNavToggle);
  }, [isListening]);
  
  // Spacebar toggle (single tap on/off) - now reactive to voiceNavEnabled
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        // Only trigger if not in input field
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          // Check if voice nav is enabled (using state, not localStorage)
          if (!voiceNavEnabled) {
            console.log('🚫 Voice navigation is disabled - Spacebar blocked');
            e.preventDefault(); // Prevent default but don't toggle
            return;
          }
          
          e.preventDefault();
          
          // Toggle voice navigation
          setIsListening(prev => {
            const newState = !prev;
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(
                newState ? 'Voice navigation on' : 'Voice navigation off'
              );
              utterance.rate = 1.5;
              utterance.volume = 0.8;
              window.speechSynthesis.speak(utterance);
            }
            console.log(newState ? '🎤 Voice navigation ON' : '🛑 Voice navigation OFF');
            return newState;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [voiceNavEnabled]); // Re-create listener when voiceNavEnabled changes

  useEffect(() => {
    if (!isListening) return;

    // Check for speech recognition support
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    console.log('Checking speech recognition support...');
    console.log('SpeechRecognition:', 'SpeechRecognition' in window);
    console.log('webkitSpeechRecognition:', 'webkitSpeechRecognition' in window);
    console.log('Browser:', navigator.userAgent);
    
    if (!hasSpeechRecognition) {
      console.error('❌ Speech recognition NOT supported in this browser');
      const message = `Voice navigation is not supported in your browser.

Please use:
• Google Chrome (recommended)
• Microsoft Edge (Chromium version)
• Safari (Mac/iOS)

Current browser: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown'}

Note: Make sure you're using the latest version!`;
      
      alert(message);
      setIsListening(false);
      return;
    }
    
    console.log('✅ Speech recognition is supported!');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show interim results
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started - Say a command!');
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      
      // Only process final results
      if (!result.isFinal) {
        const interim = result[0].transcript;
        console.log('Hearing:', interim);
        setTranscript(interim);
        return;
      }

      const command = result[0].transcript.toLowerCase().trim();
      console.log('✅ Final command received:', command);
      setTranscript(command);
      
      // Helper function to announce navigation
      const announceNavigation = (pageName: string) => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(`Going to ${pageName}`);
            utterance.rate = 1.5;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
          }, 300);
        }
      };

      // Handle voice commands with more flexible matching
      if (command.includes('lesson')) {
        console.log('➡️ Navigating to lessons');
        announceNavigation('lessons');
        navigate('/lessons');
        // Don't turn off - keep listening!
      } else if (command.includes('quiz')) {
        console.log('➡️ Navigating to quizzes');
        announceNavigation('quizzes');
        navigate('/quizzes');
      } else if (command.includes('project')) {
        console.log('➡️ Navigating to projects');
        announceNavigation('projects');
        navigate('/projects');
      } else if (command.includes('video')) {
        console.log('➡️ Navigating to videos');
        announceNavigation('videos');
        navigate('/videos');
      } else if (command.includes('discussion')) {
        console.log('➡️ Navigating to discussions');
        announceNavigation('discussions');
        navigate('/discussions');
      } else if (command.includes('dashboard') || command.includes('home')) {
        console.log('➡️ Navigating to dashboard');
        announceNavigation('dashboard');
        navigate('/dashboard');
      } else if (command.includes('setting')) {
        console.log('➡️ Navigating to settings');
        announceNavigation('settings');
        navigate('/settings');
      } else if (command.includes('tutor') || command.includes('ai')) {
        console.log('➡️ Opening AI tutor');
        announceNavigation('AI tutor');
        window.dispatchEvent(new Event('open-ai-tutor'));
      } else if (command.includes('read') && !command.includes('open')) {
        // Check if it's a general read command or read titles
        if (command.includes('list') || command.includes('title') || command === 'read') {
          // Trigger read titles event
          console.log('📖 Reading page titles');
          window.dispatchEvent(new CustomEvent('voice-read-titles'));
        } else {
          // Read specific text - extract what to read
          const textToRead = command.replace('read', '').trim();
          if (textToRead) {
            console.log('📖 Reading:', textToRead);
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(textToRead);
              utterance.rate = 1.3;
              utterance.volume = 0.8;
              window.speechSynthesis.speak(utterance);
            }
          } else {
            // Just "read" - trigger read titles
            window.dispatchEvent(new CustomEvent('voice-read-titles'));
          }
        }
      } else if (command.includes('list')) {
        // Trigger read titles event
        console.log('📖 Listing page content');
        window.dispatchEvent(new CustomEvent('voice-read-titles'));
      } else if (command.includes('open')) {
        // Dispatch command to page-specific handler
        console.log('📂 Opening specific item:', command);
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command } }));
      } else if (command.includes('what') || command.includes('where') || command.includes('how')) {
        // Answer questions about the page
        if (command.includes('where am i') || command.includes('what page')) {
          const pageName = window.location.pathname.split('/').pop() || 'home';
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(`You are on the ${pageName} page`);
            utterance.rate = 1.3;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
          }
        } else if (command.includes('what can i do') || command.includes('help')) {
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('You can say: lessons, videos, quiz, projects, dashboard, read to list items, open followed by a number, or stop to turn off voice navigation');
            utterance.rate = 1.3;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
          }
        } else {
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('I can help you navigate. Say lessons, videos, quiz, or read to list items on this page');
            utterance.rate = 1.3;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
          }
        }
      } else if (command.includes('stop') || command.includes('cancel') || command.includes('close')) {
        console.log('🛑 Stopping voice navigation');
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance('Voice navigation off');
          utterance.rate = 1.5;
          utterance.volume = 0.8;
          window.speechSynthesis.speak(utterance);
        }
        setIsListening(false);
      } else {
        console.log('❓ Command not recognized:', command);
        setTranscript(command + ' (say: lessons, quiz, read, or open)');
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance('Command not recognized. Try saying lessons, videos, read, or open followed by a number');
          utterance.rate = 1.3;
          utterance.volume = 0.7;
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        console.log('No speech detected - still listening...');
      } else if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone in browser settings.');
        setIsListening(false);
      } else {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      // Don't auto-restart, let user control it
    };

    try {
      recognition.start();
      console.log('🎤 Starting speech recognition...');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }

    return () => {
      try {
        recognition.stop();
        console.log('🛑 Stopped speech recognition');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    };
  }, [isListening, navigate]);

  const toggleListening = () => {
    setIsListening(prev => {
      const newState = !prev;
      
      // Audio feedback
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          newState ? 'Voice navigation on' : 'Voice navigation off'
        );
        utterance.rate = 1.5;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
      
      if (!newState) {
        setTranscript('');
      }
      
      console.log(newState ? '🎤 Voice navigation ON' : '🛑 Voice navigation OFF');
      
      return newState;
    });
  };

  return {
    isListening,
    toggleListening,
    transcript,
  };
};
