import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mic, MicOff } from '@mui/icons-material';
import { Button } from '@mui/material';
// Using Web Speech API for now (works immediately, no server needed)
// Switch to Whisper later: import { useWhisperVoiceNavigation as useEnhancedVoiceNavigation } from '../../hooks/useWhisperVoiceNavigation';
import { useEnhancedVoiceNavigation } from '../../hooks/useEnhancedVoiceNavigation';
import { NotificationPanel } from './NotificationPanel';

export const TopBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isListening, toggleListening } = useEnhancedVoiceNavigation();
  // Voice nav enabled state
  const [voiceNavEnabled, setVoiceNavEnabled] = useState(() => {
    const saved = localStorage.getItem('voiceNavEnabled');
    return saved !== 'false'; // Default to true
  });



  const handleToggleVoiceNav = () => {
    const newValue = !voiceNavEnabled;
    setVoiceNavEnabled(newValue);
    localStorage.setItem('voiceNavEnabled', String(newValue));
    
    // If turning off and currently listening, stop
    if (!newValue && isListening) {
      toggleListening();
    }
    
    window.dispatchEvent(new Event('voiceNavToggled'));
  };

  // Spacebar is handled in the hook itself

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleAITutorOpen = () => {
    window.dispatchEvent(new Event('open-ai-tutor'));
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        '@keyframes bellShake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(15deg)' },
          '30%': { transform: 'rotate(-15deg)' },
          '45%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(5deg)' },
          '85%': { transform: 'rotate(-5deg)' },
        },
      }}
    >
      <Toolbar>
        {/* Title on Left */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mr: 3,
          }}
        >
          E-Learning Using AI
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Voice Navigation ON/OFF Toggle */}
          <Tooltip title={voiceNavEnabled ? 'Click to disable Voice Navigation' : 'Click to enable Voice Navigation'}>
            <Button
              variant={voiceNavEnabled ? 'contained' : 'outlined'}
              color={voiceNavEnabled ? 'success' : 'inherit'}
              onClick={handleToggleVoiceNav}
              sx={{
                minWidth: 80,
                height: 36,
                px: 2,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1,
                bgcolor: voiceNavEnabled ? 'success.main' : 'transparent',
                color: voiceNavEnabled ? 'white' : 'text.secondary',
                borderColor: voiceNavEnabled ? 'success.main' : 'divider',
                '&:hover': {
                  bgcolor: voiceNavEnabled ? 'success.dark' : 'action.hover',
                },
              }}
            >
              {voiceNavEnabled ? 'ON' : 'OFF'}
            </Button>
          </Tooltip>
          
          {/* Voice Navigation Button */}
          <Tooltip title={
            !voiceNavEnabled 
              ? 'Voice Navigation is disabled. Enable it first.' 
              : isListening 
                ? 'Stop Voice Navigation (or press Space)' 
                : 'Start Voice Navigation (or press Space)'
          }>
            <span>
              <Button
                variant={isListening ? 'contained' : 'outlined'}
                color={isListening ? 'error' : 'primary'}
                startIcon={isListening ? <MicOff /> : <Mic />}
                onClick={toggleListening}
                disabled={!voiceNavEnabled}
                sx={{
                  height: 36,
                  animation: isListening ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                  },
                }}
              >
                {isListening ? 'Listening...' : 'Voice Nav'}
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="AI Tutor">
            <IconButton
              size="large"
              onClick={handleAITutorOpen}
              sx={{
                bgcolor: 'transparent',
                color: 'inherit',
                fontSize: '1.5rem',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              🤖
            </IconButton>
          </Tooltip>

          {/* Urgent Announcements Notification Panel */}
          <NotificationPanel />

          <Tooltip title="Profile">
            <IconButton
              size="large"
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 2 }} fontSize="small" />
            Logout
          </MenuItem>
        </Menu>



      </Toolbar>
    </AppBar>
  );
};
