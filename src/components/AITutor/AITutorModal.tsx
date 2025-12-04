import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  TextField,
  Avatar,
  Typography,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  Paper,
  Slide,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Send,
  Mic,
  MicOff,
  SmartToy,
  Person,
  Clear,
  CropSquare,
  ViewSidebar,
  Fullscreen,
  VolumeOff,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { useOllamaChat } from '../../hooks/useOllamaChat';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AITutorModalProps {
  open: boolean;
  onClose: () => void;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({ open, onClose }) => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen2.5:7b');
  const [isListening, setIsListening] = useState(false);
  const [position, setPosition] = useState<'center' | 'right' | 'left' | 'fullscreen'>('center');
  const [isSpeaking, setIsSpeaking] = useState(false);
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

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');

    try {
      const response = await sendMessage(message, selectedModel);
      
      if (window.speechSynthesis) {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 1.0;
        utterance.volume = 0.8;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const setPositionMode = (mode: 'center' | 'right' | 'left' | 'fullscreen') => {
    setPosition(mode);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth={position === 'center' ? 'md' : false}
      fullWidth={position === 'center' || position === 'fullscreen'}
      fullScreen={position === 'fullscreen'}
      PaperProps={{
        sx: position === 'right' ? {
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          m: 0,
          maxHeight: '100vh',
          width: '400px',
          borderRadius: 0,
        } : position === 'left' ? {
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          m: 0,
          maxHeight: '100vh',
          width: '400px',
          borderRadius: 0,
        } : position === 'fullscreen' ? {
          height: '100vh',
          maxHeight: '100vh',
        } : {
          height: '80vh',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'primary.main',
        color: 'white',
        py: 1.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy />
          <Typography variant="h6">AI Tutor</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* Position Icons */}
          <Tooltip title="Center">
            <IconButton 
              size="small" 
              onClick={() => setPositionMode('center')} 
              sx={{ 
                color: 'white',
                bgcolor: position === 'center' ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              <CropSquare fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Right Side">
            <IconButton 
              size="small" 
              onClick={() => setPositionMode('right')} 
              sx={{ 
                color: 'white',
                bgcolor: position === 'right' ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              <ViewSidebar fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Left Side">
            <IconButton 
              size="small" 
              onClick={() => setPositionMode('left')} 
              sx={{ 
                color: 'white',
                bgcolor: position === 'left' ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              <ViewSidebar fontSize="small" sx={{ transform: 'scaleX(-1)' }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Fullscreen">
            <IconButton 
              size="small" 
              onClick={() => setPositionMode('fullscreen')} 
              sx={{ 
                color: 'white',
                bgcolor: position === 'fullscreen' ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              <Fullscreen fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Stop Speaking */}
          {isSpeaking && (
            <Tooltip title="Stop speaking">
              <IconButton size="small" onClick={stopSpeaking} sx={{ color: 'white' }}>
                <VolumeOff fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Clear Chat */}
          <Tooltip title="Clear chat">
            <IconButton 
              size="small" 
              onClick={clearMessages} 
              sx={{ 
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                px: 1,
              }}
            >
              Clear
            </IconButton>
          </Tooltip>

          {/* Close */}
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Model Selector */}
        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel>Model</InputLabel>
          <Select
            value={selectedModel}
            label="Model"
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <MenuItem value="qwen2.5:7b">Qwen 2.5 (7B) - Recommended</MenuItem>
            <MenuItem value="qwen3:30b">Qwen 3 (30B) - Best Quality</MenuItem>
            <MenuItem value="qwen3:8b">Qwen 3 (8B)</MenuItem>
            <MenuItem value="qwen3:4b">Qwen 3 (4B) - Fastest</MenuItem>
          </Select>
        </FormControl>

        {/* Suggested Questions */}
        {messages.length === 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Try asking:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Explain this"
                size="small"
                onClick={() => setInput('Can you explain this topic?')}
              />
              <Chip
                label="Quiz me"
                size="small"
                onClick={() => setInput('Create a quiz for me')}
              />
              <Chip
                label="Examples"
                size="small"
                onClick={() => setInput('Give me examples')}
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
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                  width: 32,
                  height: 32,
                }}
              >
                {msg.role === 'user' ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '75%',
                  bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              </Paper>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                <SmartToy fontSize="small" />
              </Avatar>
              <CircularProgress size={20} />
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
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
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
      </DialogContent>
    </Dialog>
  );
};
