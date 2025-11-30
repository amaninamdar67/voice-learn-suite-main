import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  Quiz,
  School,
  Message,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const MentoringView: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const students = [
    {
      name: 'Alice Smith',
      avatar: 'AS',
      progress: 85,
      attendance: 95,
      status: 'excellent',
      grade: '10th',
    },
    {
      name: 'Bob Johnson',
      avatar: 'BJ',
      progress: 72,
      attendance: 88,
      status: 'good',
      grade: '10th',
    },
    {
      name: 'Charlie Brown',
      avatar: 'CB',
      progress: 58,
      attendance: 75,
      status: 'needs-attention',
      grade: '9th',
    },
  ];

  const quizScores = [
    { subject: 'Mathematics', score: 92, date: '2024-01-15' },
    { subject: 'Science', score: 85, date: '2024-01-14' },
    { subject: 'English', score: 88, date: '2024-01-13' },
    { subject: 'History', score: 90, date: '2024-01-12' },
  ];

  const attendanceData = [
    { week: 'Week 1', percentage: 100 },
    { week: 'Week 2', percentage: 95 },
    { week: 'Week 3', percentage: 90 },
    { week: 'Week 4', percentage: 95 },
  ];

  const discussionActivity = [
    { topic: 'React Hooks', posts: 5, date: '2024-01-15' },
    { topic: 'TypeScript Types', posts: 3, date: '2024-01-14' },
    { topic: 'CSS Grid', posts: 7, date: '2024-01-13' },
  ];

  const aiTutorSessions = [
    { topic: 'Math Help', duration: '15 min', date: '2024-01-15' },
    { topic: 'Science Questions', duration: '20 min', date: '2024-01-14' },
    { topic: 'Homework Assistance', duration: '10 min', date: '2024-01-13' },
  ];

  const student = students[selectedStudent];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'primary';
      case 'needs-attention':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Student Mentoring
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor and guide your assigned students
      </Typography>

      {/* Student Selector */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        {students.map((s, idx) => (
          <Card
            key={idx}
            sx={{
              cursor: 'pointer',
              border: selectedStudent === idx ? 2 : 0,
              borderColor: 'primary.main',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 4,
              },
            }}
            onClick={() => setSelectedStudent(idx)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{s.avatar}</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {s.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.grade} Grade
                  </Typography>
                </Box>
                <Chip
                  label={s.status.replace('-', ' ')}
                  color={getStatusColor(s.status)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={s.progress}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Progress: {s.progress}%
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Student Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab icon={<Quiz />} label="Quiz Scores" iconPosition="start" />
              <Tab icon={<School />} label="Attendance" iconPosition="start" />
              <Tab icon={<Message />} label="Discussions" iconPosition="start" />
              <Tab icon={<TrendingUp />} label="AI Tutor" iconPosition="start" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quiz Performance
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quizScores.map((quiz, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{quiz.subject}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {quiz.score}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {quiz.date}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {quiz.score >= 85 ? (
                              <Chip icon={<CheckCircle />} label="Excellent" color="success" size="small" />
                            ) : quiz.score >= 70 ? (
                              <Chip label="Good" color="primary" size="small" />
                            ) : (
                              <Chip icon={<Warning />} label="Needs Work" color="warning" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Attendance Tracking
                </Typography>
                <Box sx={{ mt: 3 }}>
                  {attendanceData.map((data, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{data.week}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {data.percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={data.percentage}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={data.percentage >= 90 ? 'success' : 'warning'}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Discussion Activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {discussionActivity.map((activity, idx) => (
                    <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {activity.topic}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.date}
                          </Typography>
                        </Box>
                        <Chip label={`${activity.posts} posts`} size="small" color="primary" />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  AI Tutor Engagement
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {aiTutorSessions.map((session, idx) => (
                    <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {session.topic}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.date}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {session.duration}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </TabPanel>
          </Paper>
        </Box>

        {/* Summary Sidebar */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Student Summary
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                {student.avatar}
              </Avatar>
              <Box>
                <Typography variant="h6">{student.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.grade} Grade
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={student.progress}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="h5" fontWeight={700}>
                {student.progress}%
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Attendance Rate
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {student.attendance}%
              </Typography>
            </Box>

            <Chip
              label={student.status.replace('-', ' ')}
              color={getStatusColor(student.status)}
              sx={{ textTransform: 'capitalize', width: '100%' }}
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Send Message
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Write a message to the student..."
              />
              <Button variant="contained" startIcon={<Message />} fullWidth>
                Send Message
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default MentoringView;
