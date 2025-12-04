import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Send,
  Mic,
  MicOff,
  SmartToy,
  Person,
  Clear,
} from '@mui/icons-material';
import { useOllamaChat } from '../../hooks/useOllamaChat';

export const AITutorChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen2.5:7b');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { messages, isLoading, error, sendMessage, clearMessages } = useOllamaChat();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');

    try {
      const response = await sendMessage(message, selectedModel);
      
      // Speak the response
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 1.0;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy color="primary" />
          <Typography variant="h6">AI Tutor</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={selectedModel}
              label="Model"
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <MenuItem value="qwen2.5:7b">Qwen 2.5 (7B)</MenuItem>
              <MenuItem value="qwen3:30b">Qwen 3 (30B)</MenuItem>
              <MenuItem value="qwen3:8b">Qwen 3 (8B)</MenuItem>
              <MenuItem value="qwen3:4b">Qwen 3 (4B)</MenuItem>
              <MenuItem value="qwen3-vl:30b">Qwen 3 Vision (30B)</MenuItem>
              <MenuItem value="qwen3-vl:8b">Qwen 3 Vision (8B)</MenuItem>
              <MenuItem value="qwen3-vl:4b">Qwen 3 Vision (4B)</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton onClick={clearMessages} size="small" title="Clear chat">
            <Clear />
          </IconButton>
        </Box>
      </Box>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Try asking:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Explain this topic"
              size="small"
              onClick={() => setInput('Can you explain this topic in simple terms?')}
            />
            <Chip
              label="Quiz me"
              size="small"
              onClick={() => setInput('Can you create a quiz to test my understanding?')}
            />
            <Chip
              label="Summarize"
              size="small"
              onClick={() => setInput('Can you summarize the key points?')}
            />
            <Chip
              label="Give examples"
              size="small"
              onClick={() => setInput('Can you give me some examples?')}
            />
          </Box>
        </Box>
      )}

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 1,
              mb: 2,
              alignItems: 'flex-start',
            }}
          >
            <Avatar sx={{ bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main' }}>
              {msg.role === 'user' ? <Person /> : <SmartToy />}
            </Avatar>
            <Paper
              sx={{
                p: 2,
                flex: 1,
                bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <SmartToy />
            </Avatar>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              AI is thinking...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Typography color="error" variant="body2">
            Error: {error}
          </Typography>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything... (or use voice)"
          disabled={isLoading}
        />
        <IconButton
          color={isListening ? 'error' : 'default'}
          onClick={toggleVoiceInput}
          disabled={isLoading}
        >
          {isListening ? <MicOff /> : <Mic />}
        </IconButton>
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
};
