import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import {
  School,
  Quiz,
  Assignment,
  SmartToy,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const learningTiles = [
    {
      title: 'Lessons',
      icon: <School />,
      path: '/lessons',
      progress: 65,
      color: '#2196F3',
      count: 12,
    },
    {
      title: 'Quizzes',
      icon: <Quiz />,
      path: '/quizzes',
      progress: 80,
      color: '#4CAF50',
      count: 8,
    },
    {
      title: 'Projects',
      icon: <Assignment />,
      path: '/projects',
      progress: 45,
      color: '#FF9800',
      count: 3,
    },
    {
      title: 'AI Tutor',
      icon: <SmartToy />,
      path: '#',
      progress: 0,
      color: '#9C27B0',
      count: 0,
      action: () => window.dispatchEvent(new Event('open-ai-tutor')),
    },
  ];

  const recentLessons = [
    { title: 'Introduction to React', completed: true },
    { title: 'TypeScript Basics', completed: true },
    { title: 'Web Design Principles', completed: false },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
          <School fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            My Learning Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your progress and continue learning
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {learningTiles.map((tile) => (
          <Card
            key={tile.title}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              height: '100%',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
            onClick={tile.action || (() => navigate(tile.path))}
          >
            <CardContent>
              <Box
                sx={{
                  bgcolor: tile.color,
                  color: 'white',
                  p: 2,
                  borderRadius: 2,
                  display: 'inline-flex',
                  mb: 2,
                }}
              >
                {tile.icon}
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {tile.count}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {tile.title}
              </Typography>
              {tile.progress > 0 && (
                <>
                  <LinearProgress
                    variant="determinate"
                    value={tile.progress}
                    sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {tile.progress}% Complete
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Continue Learning
          </Typography>
          <Box sx={{ mt: 2 }}>
            {recentLessons.map((lesson, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => navigate('/lessons')}
              >
                <Typography variant="body1">{lesson.title}</Typography>
                {lesson.completed ? (
                  <Chip label="Completed" color="success" size="small" />
                ) : (
                  <Chip label="In Progress" color="primary" size="small" />
                )}
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
            Your Progress
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={63}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                63%
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                This Week
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3 lessons completed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2 quizzes passed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                5 hours of learning
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
