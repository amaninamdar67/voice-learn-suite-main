import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Collapse, 
  Chip,
  Divider 
} from '@mui/material';
import { 
  Help, 
  ExpandMore, 
  ExpandLess, 
  Mic,
  Description,
  VideoLibrary,
  Quiz,
  Assignment,
  Navigation,
  VolumeUp
} from '@mui/icons-material';

export const VoiceCommandsHelper = () => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const commandCategories = [
    {
      icon: <Navigation />,
      title: 'Navigation',
      color: '#2196f3',
      commands: [
        'Go to dashboard',
        'Go to videos',
        'Go to quizzes',
        'Go to assignments',
        'Go back'
      ]
    },
    {
      icon: <Description />,
      title: 'Documents',
      color: '#4caf50',
      commands: [
        'Open document',
        'Open title [name]',
        'Read document',
        'Next page',
        'Previous page'
      ]
    },
    {
      icon: <VideoLibrary />,
      title: 'Videos',
      color: '#f44336',
      commands: [
        'Open video 1',
        'Play lecture 3',
        'Play lesson titled [name]'
      ]
    },
    {
      icon: <Quiz />,
      title: 'Quizzes',
      color: '#ff9800',
      commands: [
        'Open quiz 1',
        'Start quiz 2',
        'Take quiz 3'
      ]
    },
    {
      icon: <Assignment />,
      title: 'Assignments',
      color: '#9c27b0',
      commands: [
        'Open assignment 1',
        'View assignment 2',
        'Open item 3'
      ]
    },
    {
      icon: <VolumeUp />,
      title: 'Reading',
      color: '#00bcd4',
      commands: [
        'Read page',
        'Stop reading',
        'Pause reading',
        'Continue reading',
        'Scroll up',
        'Scroll down'
      ]
    }
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 20,
        zIndex: 1000,
      }}
    >
      {/* Floating Help Button */}
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          width: 56,
          height: 56,
          boxShadow: 3,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        {open ? <ExpandMore /> : <Help />}
      </IconButton>

      {/* Commands Panel */}
      <Collapse in={open}>
        <Paper
          sx={{
            mt: 2,
            p: 2,
            width: 320,
            maxHeight: 500,
            overflow: 'auto',
            boxShadow: 6,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Mic color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Voice Commands
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click a category to see available commands
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {commandCategories.map((category) => (
              <Box key={category.title}>
                <Chip
                  icon={category.icon}
                  label={category.title}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === category.title ? null : category.title
                    )
                  }
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    bgcolor:
                      activeCategory === category.title
                        ? `${category.color}20`
                        : 'transparent',
                    borderColor: category.color,
                    color: category.color,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: `${category.color}30`,
                    },
                  }}
                  variant="outlined"
                />

                <Collapse in={activeCategory === category.title}>
                  <Box
                    sx={{
                      mt: 1,
                      mb: 2,
                      pl: 2,
                      borderLeft: `3px solid ${category.color}`,
                    }}
                  >
                    {category.commands.map((cmd, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        sx={{
                          py: 0.5,
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}
                      >
                        "{cmd}"
                      </Typography>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight={600} gutterBottom>
              💡 Quick Tips:
            </Typography>
            <Typography variant="caption" display="block">
              • Press SPACEBAR to start/stop
            </Typography>
            <Typography variant="caption" display="block">
              • Speak clearly and naturally
            </Typography>
            <Typography variant="caption" display="block">
              • Say "help" anytime for guidance
            </Typography>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};
