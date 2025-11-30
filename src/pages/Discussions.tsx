import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Message,
  Send,
  VolumeUp,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSpeech } from '../hooks/useSpeech';

interface Discussion {
  id: string;
  lessonTitle: string;
  nickname: string;
  message: string;
  timestamp: string;
  replies: number;
}

const Discussions: React.FC = () => {
  const { user } = useAuth();
  const { speak, isSpeaking } = useSpeech();
  const [newMessage, setNewMessage] = useState('');
  const [parentVisibility, setParentVisibility] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState('all');

  const discussions: Discussion[] = [
    {
      id: '1',
      lessonTitle: 'Introduction to React',
      nickname: 'CodeMaster123',
      message: 'Can someone explain the difference between props and state?',
      timestamp: '2 hours ago',
      replies: 5,
    },
    {
      id: '2',
      lessonTitle: 'TypeScript Basics',
      nickname: 'DevStudent',
      message: 'I found the interface section really helpful!',
      timestamp: '3 hours ago',
      replies: 2,
    },
    {
      id: '3',
      lessonTitle: 'Introduction to React',
      nickname: 'LearnFast',
      message: 'What are the best practices for component structure?',
      timestamp: '5 hours ago',
      replies: 8,
    },
    {
      id: '4',
      lessonTitle: 'Web Design Principles',
      nickname: 'DesignPro',
      message: 'The color theory section was amazing!',
      timestamp: '1 day ago',
      replies: 3,
    },
  ];

  const lessons = [
    'All Lessons',
    'Introduction to React',
    'TypeScript Basics',
    'Web Design Principles',
  ];

  const handleReadAloud = (text: string) => {
    speak(text);
  };

  const handlePostMessage = () => {
    if (newMessage.trim()) {
      // Handle post message
      setNewMessage('');
    }
  };

  const filteredDiscussions = selectedLesson === 'all' 
    ? discussions 
    : discussions.filter(d => d.lessonTitle === selectedLesson);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Discussion Forum
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Engage with your peers and teachers
          </Typography>
        </Box>
        {user?.role === 'teacher' && (
          <FormControlLabel
            control={
              <Switch
                checked={parentVisibility}
                onChange={(e) => setParentVisibility(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {parentVisibility ? <Visibility /> : <VisibilityOff />}
                <Typography variant="body2">
                  Parent Visibility
                </Typography>
              </Box>
            }
          />
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '250px 1fr' }, gap: 3 }}>
        {/* Lesson Filter Sidebar */}
        <Paper sx={{ p: 2, height: 'fit-content' }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Filter by Lesson
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {lessons.map((lesson, idx) => (
              <Button
                key={idx}
                variant={selectedLesson === (idx === 0 ? 'all' : lesson) ? 'contained' : 'text'}
                onClick={() => setSelectedLesson(idx === 0 ? 'all' : lesson)}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                {lesson}
              </Button>
            ))}
          </Box>
        </Paper>

        {/* Discussion Feed */}
        <Box>
          {/* Post New Message */}
          {user?.role === 'student' && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Start a Discussion
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Posting as: <Chip label="Anonymous Nickname" size="small" />
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Share your thoughts, ask questions..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Your identity is protected with a nickname
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handlePostMessage}
                  disabled={!newMessage.trim()}
                >
                  Post
                </Button>
              </Box>
            </Paper>
          )}

          {/* Discussion List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredDiscussions.map((discussion) => (
              <Card key={discussion.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Message />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {discussion.nickname}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {discussion.timestamp}
                          </Typography>
                        </Box>
                        <Chip
                          label={discussion.lessonTitle}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {discussion.message}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleReadAloud(discussion.message)}
                      color={isSpeaking ? 'primary' : 'default'}
                    >
                      <VolumeUp />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {discussion.replies} replies
                    </Typography>
                    <Button size="small" variant="outlined">
                      View Replies
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {filteredDiscussions.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No discussions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to start a conversation!
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Discussions;
