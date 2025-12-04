import { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, Slider, Button, FormControl, InputLabel, Paper, Alert } from '@mui/material';
import { VolumeUp, PlayArrow, Save } from '@mui/icons-material';

interface VoiceSettings {
  voiceName: string;
  rate: number;
  pitch: number;
  volume: number;
}

export const VoiceSettingsPanel = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('voiceSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default settings - will be updated when voices load
    return {
      voiceName: '',
      rate: 0.85,
      pitch: 1.0,
      volume: 1.0
    };
  });

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      // Filter to only show the 4 specific voices
      const allowedVoices = availableVoices.filter(v => 
        v.name === 'Google हिन्दी' ||  // Google Hindi (default)
        v.name === 'Google US English' ||  // Google US English
        v.name === 'Google UK English Female' ||  // Google UK Female
        v.name === 'Google UK English Male'  // Google UK Male
      );
      
      setVoices(allowedVoices);
      
      // Set Google Hindi as default if not set
      if (!settings.voiceName && allowedVoices.length > 0) {
        const hindiVoice = allowedVoices.find(v => v.name === 'Google हिन्दी');
        if (hindiVoice) {
          const newSettings = { ...settings, voiceName: hindiVoice.name };
          setSettings(newSettings);
          localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
          localStorage.setItem('selectedVoice', hindiVoice.name);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSettingChange = (key: keyof VoiceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
    
    // Also save voice name separately for easy access
    if (key === 'voiceName') {
      localStorage.setItem('selectedVoice', value);
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('voiceSettingsChanged', { detail: newSettings }));
  };

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance(
      'Hello! This is how I will sound. I am speaking clearly with good pronunciation. You can adjust the speed, pitch, and volume to your preference.'
    );
    
    const selectedVoice = voices.find(v => v.name === settings.voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VolumeUp /> Voice Settings
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Voice Selection - Only 4 Voices */}
        <FormControl fullWidth>
          <InputLabel>Voice</InputLabel>
          <Select
            value={voices.length > 0 ? settings.voiceName : ''}
            label="Voice"
            onChange={(e) => handleSettingChange('voiceName', e.target.value)}
          >
            {voices.length === 0 ? (
              <MenuItem value="">Loading voices...</MenuItem>
            ) : (
              voices.map((voice) => (
                <MenuItem key={voice.name} value={voice.name}>
                  {voice.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Speed Control */}
        <Box>
          <Typography gutterBottom>
            Speed: {settings.rate.toFixed(2)}x {settings.rate <= 0.85 ? '(Clear & Easy to Understand)' : settings.rate <= 1.0 ? '(Natural)' : '(Fast)'}
          </Typography>
          <Slider
            value={settings.rate}
            onChange={(_, value) => handleSettingChange('rate', value)}
            min={0.5}
            max={2.0}
            step={0.05}
            marks={[
              { value: 0.75, label: 'Clear' },
              { value: 0.85, label: 'Best' },
              { value: 1.0, label: 'Normal' },
              { value: 1.5, label: 'Fast' }
            ]}
          />
        </Box>

        {/* Pitch Control */}
        <Box>
          <Typography gutterBottom>
            Pitch: {settings.pitch.toFixed(1)}
          </Typography>
          <Slider
            value={settings.pitch}
            onChange={(_, value) => handleSettingChange('pitch', value)}
            min={0.5}
            max={2.0}
            step={0.1}
            marks={[
              { value: 0.5, label: 'Low' },
              { value: 1.0, label: 'Normal' },
              { value: 2.0, label: 'High' }
            ]}
          />
        </Box>

        {/* Volume Control */}
        <Box>
          <Typography gutterBottom>
            Volume: {Math.round(settings.volume * 100)}%
          </Typography>
          <Slider
            value={settings.volume}
            onChange={(_, value) => handleSettingChange('volume', value)}
            min={0}
            max={1}
            step={0.1}
            marks={[
              { value: 0, label: 'Mute' },
              { value: 0.5, label: '50%' },
              { value: 1, label: '100%' }
            ]}
          />
        </Box>

        {/* Save Message */}
        {saveMessage && (
          <Alert severity="success" onClose={() => setSaveMessage('')}>
            {saveMessage}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={testVoice}
            fullWidth
          >
            Test Voice
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => {
              setSaveMessage('Voice settings saved! No need to refresh.');
              setTimeout(() => setSaveMessage(''), 3000);
            }}
            fullWidth
          >
            Save Settings
          </Button>
        </Box>

        {/* Quality Tips */}
        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🎯 Voice Settings:
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Default: Google हिंदी (Hindi)
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Also available: US English, UK English Female, UK English Male
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Speed 0.85x recommended for clear speech
          </Typography>
          <Typography variant="body2">
            • Use Chrome browser for best quality
          </Typography>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ✅ Auto-Save Enabled
          </Typography>
          <Typography variant="body2">
            Your voice settings are automatically saved as you adjust them. No need to refresh the page!
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
