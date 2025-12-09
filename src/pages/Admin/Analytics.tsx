import React, { useState, useEffect } from 'react';
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
    { label: 'Community Activity', value: '0', change: '+0%', icon: <School />, color: '#FF6B6B' },
    { label: 'Parent Reports', value: '0', change: '+0%', icon: <People />, color: '#4CAF50', subtext: '' },
    { label: 'Mentor Talk', value: '0', change: '+0%', icon: <School />, color: '#FF9800', subtext: '' },
    { label: 'Account Linked', value: '0', change: '+0%', icon: <People />, color: '#2196F3', subtext: '' },
    { label: 'Ongoing Live Classes', value: '0', change: '+0%', icon: <SmartToy />, color: '#9C27B0' },
  ]);
  const [lmsStats, setLmsStats] = useState({
    videoLessons: 0,
    studyMaterials: 0,
    assignments: 0,
    liveClasses: 0,
    quizzes: 0,
    totalViews: 0,
    avgCompletion: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [quizPerformance, setQuizPerformance] = useState([]);
  const [aiTutorData, setAiTutorData] = useState({
    aiTutorEngagement: [],
    totalSessions: 0,
    totalTokensUsed: 0,
    popularQuestions: [],
  });

  useEffect(() => {
    loadAnalyticsData();
    loadAttendanceData();
    loadQuizPerformance();
    loadAiTutorStats();
    loadLmsAnalytics();
  }, [timeRange]);

  // Real-time polling for all stats (every 10 seconds)
  useEffect(() => {
    const realTimeInterval = setInterval(() => {
      loadAnalyticsData();
      loadAttendanceData();
      loadQuizPerformance();
      loadAiTutorStats();
      loadLmsAnalytics();
    }, 10000);

    return () => clearInterval(realTimeInterval);
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      const [studentsRes, liveClassesRes, ongoingLiveClassesRes, lmsRes, communityRes, parentReportsRes, mentorTalkRes, accountLinkedRes] = await Promise.all([
        fetch('http://localhost:3001/api/stats/students-count').catch((e) => { console.error('Students fetch error:', e); return null; }),
        fetch('http://localhost:3001/api/stats/live-classes-count').catch((e) => { console.error('Live classes fetch error:', e); return null; }),
        fetch('http://localhost:3001/api/stats/ongoing-live-classes-count').catch((e) => { console.error('Ongoing live classes fetch error:', e); return null; }),
        fetch(`http://localhost:3001/api/admin/lms-analytics?range=${timeRange}`).catch((e) => { console.error('LMS analytics fetch error:', e); return null; }),
        fetch('http://localhost:3001/api/stats/community-activity-count').catch((e) => { console.error('Community activity fetch error:', e); return null; }),
        fetch('http://localhost:3001/api/stats/parent-reports-count').catch((e) => { console.error('Parent reports fetch error:', e); return null; }),
        fetch('http://localhost:3001/api/stats/mentor-talk-count').catch((e) => { console.error('Mentor talk fetch error:', e); return null; }),
        fetch('http://localhost:3001/api/stats/account-linked-count').catch((e) => { console.error('Account linked fetch error:', e); return null; }),
      ]);

      if (!studentsRes && !liveClassesRes) {
        console.warn('⚠️ Backend server is not running on http://localhost:3001. Please start the backend server.');
      }

      const studentsData = studentsRes?.ok ? await studentsRes.json() : { totalStudents: 0 };
      const liveClassesData = liveClassesRes?.ok ? await liveClassesRes.json() : { totalLiveClasses: 0 };
      const ongoingLiveClassesData = ongoingLiveClassesRes?.ok ? await ongoingLiveClassesRes.json() : { ongoingLiveClasses: 0 };
      const lmsData = lmsRes?.ok ? await lmsRes.json() : {};
      const communityData = communityRes?.ok ? await communityRes.json() : { totalCommunityActivity: 0 };
      const parentReportsData = parentReportsRes?.ok ? await parentReportsRes.json() : { totalParentReports: 0 };
      const mentorTalkData = mentorTalkRes?.ok ? await mentorTalkRes.json() : { totalMentorTalk: 0 };
      const accountLinkedData = accountLinkedRes?.ok ? await accountLinkedRes.json() : { totalAccountLinked: 0 };

      const students = studentsData.totalStudents || 0;
      const totalLiveClasses = liveClassesData.totalLiveClasses || 0;
      const ongoingLiveClasses = ongoingLiveClassesData.ongoingLiveClasses || 0;
      const videoLessons = lmsData.videoLessons || 0;
      const studyMaterials = lmsData.studyMaterials || 0;
      const assignments = lmsData.assignments || 0;
      const quizzes = lmsData.quizzes || 0;
      const totalViews = lmsData.totalViews || 0;
      const avgCompletion = lmsData.avgCompletion || 0;
      const totalComments = communityData.totalCommunityActivity || 0;
      const parentReports = parentReportsData.totalParentReports || 0;
      const mentorReplies = mentorTalkData.totalMentorTalk || 0;
      const accountsLinked = accountLinkedData.totalAccountLinked || 0;

      console.log('✅ Analytics Data Updated:', {
        students,
        videoLessons,
        studyMaterials,
        assignments,
        quizzes,
        totalLiveClasses,
        ongoingLiveClasses,
        totalComments,
        parentReports,
        mentorReplies,
        accountsLinked,
        timestamp: new Date().toLocaleTimeString(),
      });

      setStats([
        { label: 'Total Students', value: students.toString(), change: '+0%', icon: <People />, color: '#2196F3' },
        { label: 'Community Activity', value: totalComments.toString(), change: '+0%', icon: <School />, color: '#FF6B6B' },
        { label: 'Parent Reports', value: parentReports.toString(), change: '+0%', icon: <People />, color: '#4CAF50', subtext: '' },
        { label: 'Mentor Talk', value: mentorReplies.toString(), change: '+0%', icon: <School />, color: '#FF9800', subtext: '' },
        { label: 'Account Linked', value: accountsLinked.toString(), change: '+0%', icon: <People />, color: '#2196F3', subtext: '' },
        { label: 'Ongoing Live Classes', value: ongoingLiveClasses.toString(), change: '+0%', icon: <SmartToy />, color: '#9C27B0' },
      ]);

      setLmsStats({
        videoLessons,
        studyMaterials,
        assignments,
        liveClasses: totalLiveClasses,
        quizzes,
        totalViews,
        avgCompletion,
      });
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/attendance/weekly');
      const data = await response.json();
      if (data.weeklyData) {
        setAttendanceData(data.weeklyData);
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const loadQuizPerformance = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/quiz-performance?range=${timeRange}`);
      const data = await response.json();
      if (data.quizPerformance) {
        setQuizPerformance(data.quizPerformance);
      }
    } catch (error) {
      console.error('Error loading quiz performance:', error);
    }
  };

  const loadAiTutorStats = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/ai-tutor-stats?range=${timeRange}`);
      const data = await response.json();
      setAiTutorData({
        aiTutorEngagement: data.aiTutorEngagement || [],
        totalSessions: data.totalSessions || 0,
        totalTokensUsed: data.totalTokensUsed || 0,
        popularQuestions: data.popularQuestions || [],
      });
    } catch (error) {
      console.error('Error loading AI tutor stats:', error);
      setAiTutorData({
        aiTutorEngagement: [],
        totalSessions: 0,
        totalTokensUsed: 0,
        popularQuestions: [],
      });
    }
  };

  const loadLmsAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/lms-analytics?range=${timeRange}`);
      const data = await response.json();
      setLmsStats(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error loading LMS analytics:', error);
    }
  };



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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mb: 4 }}>
        {stats.map((stat, index) => (
          <Card key={index} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flex: 1, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: stat.color,
                    color: 'white',
                    p: 0.75,
                    borderRadius: 1,
                    display: 'flex',
                    flexShrink: 0,
                    '& svg': { fontSize: '1.25rem' },
                  }}
                >
                  {stat.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  {stat.subtext && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                      {stat.subtext}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp fontSize="small" color="success" sx={{ flexShrink: 0 }} />
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                {stat.change}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                vs last {timeRange}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* LMS Overview Cards */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          LMS Content Overview
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mt: 2 }}>
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
                {lmsStats.studyMaterials}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Study Materials
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {lmsStats.assignments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assignments
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {lmsStats.quizzes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quizzes
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {lmsStats.liveClasses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live Classes Conducted
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {(lmsStats.videoLessons || 0) + (lmsStats.studyMaterials || 0) + (lmsStats.assignments || 0) + (lmsStats.liveClasses || 0) + (lmsStats.quizzes || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Content
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
          
          {/* Real-time Attendance Chart */}
          <Box sx={{ height: 400, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2 }}>
            {attendanceData.length > 0 ? (
              attendanceData.map((data, index) => (
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
                      bgcolor: data.percentage >= 85 ? '#4CAF50' : data.percentage >= 70 ? '#FF9800' : '#F44336',
                      borderRadius: 1,
                      transition: 'height 0.3s',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                    title={`${data.present}/${data.total} present`}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {data.day}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {data.present}/{data.total}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">Loading attendance data...</Typography>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                📊 Key Insights
              </Typography>
              {attendanceData.length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    • Average rate: {Math.round(attendanceData.reduce((sum, d) => sum + d.percentage, 0) / attendanceData.length)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Highest: {attendanceData.reduce((max, d) => d.percentage > max.percentage ? d : max).day} ({attendanceData.reduce((max, d) => d.percentage > max.percentage ? d : max).percentage}%)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Lowest: {attendanceData.reduce((min, d) => d.percentage < min.percentage ? d : min).day} ({attendanceData.reduce((min, d) => d.percentage < min.percentage ? d : min).percentage}%)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Total records: {attendanceData.reduce((sum, d) => sum + d.total, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Total present: {attendanceData.reduce((sum, d) => sum + d.present, 0)}
                  </Typography>
                </>
              )}
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom color="success.dark">
                ✓ Attendance Summary
              </Typography>
              {attendanceData.length > 0 && (
                <>
                  <Typography variant="body2" color="success.dark">
                    • Days tracked: {attendanceData.length}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    • Avg students/day: {Math.round(attendanceData.reduce((sum, d) => sum + d.total, 0) / attendanceData.length)}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    • Avg present/day: {Math.round(attendanceData.reduce((sum, d) => sum + d.present, 0) / attendanceData.length)}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    • Consistency: {attendanceData.filter(d => d.percentage >= 80).length}/{attendanceData.length} days ≥80%
                  </Typography>
                </>
              )}
            </Paper>
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
            {quizPerformance.length > 0 ? (
              quizPerformance.map((subject, index) => (
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
              ))
            ) : (
              <Typography color="text.secondary">Loading quiz performance data...</Typography>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                💡 Recommendations
              </Typography>
              {quizPerformance.length > 0 ? (
                <>
                  <Typography variant="body2">
                    • Focus on subjects with lower scores
                  </Typography>
                  <Typography variant="body2">
                    • {quizPerformance.find(q => q.avgScore === Math.max(...quizPerformance.map(q => q.avgScore)))?.subject} is performing well
                  </Typography>
                  <Typography variant="body2">
                    • Total students assessed: {quizPerformance.reduce((sum, q) => sum + q.students, 0)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2">No quiz data available yet</Typography>
              )}
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom color="warning.dark">
                📈 Quiz Statistics
              </Typography>
              {quizPerformance.length > 0 ? (
                <>
                  <Typography variant="body2" color="warning.dark">
                    • Quizzes: {quizPerformance.length}
                  </Typography>
                  <Typography variant="body2" color="warning.dark">
                    • Avg score: {Math.round(quizPerformance.reduce((sum, q) => sum + q.avgScore, 0) / quizPerformance.length)}%
                  </Typography>
                  <Typography variant="body2" color="warning.dark">
                    • Highest: {Math.max(...quizPerformance.map(q => q.avgScore))}%
                  </Typography>
                  <Typography variant="body2" color="warning.dark">
                    • Lowest: {Math.min(...quizPerformance.map(q => q.avgScore))}%
                  </Typography>
                </>
              ) : (
                <Typography variant="body2">No data</Typography>
              )}
            </Paper>
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
                  Study Materials: {lmsStats.studyMaterials}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                <Typography variant="body2" color="info.contrastText">
                  Assignments: {lmsStats.assignments}
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

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 3 }}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {lmsStats.totalViews}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Completion Rate
              </Typography>
              <Typography variant="h5" fontWeight={600} color={lmsStats.avgCompletion >= 70 ? 'success.main' : 'warning.main'}>
                {lmsStats.avgCompletion}%
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                📊 LMS Insights
              </Typography>
              <Typography variant="body2">
                • Total content: {(lmsStats.videoLessons || 0) + (lmsStats.studyMaterials || 0) + (lmsStats.assignments || 0) + (lmsStats.liveClasses || 0) + (lmsStats.quizzes || 0)}
              </Typography>
              <Typography variant="body2">
                • Total views: {lmsStats.totalViews}
              </Typography>
              <Typography variant="body2">
                • Completion: {lmsStats.avgCompletion}%
              </Typography>
              <Typography variant="body2">
                • Avg per type: {Math.round(((lmsStats.videoLessons || 0) + (lmsStats.studyMaterials || 0) + (lmsStats.assignments || 0) + (lmsStats.liveClasses || 0) + (lmsStats.quizzes || 0)) / 5)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary.dark">
                🎓 Content Breakdown
              </Typography>
              <Typography variant="body2" color="primary.dark">
                • Video Lessons: {lmsStats.videoLessons} ({Math.round(((lmsStats.videoLessons || 0) / ((lmsStats.videoLessons || 0) + (lmsStats.studyMaterials || 0) + (lmsStats.assignments || 0) + (lmsStats.liveClasses || 0) + (lmsStats.quizzes || 0))) * 100)}%)
              </Typography>
              <Typography variant="body2" color="primary.dark">
                • Study Materials: {lmsStats.studyMaterials} ({Math.round(((lmsStats.studyMaterials || 0) / ((lmsStats.videoLessons || 0) + (lmsStats.studyMaterials || 0) + (lmsStats.assignments || 0) + (lmsStats.liveClasses || 0) + (lmsStats.quizzes || 0))) * 100)}%)
              </Typography>
              <Typography variant="body2" color="primary.dark">
                • Assignments: {lmsStats.assignments} ({Math.round(((lmsStats.assignments || 0) / ((lmsStats.videoLessons || 0) + (lmsStats.studyMaterials || 0) + (lmsStats.assignments || 0) + (lmsStats.liveClasses || 0) + (lmsStats.quizzes || 0))) * 100)}%)
              </Typography>
              <Typography variant="body2" color="primary.dark">
                • Live Classes: {lmsStats.liveClasses} ({Math.round(((lmsStats.liveClasses || 0) / ((lmsStats.videoLessons || 0) + (lmsStats.studyMaterials || 0) + (lmsStats.assignments || 0) + (lmsStats.liveClasses || 0) + (lmsStats.quizzes || 0))) * 100)}%)
              </Typography>
              <Typography variant="body2" color="primary.dark">
                • Quizzes: {lmsStats.quizzes} ({Math.round(((lmsStats.quizzes || 0) / ((lmsStats.videoLessons || 0) + (lmsStats.studyMaterials || 0) + (lmsStats.assignments || 0) + (lmsStats.liveClasses || 0) + (lmsStats.quizzes || 0))) * 100)}%)
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </TabPanel>

      {/* AI Tutor Engagement Analytics */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            AI Tutor Usage Statistics
          </Typography>

          {/* Summary Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.contrastText" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h5" fontWeight={600} color="primary.contrastText">
                {aiTutorData.totalSessions}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" color="success.contrastText" gutterBottom>
                Tokens Used
              </Typography>
              <Typography variant="h5" fontWeight={600} color="success.contrastText">
                {aiTutorData.totalTokensUsed.toLocaleString()}
              </Typography>
            </Paper>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mt: 2 }}>
            {aiTutorData.aiTutorEngagement.length > 0 ? (
              aiTutorData.aiTutorEngagement.map((item, index) => (
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
                        <Typography variant="caption" color="text.secondary">
                          {item.tokensUsed} tokens
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary">Loading AI tutor data...</Typography>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Popular Questions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {aiTutorData.popularQuestions.length > 0 ? (
                  aiTutorData.popularQuestions.map((item, idx) => (
                    <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">{item.question}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.count}x
                        </Typography>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No questions recorded yet</Typography>
                )}
              </Box>
            </Box>
            <Paper sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom color="success.dark">
                🤖 AI Tutor Summary
              </Typography>
              {aiTutorData.totalSessions > 0 ? (
                <>
                  <Typography variant="body2" color="success.dark">
                    • Total sessions: {aiTutorData.totalSessions}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    • Categories: {aiTutorData.aiTutorEngagement.length}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    • Avg tokens/session: {Math.round(aiTutorData.totalTokensUsed / aiTutorData.totalSessions)}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    • Most used: {aiTutorData.aiTutorEngagement.length > 0 ? aiTutorData.aiTutorEngagement.reduce((max, item) => item.sessions > max.sessions ? item : max).category : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    • Popular questions: {aiTutorData.popularQuestions.length}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="success.dark">No AI tutor data yet</Typography>
              )}
            </Paper>
          </Box>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default Analytics;
