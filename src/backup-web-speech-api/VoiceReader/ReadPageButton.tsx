import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ReadPageButton = () => {
  const [isReading, setIsReading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const readPageContent = async () => {
    if (isReading && audio) {
      // Stop reading
      audio.pause();
      setAudio(null);
      setIsReading(false);
      return;
    }

    try {
      setIsReading(true);

      // Get all text content from the page
      const mainContent = document.querySelector('main') || document.body;
      const textContent = mainContent.innerText;

      // Send to voice server
      const response = await fetch('http://localhost:3003/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textContent })
      });

      if (!response.ok) throw new Error('Failed to generate speech');

      // Play the audio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      
      audioElement.onended = () => {
        setIsReading(false);
        setAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audioElement.play();
      setAudio(audioElement);
    } catch (error) {
      console.error('Read page error:', error);
      setIsReading(false);
    }
  };

  return (
    <Button
      onClick={readPageContent}
      variant={isReading ? 'destructive' : 'outline'}
      size="sm"
      className="gap-2"
    >
      {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {isReading ? 'Stop Reading' : 'Read Page'}
    </Button>
  );
};
