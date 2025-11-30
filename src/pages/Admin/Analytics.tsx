import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  People,
  School,
  Quiz,
  SmartToy,
  Download,
  CalendarToday,
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

const Analytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState([
    { label: 'Total Students', value: '0', change: '+0%', icon: <People />, color: '#2196F3' },
    { label: 'Video Lessons', value: '0', change: '+0%', icon: <School />, color: '#4CAF50' },
    { label: 'Quizzes Completed', value: '0', change: '+0%', icon: <Quiz />, color: '#FF9800' },
    { label: 'Live Classes', value: '0', change: '+0%', icon: <SmartToy />, color: '#9C27B0' },
  ]);
  const [lmsStats, setLmsStats] = useState({
    videoLessons: 0,
    recordedVideos: 0,
    liveClasses: 0,
    quizzes: 0,
    totalViews: 0,
    avgCompletion: 0,
  });

  React.useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Load users
      const usersResponse = await fetch('http://localhost:3001/api/users');
      const usersData = await usersResponse.json();
      
      // Load LMS data
      const [videoLessonsRes, recordedVideosRes, liveClassesRes, quizzesRes] = await Promise.all([
        fetch('http://localhost:3001/api/lms/video-lessons'),
        fetch('http://localhost:3001/api/lms/recorded-videos'),
        fetch('http://localhost:3001/api/lms/live-classes'),
        fetch('http://localhost:3001/api/lms/quizzes'),
      ]);

      const videoLessons = await videoLessonsRes.json();
      const recordedVideos = await recordedVideosRes.json();
      const liveClasses = await liveClassesRes.json();
      const quizzes = await quizzesRes.json();

      const students = usersData.users?.filter((u: any) => u.role === 'student').length || 0;
      const totalVideoLessons = videoLessons.lessons?.length || 0;
      const totalLiveClasses = liveClasses.liveClasses?.length || 0;
      const totalQuizzes = quizzes.quizzes?.length || 0;

      setStats([
        { label: 'Total Students', value: students.toString(), change: '+0%', icon: <People />, color: '#2196F3' },
        { label: 'Video Lessons', value: totalVideoLessons.toString(), change: '+0%', icon: <School />, color: '#4CAF50' },
        { label: 'Total Quizzes', value: totalQuizzes.toString(), change: '+0%', icon: <Quiz />, color: '#FF9800' },
        { label: 'Live Classes', value: totalLiveClasses.toString(), change: '+0%', icon: <SmartToy />, color: '#9C27B0' },
      ]);

      setLmsStats({
        videoLessons: totalVideoLessons,
        recordedVideos: recordedVideos.videos?.length || 0,
        liveClasses: totalLiveClasses,
        quizzes: totalQuizzes,
        totalViews: 0,
        avgCompletion: 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const attendanceData = [
    { day: 'Mon', percentage: 85 },
    { day: 'Tue', percentage: 92 },
    { day: 'Wed', percentage: 88 },
    { day: 'Thu', percentage: 90 },
    { day: 'Fri', percentage: 87 },
  ];

  const quizPerformance = [
    { subject: 'Mathematics', avgScore: 85, students: 234 },
    { subject: 'Science', avgScore: 78, students: 198 },
    { subject: 'English', avgScore: 92, students: 256 },
    { subject: 'History', avgScore: 81, students: 189 },
  ];

  const aiTutorEngagement = [
    { category: 'Math Help', sessions: 456 },
    { category: 'Science Questions', sessions: 389 },
    { category: 'Homework Assistance', sessions: 567 },
    { category: 'Exam Preparation', sessions: 234 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Analytics & Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights into platform performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={timeRange === 'week' ? 'contained' : 'outlined'}
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'contained' : 'outlined'}
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'year' ? 'contained' : 'outlined'}
              onClick={() => setTimeRange('year')}
            >
              Year
            </Button>
          </ButtonGroup>
          <Button variant="contained" startIcon={<Download />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: stat.color,
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    mr: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="body2" color="success.main">
                  {stat.change}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* LMS Overview Cards */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          LMS Content Overview
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="primary">
                {lmsStats.videoLessons}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Video Lessons
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {lmsStats.recordedVideos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recorded Videos
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {lmsStats.liveClasses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live Classes
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Tabs for Different Analytics */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Attendance" />
          <Tab label="Quiz Performance" />
          <Tab label="LMS Analytics" />
          <Tab label="AI Tutor Engagement" />
        </Tabs>
      </Paper>

      {/* Attendance Analytics */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Weekly Attendance Overview
            </Typography>
            <Button size="small" startIcon={<CalendarToday />}>
              View Calendar
            </Button>
          </Box>
          
          {/* Bar Chart Placeholder */}
          <Box sx={{ height: 400, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2 }}>
            {attendanceData.map((data, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="h6" fontWeight={600} color="primary">
                  {data.percentage}%
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: `${data.percentage * 3}px`,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    transition: 'height 0.3s',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                />
                <Typography variant="body2" fontWeight={500}>
                  {data.day}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Key Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Average attendance rate: 88.4%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Highest attendance: Tuesday (92%)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 15 students with perfect attendance this week
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Quiz Performance Analytics */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quiz Performance by Subject
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            {quizPerformance.map((subject, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={500}>
                    {subject.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {subject.students} students
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {subject.avgScore}% avg
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ position: 'relative', height: 40, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${subject.avgScore}%`,
                      bgcolor: subject.avgScore >= 85 ? 'success.main' : subject.avgScore >= 70 ? 'primary.main' : 'warning.main',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      px: 2,
                      transition: 'width 0.5s',
                    }}
                  >
                    <Typography variant="body2" color="white" fontWeight={600}>
                      {subject.avgScore}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              💡 Recommendations
            </Typography>
            <Typography variant="body2">
              • Science scores are below average - consider additional tutoring sessions
            </Typography>
            <Typography variant="body2">
              • English performance is excellent - share best practices with other subjects
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* LMS Analytics */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Video & Live Class Analytics
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Content Distribution
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
                <Typography variant="body2" color="primary.contrastText">
                  Video Lessons: {lmsStats.videoLessons}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                <Typography variant="body2" color="success.contrastText">
                  Recorded Videos: {lmsStats.recordedVideos}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                <Typography variant="body2" color="error.contrastText">
                  Live Classes: {lmsStats.liveClasses}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                <Typography variant="body2" color="warning.contrastText">
                  Quizzes: {lmsStats.quizzes}
                </Typography>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              📊 LMS Insights
            </Typography>
            <Typography variant="body2">
              • Total content items: {lmsStats.videoLessons + lmsStats.recordedVideos + lmsStats.liveClasses + lmsStats.quizzes}
            </Typography>
            <Typography variant="body2">
              • Most popular content type: Video Lessons
            </Typography>
            <Typography variant="body2">
              • Quiz completion rate: Track student engagement
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* AI Tutor Engagement Analytics */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            AI Tutor Usage Statistics
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mt: 2 }}>
            {aiTutorEngagement.map((item, index) => (
              <Card variant="outlined" key={index}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <SmartToy />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {item.sessions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.category}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Popular Questions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {[
                'How do I solve quadratic equations?',
                'Explain photosynthesis process',
                'What is the difference between mitosis and meiosis?',
                'Help with essay writing structure',
              ].map((question, idx) => (
                <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">{question}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default Analytics;
