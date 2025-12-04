import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Alert,
} from '@mui/material';
import { VolumeUp, Mic } from '@mui/icons-material';

export const VoiceSettingsPanel: React.FC = () => {
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(
    localStorage.getItem('voiceFeedbackEnabled') !== 'false'
  );
  const [selectedVoice, setSelectedVoice] = useState(
    localStorage.getItem('selectedVoice') || ''
  );
  const [speechRate, setSpeechRate] = useState(
    parseFloat(localStorage.getItem('speechRate') || '1.2')
  );
  const [speechVolume, setSpeechVolume] = useState(
    parseFloat(localStorage.getItem('speechVolume') || '0.8')
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testMessage, setTestMessage] = useState('');

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice if none selected
      if (!selectedVoice && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(v => v.lang === 'en-US') || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
        localStorage.setItem('selectedVoice', defaultVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  // Save settings
  const handleVoiceFeedbackToggle = (enabled: boolean) => {
    setVoiceFeedbackEnabled(enabled);
    localStorage.setItem('voiceFeedbackEnabled', enabled.toString());
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    localStorage.setItem('selectedVoice', voiceName);
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem('speechRate', rate.toString());
  };

  const handleVolumeChange = (volume: number) => {
    setSpeechVolume(volume);
    localStorage.setItem('speechVolume', volume.toString());
  };

  // Test voice
  const testVoice = () => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(
      'This is a test of your voice settings. How does it sound?'
    );
    
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    
    utterance.onstart = () => setTestMessage('Playing...');
    utterance.onend = () => setTestMessage('Test complete!');
    utterance.onerror = () => setTestMessage('Error playing voice');
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VolumeUp sx={{ mr: 1 }} />
        <Typography variant="h6">Voice Navigation Settings</Typography>
      </Box>

      {/* Voice Feedback Toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={voiceFeedbackEnabled}
            onChange={(e) => handleVoiceFeedbackToggle(e.target.checked)}
          />
        }
        label="Enable Voice Feedback"
        sx={{ mb: 3 }}
      />

      {voiceFeedbackEnabled && (
        <>
          {/* Voice Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Voice</InputLabel>
            <Select
              value={selectedVoice}
              label="Voice"
              onChange={(e) => handleVoiceChange(e.target.value)}
            >
              {voices.map((voice) => (
                <MenuItem key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Speech Rate */}
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Speech Rate: {speechRate.toFixed(1)}x
            </Typography>
            <Slider
              value={speechRate}
              onChange={(_, value) => handleRateChange(value as number)}
              min={0.5}
              max={2.0}
              step={0.1}
              marks={[
                { value: 0.5, label: '0.5x' },
                { value: 1.0, label: '1.0x' },
                { value: 1.5, label: '1.5x' },
                { value: 2.0, label: '2.0x' },
              ]}
            />
          </Box>

          {/* Speech Volume */}
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Volume: {Math.round(speechVolume * 100)}%
            </Typography>
            <Slider
              value={speechVolume}
              onChange={(_, value) => handleVolumeChange(value as number)}
              min={0}
              max={1}
              step={0.1}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
              ]}
            />
          </Box>

          {/* Test Button */}
          <Button
            variant="contained"
            startIcon={<Mic />}
            onClick={testVoice}
            fullWidth
            sx={{ mb: 2 }}
          >
            Test Voice
          </Button>

          {testMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {testMessage}
            </Alert>
          )}
        </>
      )}

      {/* Info */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Voice Navigation:</strong> Press SPACEBAR to toggle the microphone.
          Speak commands like "dashboard", "settings", "courses", etc.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Whisper AI:</strong> Using offline Whisper model for accurate voice recognition.
          No internet required!
        </Typography>
      </Alert>
    </Paper>
  );
};
