import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  School,
  People,
  Person,
  Videocam,
  TrendingUp,
} from '@mui/icons-material';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: string;
}

interface ActivityData {
  date: string;
  users: number;
  lessons: number;
  quizzes: number;
  assignments: number;
  liveClasses: number;
  total: number;
}

interface WeeklyAttendance {
  day: string;
  percentage: number;
  total: number;
  present: number;
  date: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState<StatCard[]>([
    { title: 'Total Domains', value: 0, icon: <School />, color: '#2196F3' },
    { title: 'Total Sub-Domain', value: 0, icon: <School />, color: '#00BCD4' },
    { title: 'Total Students', value: 0, icon: <People />, color: '#4CAF50' },
    { title: 'Total Teachers', value: 0, icon: <Person />, color: '#FF9800' },
    { title: 'Live Classes', value: 0, icon: <Videocam />, color: '#9C27B0' },
  ]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [activityChartData, setActivityChartData] = React.useState<ActivityData[]>([]);
  const [timeRange, setTimeRange] = React.useState('week');
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const [subdomainCount, setSubdomainCount] = React.useState(0);

  React.useEffect(() => {
    loadDashboardStats();
    loadActivities();
    loadAnalytics();
    
    // Refresh stats every 10 seconds for real-time updates
    const statsInterval = setInterval(() => {
      loadDashboardStats();
    }, 10000);
    
    // Refresh activities and analytics every 15 seconds
    const analyticsInterval = setInterval(() => {
      loadActivities();
      loadAnalytics();
    }, 15000);
    
    return () => {
      clearInterval(statsInterval);
      clearInterval(analyticsInterval);
    };
  }, [timeRange]);

  const loadDashboardStats = async () => {
    try {
      const [domainsRes, subdomainsRes, studentsRes, teachersRes, liveClassesRes, ongoingLiveClassesRes] = await Promise.all([
        fetch('http://localhost:3001/api/stats/domains-count').catch(() => null),
        fetch('http://localhost:3001/api/subdomains-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/students-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/teachers-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/live-classes-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/ongoing-live-classes-count').catch(() => null),
      ]);

      const domainsData = domainsRes?.ok ? await domainsRes.json() : { totalDomains: 0 };
      const subdomainsData = subdomainsRes?.ok ? await subdomainsRes.json() : { totalSubdomains: 0 };
      const studentsData = studentsRes?.ok ? await studentsRes.json() : { totalStudents: 0 };
      const teachersData = teachersRes?.ok ? await teachersRes.json() : { totalTeachers: 0 };
      const liveClassesData = liveClassesRes?.ok ? await liveClassesRes.json() : { totalLiveClasses: 0 };
      const ongoingLiveClassesData = ongoingLiveClassesRes?.ok ? await ongoingLiveClassesRes.json() : { ongoingLiveClasses: 0 };

      const domains = domainsData.totalDomains || 0;
      const subdomains = subdomainsData.totalSubdomains || 0;
      const students = studentsData.totalStudents || 0;
      const teachers = teachersData.totalTeachers || 0;
      const liveClasses = liveClassesData.totalLiveClasses || 0;
      const ongoingLiveClasses = ongoingLiveClassesData.ongoingLiveClasses || 0;

      setSubdomainCount(subdomains);

      setStats([
        { title: 'Total Domains', value: domains, icon: <School />, color: '#2196F3' },
        { title: 'Total Sub-Domain', value: subdomains, icon: <School />, color: '#00BCD4' },
        { title: 'Total Students', value: students, icon: <People />, color: '#4CAF50' },
        { title: 'Total Teachers', value: teachers, icon: <Person />, color: '#FF9800' },
        { title: 'Live Classes Conducted', value: liveClasses, icon: <Videocam />, color: '#9C27B0' },
        { title: 'Ongoing Live Classes', value: ongoingLiveClasses, icon: <Videocam />, color: '#FF5722' },
      ]);

      console.log('✅ Dashboard Stats Updated:', {
        domains,
        subdomains,
        students,
        teachers,
        liveClasses,
        ongoingLiveClasses,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error('❌ Error loading dashboard stats:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/system/activities');
      const data = await response.json();
      
      if (data.activities && Array.isArray(data.activities)) {
        setActivities(data.activities.slice(0, 8)); // Show top 8 activities
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/analytics?range=${timeRange}`);
      const data = await response.json();
      
      if (data.chartData) {
        setActivityChartData(data.chartData);
        setAnalyticsData(data.totals);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };



  const getMaxValue = () => {
    return Math.max(...activityChartData.map(d => d.total), 50);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        System overview and management
      </Typography>

      {/* Stat Cards - Compact Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
        {/* Total Domains - Quick Access */}
        <Card
          onClick={() => navigate('/domains')}
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  bgcolor: '#2196F3',
                  color: 'white',
                  p: 0.75,
                  borderRadius: 1,
                  display: 'flex',
                  fontSize: '1.2rem',
                }}
              >
                <School fontSize="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Domains
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {stats[0]?.value || 0}
            </Typography>
          </CardContent>
        </Card>

        {/* Total Sub-Domain - Quick Access */}
        <Card
          onClick={() => navigate('/domains')}
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  bgcolor: '#00BCD4',
                  color: 'white',
                  p: 0.75,
                  borderRadius: 1,
                  display: 'flex',
                  fontSize: '1.2rem',
                }}
              >
                <School fontSize="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Sub-Domain
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {stats[1]?.value || 0}
            </Typography>
          </CardContent>
        </Card>

        {/* Total Students - Quick Access */}
        <Card
          onClick={() => navigate('/users')}
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  bgcolor: '#4CAF50',
                  color: 'white',
                  p: 0.75,
                  borderRadius: 1,
                  display: 'flex',
                  fontSize: '1.2rem',
                }}
              >
                <People fontSize="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Students
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {stats[2]?.value || 0}
            </Typography>
          </CardContent>
        </Card>

        {/* Total Teachers - Quick Access */}
        <Card
          onClick={() => navigate('/users')}
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  p: 0.75,
                  borderRadius: 1,
                  display: 'flex',
                  fontSize: '1.2rem',
                }}
              >
                <Person fontSize="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Teachers
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {stats[3]?.value || 0}
            </Typography>
          </CardContent>
        </Card>

        {/* Live Classes */}
        <Card
          sx={{
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  bgcolor: '#9C27B0',
                  color: 'white',
                  p: 0.75,
                  borderRadius: 1,
                  display: 'flex',
                  fontSize: '1.2rem',
                }}
              >
                <Videocam fontSize="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Live Classes
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {stats[4]?.value || 0}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Two Column Layout: Analytics (70%) + Activities (30%) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '70% 30%' }, gap: 3, mt: 4 }}>
        {/* Left Column: Analytics */}
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                System Activity Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Platform activity trends over {timeRange}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
            </Box>
          </Box>

          {/* Chart Legend */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: '#2196F3', borderRadius: '2px' }} />
              <Typography variant="caption" fontSize="0.75rem">Users</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: '#4CAF50', borderRadius: '2px' }} />
              <Typography variant="caption" fontSize="0.75rem">Lessons</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: '#FF9800', borderRadius: '2px' }} />
              <Typography variant="caption" fontSize="0.75rem">Quizzes</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: '#9C27B0', borderRadius: '2px' }} />
              <Typography variant="caption" fontSize="0.75rem">Assignments</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: '#E91E63', borderRadius: '2px' }} />
              <Typography variant="caption" fontSize="0.75rem">Live Classes</Typography>
            </Box>
          </Box>

          {/* Bar Chart - Compact */}
          <Box sx={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: 0.5, px: 1, pb: 1, overflowX: 'auto', flex: 1 }}>
            {activityChartData.map((data, index) => {
              const maxVal = getMaxValue();
              const userHeight = (data.users / maxVal) * 180;
              const lessonHeight = (data.lessons / maxVal) * 180;
              const quizHeight = (data.quizzes / maxVal) * 180;
              const assignmentHeight = (data.assignments / maxVal) * 180;
              const liveClassHeight = (data.liveClasses / maxVal) * 180;

              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.25,
                    minWidth: '30px',
                    flex: '0 0 auto',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column-reverse', height: 180, gap: 0 }}>
                    {data.liveClasses > 0 && (
                      <Box
                        sx={{
                          width: '100%',
                          height: `${liveClassHeight}px`,
                          bgcolor: '#E91E63',
                          transition: 'all 0.3s',
                          '&:hover': { opacity: 0.8 },
                        }}
                        title={`Live Classes: ${data.liveClasses}`}
                      />
                    )}
                    {data.assignments > 0 && (
                      <Box
                        sx={{
                          width: '100%',
                          height: `${assignmentHeight}px`,
                          bgcolor: '#9C27B0',
                          transition: 'all 0.3s',
                          '&:hover': { opacity: 0.8 },
                        }}
                        title={`Assignments: ${data.assignments}`}
                      />
                    )}
                    {data.quizzes > 0 && (
                      <Box
                        sx={{
                          width: '100%',
                          height: `${quizHeight}px`,
                          bgcolor: '#FF9800',
                          transition: 'all 0.3s',
                          '&:hover': { opacity: 0.8 },
                        }}
                        title={`Quizzes: ${data.quizzes}`}
                      />
                    )}
                    {data.lessons > 0 && (
                      <Box
                        sx={{
                          width: '100%',
                          height: `${lessonHeight}px`,
                          bgcolor: '#4CAF50',
                          transition: 'all 0.3s',
                          '&:hover': { opacity: 0.8 },
                        }}
                        title={`Lessons: ${data.lessons}`}
                      />
                    )}
                    {data.users > 0 && (
                      <Box
                        sx={{
                          width: '100%',
                          height: `${userHeight}px`,
                          bgcolor: '#2196F3',
                          borderRadius: '2px 2px 0 0',
                          transition: 'all 0.3s',
                          '&:hover': { opacity: 0.8 },
                        }}
                        title={`Users: ${data.users}`}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', textAlign: 'center' }}>
                    {data.date}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Chart Stats - Compact */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Users</Typography>
              <Typography variant="body2" fontWeight={600}>{analyticsData?.users || 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Lessons</Typography>
              <Typography variant="body2" fontWeight={600}>{analyticsData?.lessons || 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Quizzes</Typography>
              <Typography variant="body2" fontWeight={600}>{analyticsData?.quizzes || 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Assignments</Typography>
              <Typography variant="body2" fontWeight={600}>{analyticsData?.assignments || 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Live Classes</Typography>
              <Typography variant="body2" fontWeight={600}>{analyticsData?.liveClasses || 0}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Right Column: Recent Activities */}
        <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '500px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUp color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Recent Activities
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', flex: 1, pr: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { bgcolor: '#f1f1f1', borderRadius: '10px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#888', borderRadius: '10px', '&:hover': { bgcolor: '#555' } } }}>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    borderLeft: '3px solid',
                    borderLeftColor:
                      activity.type === 'user'
                        ? '#2196F3'
                        : activity.type === 'lesson'
                        ? '#4CAF50'
                        : '#FF9800',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      boxShadow: 1,
                    },
                  }}
                >
                  <Typography variant="caption" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
                    {activity.message}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {activity.timestamp}
                    </Typography>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor:
                          activity.type === 'user'
                            ? '#E3F2FD'
                            : activity.type === 'lesson'
                            ? '#E8F5E9'
                            : '#FFF3E0',
                        borderRadius: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            activity.type === 'user'
                              ? '#1976D2'
                              : activity.type === 'lesson'
                              ? '#388E3C'
                              : '#F57C00',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {activity.type}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No recent activities
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
