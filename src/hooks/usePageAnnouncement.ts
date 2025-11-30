import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageAnnouncement = (isVoiceNavActive: boolean) => {
  const location = useLocation();

  useEffect(() => {
    // Only announce if voice navigation is active
    if (!isVoiceNavActive) return;
    
    // Announce page changes for blind users
    const pageName = location.pathname.split('/').pop() || 'home';
    const announcement = `${pageName.replace('-', ' ')} page`;
    
    // Use speech synthesis to announce
    if (window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create and speak announcement
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 1.3;
      utterance.volume = 0.7;
      
      // Small delay to ensure page is ready
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 300);
    }
  }, [location, isVoiceNavActive]);
};
