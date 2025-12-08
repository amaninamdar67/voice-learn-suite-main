import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Notifications,
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

interface Notification {
  id: number;
  message: string;
  time: string;
  type: 'lesson' | 'assignment' | 'quiz' | 'announcement' | 'message';
}

export const TopBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isListening, toggleListening } = useEnhancedVoiceNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  
  // Voice nav enabled state
  const [voiceNavEnabled, setVoiceNavEnabled] = useState(() => {
    const saved = localStorage.getItem('voiceNavEnabled');
    return saved !== 'false'; // Default to true
  });

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      if (!user?.id) return;
      
      // Fetch real notifications from backend
      const response = await fetch(`http://localhost:3001/api/notifications/${user.id}`);
      const data = await response.json();
      
      if (data.notifications && data.notifications.length > 0) {
        setNotifications(data.notifications);
        setHasNewNotifications(true);
      } else {
        setNotifications([]);
        setHasNewNotifications(false);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setNotifications([]);
      setHasNewNotifications(false);
    }
  };

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

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleAITutorOpen = () => {
    window.dispatchEvent(new Event('open-ai-tutor'));
  };

  const handleNotificationClick = () => {
    setHasNewNotifications(false);
    handleNotificationOpen;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'lesson':
        return '#2196f3'; // Blue
      case 'assignment':
        return '#ff9800'; // Orange
      case 'quiz':
        return '#f44336'; // Red
      case 'announcement':
        return '#4caf50'; // Green
      case 'message':
        return '#9c27b0'; // Purple
      default:
        return '#757575'; // Gray
    }
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

          <Tooltip title="Notifications">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationOpen}
              sx={{
                animation: hasNewNotifications ? 'bellShake 0.6s ease-in-out' : 'none',
                transformOrigin: 'top center',
              }}
            >
              <Badge badgeContent={notifications.length} color="error" max={99}>
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

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

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: { width: 320, maxHeight: 400 },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Notifications ({notifications.length})
            </Typography>
          </Box>
          <Divider />
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationClose} sx={{ py: 1.5 }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: getNotificationColor(notification.type),
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {notification.type}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </MenuItem>
          )}
        </Menu>

      </Toolbar>
    </AppBar>
  );
};
