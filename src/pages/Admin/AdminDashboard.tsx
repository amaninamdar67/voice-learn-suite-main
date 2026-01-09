import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  ButtonGroup,
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import {
  School,
  People,
  Person,
  Videocam,
  TrendingUp,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([
    { title: 'Total Domains', value: 0, icon: <School />, color: '#2196F3' },
    { title: 'Total Sub-Domain', value: 0, icon: <School />, color: '#00BCD4' },
    { title: 'Total Students', value: 0, icon: <People />, color: '#4CAF50' },
    { title: 'Total Teachers', value: 0, icon: <Person />, color: '#FF9800' },
    { title: 'Live Classes', value: 0, icon: <Videocam />, color: '#9C27B0' },
  ]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityChartData, setActivityChartData] = useState<ActivityData[]>([]);
  const [timeRange, setTimeRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [subdomainCount, setSubdomainCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardStats();
    loadActivities();
    loadAnalytics();
    
    // Refresh stats every 5 seconds for real-time updates
    const statsInterval = setInterval(() => {
      loadDashboardStats();
    }, 5000);
    
    // Refresh activities and analytics every 15 seconds
    const analyticsInterval = setInterval(() => {
      loadActivities();
      loadAnalytics();
    }, 15000);

    // Subscribe to real-time updates for live classes
    const liveClassesSubscription = supabase
      .channel('live_classes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => {
        loadDashboardStats();
      })
      .subscribe();

    // Subscribe to real-time updates for profiles (users)
    const profilesSubscription = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadDashboardStats();
      })
      .subscribe();

    // Subscribe to real-time updates for video watch history (analytics)
    const videoHistorySubscription = supabase
      .channel('video_watch_history_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_watch_history' }, () => {
        loadAnalytics();
      })
      .subscribe();

    // Subscribe to quiz results (analytics)
    const quizResultsSubscription = supabase
      .channel('quiz_results_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_results' }, () => {
        loadAnalytics();
      })
      .subscribe();

    // Subscribe to assignments (analytics)
    const assignmentsSubscription = supabase
      .channel('assignment_submissions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignment_submissions' }, () => {
        loadAnalytics();
      })
      .subscribe();
    
    return () => {
      clearInterval(statsInterval);
      clearInterval(analyticsInterval);
      supabase.removeChannel(liveClassesSubscription);
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(videoHistorySubscription);
      supabase.removeChannel(quizResultsSubscription);
      supabase.removeChannel(assignmentsSubscription);
    };
  }, [timeRange]);

  const loadDashboardStats = async () => {
    try {
      const [domainsRes, subdomainsRes, studentsRes, teachersRes, liveClassesRes, ongoingLiveClassesRes, activeUsersRes] = await Promise.all([
        fetch('http://localhost:3001/api/stats/domains-count').catch(() => null),
        fetch('http://localhost:3001/api/subdomains-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/students-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/teachers-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/live-classes-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/ongoing-live-classes-count').catch(() => null),
        fetch('http://localhost:3001/api/stats/active-users-count').catch(() => null),
      ]);

      const domainsData = domainsRes?.ok ? await domainsRes.json() : { totalDomains: 0 };
      const subdomainsData = subdomainsRes?.ok ? await subdomainsRes.json() : { totalSubdomains: 0 };
      const studentsData = studentsRes?.ok ? await studentsRes.json() : { totalStudents: 0 };
      const teachersData = teachersRes?.ok ? await teachersRes.json() : { totalTeachers: 0 };
      const liveClassesData = liveClassesRes?.ok ? await liveClassesRes.json() : { totalLiveClasses: 0 };
      const ongoingLiveClassesData = ongoingLiveClassesRes?.ok ? await ongoingLiveClassesRes.json() : { ongoingLiveClasses: 0 };
      const activeUsersData = activeUsersRes?.ok ? await activeUsersRes.json() : { activeUsers: 0 };

      const domains = domainsData.totalDomains || 0;
      const subdomains = subdomainsData.totalSubdomains || 0;
      const students = studentsData.totalStudents || 0;
      const teachers = teachersData.totalTeachers || 0;
      const liveClasses = liveClassesData.totalLiveClasses || 0;
      const ongoingLiveClasses = ongoingLiveClassesData.ongoingLiveClasses || 0;
      const activeUsers = activeUsersData.activeUsers || 0;

      setSubdomainCount(subdomains);

      setStats([
        { title: 'Total Domains', value: domains, icon: <School />, color: '#2196F3' },
        { title: 'Total Sub-Domain', value: subdomains, icon: <School />, color: '#00BCD4' },
        { title: 'Total Students', value: students, icon: <People />, color: '#4CAF50' },
        { title: 'Total Teachers', value: teachers, icon: <Person />, color: '#FF9800' },
        { title: 'Active Users (30min)', value: activeUsers, icon: <People />, color: '#667eea' },
        { title: 'Ongoing Live Classes', value: ongoingLiveClasses, icon: <Videocam />, color: '#FF5722' },
      ]);

      setLastUpdated(new Date());

      console.log('✅ Dashboard Stats Updated:', {
        domains,
        subdomains,
        students,
        teachers,
        activeUsers,
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
        setLastUpdated(new Date());
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
      {/* Header with Title and Live Data Cards */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 0 }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, bgcolor: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#4CAF50', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem', color: '#2E7D32' }}>
                Live Data
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant="body1" color="text.secondary">
              System overview and management
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        {/* Live Data Cards - Top Right */}
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'row' }}>
          {/* Active Live Classes */}
          <Box sx={{ 
            bgcolor: '#fff',
            borderRadius: 0.75, 
            px: 1.5,
            py: 0.75,
            border: '2px solid #f5576c',
            boxShadow: '0 2px 6px rgba(245, 87, 108, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            whiteSpace: 'nowrap'
          }}>
            <Box sx={{ bgcolor: '#f5576c', color: 'white', p: 0.35, borderRadius: 0.5, display: 'flex', fontSize: '1rem', flexShrink: 0 }}>
              🎥
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '1.1rem', color: '#f5576c', lineHeight: 1 }}>
                {stats[5]?.value || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.65rem', display: 'block' }}>
                Active Live Classes
              </Typography>
            </Box>
          </Box>

          {/* Active Users */}
          <Box sx={{ 
            bgcolor: '#fff',
            borderRadius: 0.75, 
            px: 1.5,
            py: 0.75,
            border: '2px solid #667eea',
            boxShadow: '0 2px 6px rgba(102, 126, 234, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            whiteSpace: 'nowrap'
          }}>
            <Box sx={{ bgcolor: '#667eea', color: 'white', p: 0.35, borderRadius: 0.5, display: 'flex', fontSize: '1rem', flexShrink: 0 }}>
              👥
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '1.1rem', color: '#667eea', lineHeight: 1 }}>
                {stats[4]?.value || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.65rem', display: 'block' }}>
                Active Users (30min)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '65% 35%' }, gap: 2, alignItems: 'start' }}>
        {/* Left Column: System Activity Analytics Charts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
            System Activity Analytics
          </Typography>

          {/* Top Row - Two Charts Side by Side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {/* Line Chart - Activity Trend */}
            <Box sx={{ borderRadius: 1, border: '1px solid #e0e0e0', p: 1.5, bgcolor: '#fafafa' }}>
              <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block', fontSize: '0.85rem' }}>
                📈 Activity Trend
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={activityChartData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#999" 
                    style={{ fontSize: '11px' }}
                    interval={Math.max(0, Math.floor(activityChartData.length / 5))}
                  />
                  <YAxis stroke="#999" style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', fontSize: '12px' }}
                    cursor={{ stroke: '#2196F3', strokeWidth: 2 }}
                    formatter={(value) => value || 0}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="linear" dataKey="users" stroke="#2196F3" strokeWidth={2} dot={false} name="Users" />
                  <Line type="linear" dataKey="lessons" stroke="#4CAF50" strokeWidth={2} dot={false} name="Lessons" />
                  <Line type="linear" dataKey="quizzes" stroke="#FF9800" strokeWidth={2} dot={false} name="Quizzes" />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Area Chart - Total Activity */}
            <Box sx={{ borderRadius: 1, border: '1px solid #e0e0e0', p: 1.5, bgcolor: '#fafafa' }}>
              <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block', fontSize: '0.85rem' }}>
                📊 Total Activity
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityChartData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#999" 
                    style={{ fontSize: '11px' }}
                    interval={Math.max(0, Math.floor(activityChartData.length / 5))}
                  />
                  <YAxis stroke="#999" style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', fontSize: '12px' }}
                    cursor={{ stroke: '#2196F3', strokeWidth: 2 }}
                    formatter={(value) => value || 0}
                  />
                  <Area type="linear" dataKey="total" fill="#2196F3" stroke="#1976D2" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Bottom Row - Full Width Bar Chart */}
          <Box sx={{ borderRadius: 1, border: '1px solid #e0e0e0', p: 1.5, bgcolor: '#fafafa' }}>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block', fontSize: '0.85rem' }}>
              📋 Content Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activityChartData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#999" 
                  style={{ fontSize: '11px' }}
                  interval={Math.max(0, Math.floor(activityChartData.length / 8))}
                />
                <YAxis stroke="#999" style={{ fontSize: '11px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(33, 150, 243, 0.1)' }}
                  formatter={(value) => value || 0}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="lessons" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Lessons" />
                <Bar dataKey="quizzes" fill="#FF9800" radius={[4, 4, 0, 0]} name="Quizzes" />
                <Bar dataKey="assignments" fill="#9C27B0" radius={[4, 4, 0, 0]} name="Assignments" />
                <Bar dataKey="liveClasses" fill="#E91E63" radius={[4, 4, 0, 0]} name="Live Classes" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Bottom Row - Full Width Pie Chart */}
          <Box sx={{ borderRadius: 1, border: '1px solid #e0e0e0', p: 1.5, bgcolor: '#fafafa' }}>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block', fontSize: '0.85rem' }}>
              👥 User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Students', value: stats[2]?.value || 0, fill: '#4CAF50' },
                    { name: 'Teachers', value: stats[3]?.value || 0, fill: '#FF9800' },
                    { name: 'Domains', value: stats[0]?.value || 0, fill: '#2196F3' },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#4CAF50" />
                  <Cell fill="#FF9800" />
                  <Cell fill="#2196F3" />
                </Pie>
                <Tooltip formatter={(value) => value || 0} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>



        {/* Right Column: Stat Cards + Recent Activities */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: 'fit-content' }}>
          {/* Stats & Quick Access Title */}
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
            Stats & Quick Access
          </Typography>

          {/* Navigation Stat Cards - 2x2 Grid Layout */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.75 }}>
            {/* Total Domains */}
            <Box
              onClick={() => navigate('/domains')}
              sx={{
                bgcolor: '#fff',
                borderRadius: 0.75,
                px: 1.5,
                py: 1,
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ bgcolor: '#2196F3', color: 'white', p: 0.4, borderRadius: 0.5, display: 'flex', fontSize: '1rem', flexShrink: 0 }}>
                  <School fontSize="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  Domains
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.2rem', color: '#2196F3', textAlign: 'center', minWidth: '35px' }}>
                {stats[0]?.value || 0}
              </Typography>
            </Box>

            {/* Total Sub-Domain */}
            <Box
              onClick={() => navigate('/domains')}
              sx={{
                bgcolor: '#fff',
                borderRadius: 0.75,
                px: 1.5,
                py: 1,
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ bgcolor: '#00BCD4', color: 'white', p: 0.4, borderRadius: 0.5, display: 'flex', fontSize: '1rem', flexShrink: 0 }}>
                  <School fontSize="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  Sub-Domain
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.2rem', color: '#00BCD4', textAlign: 'center', minWidth: '35px' }}>
                {stats[1]?.value || 0}
              </Typography>
            </Box>

            {/* Total Teachers */}
            <Box
              onClick={() => navigate('/users')}
              sx={{
                bgcolor: '#fff',
                borderRadius: 0.75,
                px: 1.5,
                py: 1,
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ bgcolor: '#FF9800', color: 'white', p: 0.4, borderRadius: 0.5, display: 'flex', fontSize: '1rem', flexShrink: 0 }}>
                  <Person fontSize="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  Teachers
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.2rem', color: '#FF9800', textAlign: 'center', minWidth: '35px' }}>
                {stats[3]?.value || 0}
              </Typography>
            </Box>

            {/* Total Students */}
            <Box
              onClick={() => navigate('/users')}
              sx={{
                bgcolor: '#fff',
                borderRadius: 0.75,
                px: 1.5,
                py: 1,
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ bgcolor: '#4CAF50', color: 'white', p: 0.4, borderRadius: 0.5, display: 'flex', fontSize: '1rem', flexShrink: 0 }}>
                  <People fontSize="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  Students
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.2rem', color: '#4CAF50', textAlign: 'center', minWidth: '35px' }}>
                {stats[2]?.value || 0}
              </Typography>
            </Box>
          </Box>

          {/* Recent Activities */}
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'auto', borderRadius: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <TrendingUp color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                Recent Activities
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 400px)', pr: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { bgcolor: '#f1f1f1', borderRadius: '10px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#888', borderRadius: '10px', '&:hover': { bgcolor: '#555' } } }}>
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

          {/* Data Summary - Graph Information */}
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                📊 Graph Data Summary
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Users */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#E3F2FD', borderRadius: 0.75 }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem', color: '#1976D2' }}>
                  👤 Users
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.9rem', color: '#1976D2' }}>
                  {analyticsData?.users || 0}
                </Typography>
              </Box>

              {/* Lessons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#E8F5E9', borderRadius: 0.75 }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem', color: '#388E3C' }}>
                  📚 Lessons
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.9rem', color: '#388E3C' }}>
                  {analyticsData?.lessons || 0}
                </Typography>
              </Box>

              {/* Quizzes */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#FFF3E0', borderRadius: 0.75 }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem', color: '#F57C00' }}>
                  ❓ Quizzes
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.9rem', color: '#F57C00' }}>
                  {analyticsData?.quizzes || 0}
                </Typography>
              </Box>

              {/* Assignments */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#F3E5F5', borderRadius: 0.75 }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem', color: '#7B1FA2' }}>
                  ✏️ Assignments
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.9rem', color: '#7B1FA2' }}>
                  {analyticsData?.assignments || 0}
                </Typography>
              </Box>

              {/* Live Classes */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#FCE4EC', borderRadius: 0.75 }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem', color: '#C2185B' }}>
                  🎥 Live Classes
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.9rem', color: '#C2185B' }}>
                  {analyticsData?.liveClasses || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;
document.head.appendChild(style);

export default AdminDashboard;
