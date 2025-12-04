import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import { AITutorChat } from '../../components/AITutor/AITutorChat';
import { SmartToy, Psychology, Quiz, Lightbulb } from '@mui/icons-material';

export const AITutor: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🤖 AI Tutor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ask questions, get explanations, and learn with AI assistance
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Voice Enabled!</strong> Click the microphone button to ask questions using your voice.
        The AI will respond with both text and speech.
      </Alert>

      <Grid container spacing={3}>
        {/* AI Chat */}
        <Grid item xs={12} md={8}>
          <AITutorChat />
        </Grid>

        {/* Features */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              What I Can Help With
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
              <Psychology color="primary" />
              <Box>
                <Typography variant="subtitle2">Explain Concepts</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get clear explanations of difficult topics
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
              <Quiz color="primary" />
              <Box>
                <Typography variant="subtitle2">Practice Questions</Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate quizzes to test your knowledge
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
              <Lightbulb color="primary" />
              <Box>
                <Typography variant="subtitle2">Study Tips</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get personalized study strategies
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
              <SmartToy color="primary" />
              <Box>
                <Typography variant="subtitle2">24/7 Available</Typography>
                <Typography variant="body2" color="text.secondary">
                  Learn at your own pace, anytime
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tips for Best Results
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Be specific with your questions</li>
                <li>Ask for examples if needed</li>
                <li>Request step-by-step explanations</li>
                <li>Use voice for natural conversation</li>
                <li>Try different models for variety</li>
              </ul>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
