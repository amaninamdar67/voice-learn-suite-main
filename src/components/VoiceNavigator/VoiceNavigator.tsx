import React, { useState } from 'react';
import { Fab, Tooltip, Box, Typography, Paper, IconButton } from '@mui/material';
import { Mic, MicOff, Close, Keyboard } from '@mui/icons-material';
import { useVoiceNavigation } from '../../hooks/useVoiceNavigation';

export const VoiceNavigator: React.FC = () => {
  const { isListening, toggleListening, transcript } = useVoiceNavigation();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 1,
      }}
    >
      {/* Help Panel */}
      {showHelp && (
        <Paper
          sx={{
            p: 2,
            mb: 1,
            maxWidth: 300,
            boxShadow: 6,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Voice Navigation Help
            </Typography>
            <IconButton size="small" onClick={() => setShowHelp(false)}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          
          <Typography variant="body2" gutterBottom>
            <strong>Keyboard Shortcut:</strong>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Keyboard fontSize="small" />
            <Typography variant="body2">
              Long press <strong>SPACEBAR</strong> (0.5s)
            </Typography>
          </Box>
          
          <Typography variant="body2" gutterBottom>
            <strong>Voice Commands:</strong>
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="caption" display="block">• "Open Lessons"</Typography>
            <Typography variant="caption" display="block">• "Start Quiz"</Typography>
            <Typography variant="caption" display="block">• "Open Projects"</Typography>
            <Typography variant="caption" display="block">• "Go to Dashboard"</Typography>
            <Typography variant="caption" display="block">• "AI Tutor"</Typography>
          </Box>
        </Paper>
      )}

      {/* Transcript Display */}
      {isListening && transcript && (
        <Paper
          sx={{
            p: 2,
            mb: 1,
            maxWidth: 250,
            boxShadow: 3,
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
            Listening...
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            "{transcript}"
          </Typography>
        </Paper>
      )}

      {/* Status Indicator */}
      {isListening && (
        <Paper
          sx={{
            px: 2,
            py: 1,
            mb: 1,
            bgcolor: 'error.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.7 },
            },
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'white',
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }}
          />
          <Typography variant="caption" fontWeight={600}>
            LISTENING
          </Typography>
        </Paper>
      )}
      
      {/* Main Button */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip 
          title={
            isListening 
              ? 'Click to stop (or release spacebar)' 
              : 'Click to start (or long press spacebar)'
          }
          arrow
        >
          <Fab
            color={isListening ? 'error' : 'primary'}
            onClick={toggleListening}
            aria-label={isListening ? 'Stop voice navigation' : 'Start voice navigation'}
            sx={{
              animation: isListening ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  boxShadow: 3,
                },
                '50%': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              },
            }}
          >
            {isListening ? <MicOff /> : <Mic />}
          </Fab>
        </Tooltip>

        {/* Help Button */}
        <Tooltip title="Voice navigation help" arrow>
          <Fab
            size="small"
            color="default"
            onClick={() => setShowHelp(!showHelp)}
            aria-label="Voice navigation help"
            sx={{ bgcolor: 'background.paper' }}
          >
            <Keyboard fontSize="small" />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );
};
