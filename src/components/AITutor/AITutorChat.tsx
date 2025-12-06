import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Fab,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Send,
  SmartToy,
  Mic,
  VolumeUp,
  Stop,
} from '@mui/icons-material';
import { useSpeech } from '../../hooks/useSpeech';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const AITutorChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Tutor. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isSpeaking } = useSpeech();

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-ai-tutor', handleOpen);
    return () => window.removeEventListener('open-ai-tutor', handleOpen);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I could not generate a response. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Make sure Ollama is running with: ollama run tinyllama:1.1b',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Implement speech recognition here
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <>
      {/* Floating button hidden - AI Tutor accessible via top bar and voice commands */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: 'none', // Hidden but component still works
        }}
        onClick={() => setOpen(true)}
      >
        <SmartToy />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SmartToy />
            </Avatar>
            <Typography variant="h6">AI Tutor</Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                  {message.sender === 'ai' && (
                    <IconButton
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handleSpeak(message.text)}
                    >
                      {isSpeaking ? <Stop fontSize="small" /> : <VolumeUp fontSize="small" />}
                    </IconButton>
                  )}
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        </DialogContent>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              color={isRecording ? 'error' : 'default'}
              onClick={handleVoiceInput}
            >
              <Mic />
            </IconButton>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
