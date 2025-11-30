import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  School,
  People,
  Person,
  MenuBook,
} from '@mui/icons-material';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<StatCard[]>([
    { title: 'Total Schools', value: 0, icon: <School />, color: '#2196F3' },
    { title: 'Total Students', value: 0, icon: <People />, color: '#4CAF50' },
    { title: 'Total Teachers', value: 0, icon: <Person />, color: '#FF9800' },
    { title: 'Active Courses', value: 0, icon: <MenuBook />, color: '#9C27B0' },
  ]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load users to count students and teachers
      const usersResponse = await fetch('http://localhost:3001/api/users');
      const usersData = await usersResponse.json();
      
      // Load domains to count schools
      const domainsResponse = await fetch('http://localhost:3001/api/domains');
      const domainsData = await domainsResponse.json();
      
      // Load lessons to count active courses
      const lessonsResponse = await fetch('http://localhost:3001/api/lessons');
      const lessonsData = await lessonsResponse.json();

      if (usersData.users && domainsData.domains) {
        const students = usersData.users.filter((u: any) => u.role === 'student').length;
        const teachers = usersData.users.filter((u: any) => u.role === 'teacher').length;
        const schools = domainsData.domains.length;
        const courses = lessonsData.lessons?.length || 0;

        setStats([
          { title: 'Total Schools', value: schools, icon: <School />, color: '#2196F3' },
          { title: 'Total Students', value: students, icon: <People />, color: '#4CAF50' },
          { title: 'Total Teachers', value: teachers, icon: <Person />, color: '#FF9800' },
          { title: 'Active Courses', value: courses, icon: <MenuBook />, color: '#9C27B0' },
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        System overview and management
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {stats.map((stat) => (
          <Card
            key={stat.title}
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: stat.color,
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mt: 3 }}>
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              System Activity
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80%',
              }}
            >
              <Typography color="text.secondary">
                Analytics chart would appear here
              </Typography>
            </Box>
        </Paper>

        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Activities
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                'New student enrolled',
                'Teacher uploaded lesson',
                'Quiz completed by 25 students',
                'New parent account created',
              ].map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">{activity}</Typography>
                </Box>
              ))}
            </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
