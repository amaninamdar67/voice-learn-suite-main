import React, { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import { AITutorModal } from './AITutorModal';

export const AITutorFab: React.FC = () => {
  const [open, setOpen] = useState(false);

  // Listen for open event from TopBar
  React.useEffect(() => {
    const handleOpenAITutor = () => setOpen(true);
    window.addEventListener('open-ai-tutor', handleOpenAITutor);
    return () => window.removeEventListener('open-ai-tutor', handleOpenAITutor);
  }, []);

  return (
    <>
      <Tooltip title="AI Tutor - Ask me anything!" placement="right">
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000,
          }}
        >
          <SmartToy />
        </Fab>
      </Tooltip>

      <AITutorModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};
