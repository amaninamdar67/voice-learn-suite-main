import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ContentItem {
  title: string;
  index: number;
}

export const useVoiceContent = (items: ContentItem[], onItemSelect: (index: number) => void) => {
  const location = useLocation();

  useEffect(() => {
    const handleReadTitles = () => {
      console.log('📖 Reading titles, items:', items.length);
      
      if (items.length === 0) {
        speak('No items found on this page');
        return;
      }

      // Read all titles
      const titles = items.map((item, idx) => `${idx + 1}. ${item.title}`).join('. ');
      const message = `Found ${items.length} items. ${titles}. Say open followed by the number to select an item.`;
      
      console.log('Speaking:', message);
      speak(message);
    };

    const handleVoiceCommand = (event: Event) => {
      const customEvent = event as CustomEvent;
      const command = customEvent.detail?.command?.toLowerCase() || '';
      
      console.log('🎤 Voice command received in useVoiceContent:', command);
      console.log('Available items:', items.length);

      // Handle "open [number]" or "open [title]"
      if (command.includes('open')) {
        // Extract number first
        const numberMatch = command.match(/\d+/);
        if (numberMatch) {
          const index = parseInt(numberMatch[0]) - 1;
          console.log('Trying to open item at index:', index);
          
          if (index >= 0 && index < items.length) {
            console.log('✅ Opening item:', items[index].title);
            speak(`Opening ${items[index].title}`);
            setTimeout(() => {
              onItemSelect(index);
            }, 500);
            return;
          } else {
            console.log('❌ Index out of range');
            speak(`Item ${index + 1} not found. There are only ${items.length} items.`);
            return;
          }
        }

        // Try to match by title (partial match)
        const searchTerm = command.replace('open', '').trim();
        console.log('Searching for:', searchTerm);
        
        const matchedItem = items.find(item => 
          item.title.toLowerCase().includes(searchTerm) ||
          searchTerm.includes(item.title.toLowerCase())
        );
        
        if (matchedItem) {
          console.log('✅ Found matching item:', matchedItem.title);
          speak(`Opening ${matchedItem.title}`);
          setTimeout(() => {
            onItemSelect(matchedItem.index);
          }, 500);
        } else {
          console.log('❌ No matching item found');
          speak('Item not found. Please say the number or part of the title.');
        }
      }
    };

    window.addEventListener('voice-read-titles', handleReadTitles);
    window.addEventListener('voice-command', handleVoiceCommand);

    return () => {
      window.removeEventListener('voice-read-titles', handleReadTitles);
      window.removeEventListener('voice-command', handleVoiceCommand);
    };
  }, [items, onItemSelect, location]);
};

function speak(text: string, rate: number = 1.3) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }
  console.log('🔊 Speaking:', text);
}
