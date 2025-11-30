import { useState, useEffect } from 'react';
import { VoiceSettings } from '../types';

export const useSpeech = (settings?: VoiceSettings) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select voice based on settings
    if (settings?.voiceType && voices.length > 0) {
      const selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(settings.voiceType)
      ) || voices[0];
      utterance.voice = selectedVoice;
    }

    utterance.rate = settings?.speed || 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return {
    speak,
    stop,
    isSpeaking,
    voices,
  };
};
