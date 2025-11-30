import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Upload,
  VideoLibrary,
  Quiz,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    { title: 'Upload Lesson', icon: <Upload />, path: '/lessons/upload', color: '#2196F3' },
    { title: 'Create Quiz', icon: <Quiz />, path: '/quizzes/create', color: '#4CAF50' },
    { title: 'Add Video', icon: <VideoLibrary />, path: '/videos/add', color: '#FF9800' },
    { title: 'Manage Projects', icon: <Assignment />, path: '/projects', color: '#9C27B0' },
  ];

  const recentLessons = [
    { title: 'Introduction to React', progress: 75, students: 32 },
    { title: 'TypeScript Basics', progress: 60, students: 28 },
    { title: 'Web Design Principles', progress: 90, students: 35 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Teacher Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your lessons, quizzes, and student progress
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 2 }}>
          {quickActions.map((action) => (
            <Card
              key={action.title}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    bgcolor: action.color,
                    color: 'white',
                    p: 2,
                    borderRadius: 2,
                    display: 'inline-flex',
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="body1" fontWeight={600}>
                  {action.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Recent Lessons
          </Typography>
          <Box sx={{ mt: 2 }}>
            {recentLessons.map((lesson, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={500}>
                    {lesson.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lesson.students} students
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={lesson.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {lesson.progress}% completion rate
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Upcoming
          </Typography>
          <Box sx={{ mt: 2 }}>
            {[
              { title: 'Quiz Deadline', date: 'Tomorrow' },
              { title: 'Parent Meeting', date: 'Friday' },
              { title: 'Project Review', date: 'Next Week' },
            ].map((event, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  mb: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {event.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {event.date}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
