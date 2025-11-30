import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';

interface QuizCard {
  id: string;
  title: string;
  questions: number;
  duration: string;
  status: 'completed' | 'pending' | 'overdue';
  score?: number;
  deadline: string;
}

const Quizzes: React.FC = () => {
  const quizzes: QuizCard[] = [
    {
      id: '1',
      title: 'React Fundamentals Quiz',
      questions: 15,
      duration: '30 min',
      status: 'completed',
      score: 95,
      deadline: '2 days ago',
    },
    {
      id: '2',
      title: 'TypeScript Assessment',
      questions: 20,
      duration: '45 min',
      status: 'pending',
      deadline: 'Tomorrow',
    },
    {
      id: '3',
      title: 'Web Design Quiz',
      questions: 10,
      duration: '20 min',
      status: 'pending',
      deadline: 'In 3 days',
    },
    {
      id: '4',
      title: 'JavaScript Advanced Topics',
      questions: 25,
      duration: '50 min',
      status: 'overdue',
      deadline: 'Yesterday',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'primary';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle fontSize="small" />;
      case 'pending':
        return <Schedule fontSize="small" />;
      case 'overdue':
        return <Schedule fontSize="small" />;
      default:
        return <QuizIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Quizzes & Assessments
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Test your knowledge and track your progress
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QuizIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    {quiz.title}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(quiz.status)}
                  label={quiz.status}
                  color={getStatusColor(quiz.status)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {quiz.questions} questions • {quiz.duration}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deadline: {quiz.deadline}
                </Typography>
              </Box>

              {quiz.score !== undefined && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Your Score
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {quiz.score}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={quiz.score}
                    sx={{ height: 8, borderRadius: 4 }}
                    color="success"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Quizzes;
