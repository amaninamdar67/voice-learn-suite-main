import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageAnnouncement = (isVoiceNavActive: boolean) => {
  const location = useLocation();

  useEffect(() => {
    // DISABLED: Commands already announce page changes
    // This was causing double announcements
    return;
    
    // Announce page changes for blind users
    const pageName = location.pathname.split('/').pop() || 'home';
    const announcement = `${pageName.replace('-', ' ')} page`;
    
    // Use speech synthesis to announce with Hindi voice
    if (window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Wait for voices to load
      const speak = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;
        
        const utterance = new SpeechSynthesisUtterance(announcement);
        
        // Use selected voice from localStorage or Hindi default
        const selectedVoiceName = localStorage.getItem('selectedVoice');
        let selectedVoice = voices.find(v => v.name === selectedVoiceName);
        
        // Default to Google Hindi if no selection
        if (!selectedVoice) {
          selectedVoice = voices.find(v => 
            v.name.includes('Google हिन्दी') || 
            v.name.includes('Google Hindi')
          ) || voices.find(v => v.lang.startsWith('hi')) || voices[0];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.rate = 1.0;
        utterance.volume = 1.0;
        
        window.speechSynthesis.speak(utterance);
      };
      
      // Small delay to ensure page is ready
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          speak();
        } else {
          window.speechSynthesis.onvoiceschanged = speak;
        }
      }, 300);
    }
  }, [location, isVoiceNavActive]);
};
