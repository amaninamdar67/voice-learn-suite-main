import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { TrendingUp, Clock, AlertCircle, BookOpen, CheckCircle, FileText, Users, School, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Child {
  id: string;
  full_name: string;
  email?: string;
  grade?: string;
  overall_score?: number;
  attendance_rate?: number;
  last_active?: string;
  lessonsCompleted?: number;
  quizzesPassed?: number;
  projectsActive?: number;
  coursesCompleted?: number;
  totalCourses?: number;
  totalComments?: number;
}

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChildren();
  }, [user?.id]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/admin-linking/parent-students/${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch children data');
      }

      const data = await response.json();
      const linkedStudents = data.students || [];

      // Fetch real stats for each student
      const studentsWithStats = await Promise.all(
        linkedStudents.map(async (student: Child) => {
          try {
            const statsRes = await fetch(`http://localhost:3001/api/parent-student/student-overview/${student.id}`);
            const statsData = await statsRes.json();
            return {
              ...student,
              overall_score: Math.round((statsData.stats.lessonsCompleted / Math.max(statsData.stats.totalCourses, 1)) * 100),
              attendance_rate: statsData.stats.attendance,
              lessonsCompleted: statsData.stats.lessonsCompleted,
              quizzesPassed: statsData.stats.quizzesCompleted,
              projectsActive: statsData.stats.assignmentsCompleted,
              coursesCompleted: statsData.stats.coursesCompleted,
              totalCourses: statsData.stats.totalCourses,
              totalComments: statsData.stats.totalComments,
            };
          } catch (err) {
            console.error('Error fetching student stats:', err);
            return student;
          }
        })
      );

      setChildren(studentsWithStats);
    } catch (err: any) {
      console.error('Error loading children:', err);
      setError('Failed to load children data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getChildStatus = (child: Child) => {
    if (!child.attendance_rate || !child.overall_score) return 'unknown';
    if (child.attendance_rate < 75) return 'at-risk';
    if (child.overall_score < 60) return 'needs-help';
    return 'good';
  };

  const avgAttendance = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + (c.attendance_rate || 0), 0) / children.length)
    : 0;

  const avgScore = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + (c.overall_score || 0), 0) / children.length)
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 280px' }, gap: 3, p: 3 }}>
      {/* Main Content */}
      <Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="h4" fontWeight={600} sx={{ mb: 4 }}>
          Parent Dashboard
        </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={32} color="#4caf50" />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Average Score
                  </Typography>
                  <Typography variant="h6">{avgScore}%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Clock size={32} color="#ff9800" />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Attendance
                  </Typography>
                  <Typography variant="h6">{avgAttendance}%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AlertCircle size={32} color="#f44336" />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Alerts
                  </Typography>
                  <Typography variant="h6">
                    {children.filter(c => c.attendance_rate < 75).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        My Children
      </Typography>

      {children.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No children linked yet</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {children.map((child) => {
            const status = getChildStatus(child);
            const initials = child.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase();

            return (
              <Box key={child.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    {/* Header with Avatar and Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                          fontWeight: 600,
                        }}
                      >
                        {initials}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {child.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {child.grade || 'Student'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Stats Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <BookOpen size={20} style={{ color: '#1976d2', marginBottom: 4 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {child.lessonsCompleted}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lessons
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <CheckCircle size={20} style={{ color: '#4caf50', marginBottom: 4 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {child.quizzesPassed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Quizzes
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <FileText size={20} style={{ color: '#ff9800', marginBottom: 4 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {child.projectsActive}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Assignments
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Users size={20} style={{ color: '#2196f3', marginBottom: 4 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {child.attendance_rate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Attendance
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <School size={20} style={{ color: '#9c27b0', marginBottom: 4 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {child.coursesCompleted}/{child.totalCourses}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Courses
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <MessageSquare size={20} style={{ color: '#ff5722', marginBottom: 4 }} />
                        <Typography variant="h6" fontWeight={700}>
                          {child.totalComments}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Comments
                        </Typography>
                      </Box>
                    </Box>

                    {/* Overall Score Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Overall Score
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {child.overall_score}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={child.overall_score || 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    {/* Status Chip */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Chip
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        color={
                          status === 'good'
                            ? 'success'
                            : status === 'at-risk'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}
      </Box>

      {/* Right Sidebar - Quick Access */}
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ px: 1.5, mb: 1 }}>
          Quick Access
        </Typography>

        {/* Activity */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #1976d2',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            '&:hover': {
              boxShadow: 3,
              borderColor: '#1565c0',
              transform: 'translateY(-2px)',
            },
          }}
          onClick={() => navigate('/children?tab=0')}
        >
          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
            <BookOpen size={24} style={{ color: '#1976d2', marginBottom: 8 }} />
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, color: '#1565c0' }}>
              Activity
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Recent
            </Typography>
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #ff9800',
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
            '&:hover': {
              boxShadow: 3,
              borderColor: '#f57c00',
              transform: 'translateY(-2px)',
            },
          }}
          onClick={() => navigate('/children?tab=1')}
        >
          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
            <Clock size={24} style={{ color: '#ff9800', marginBottom: 8 }} />
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, color: '#f57c00' }}>
              Deadlines
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Upcoming
            </Typography>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #9c27b0',
            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
            '&:hover': {
              boxShadow: 3,
              borderColor: '#7b1fa2',
              transform: 'translateY(-2px)',
            },
          }}
          onClick={() => navigate('/children?tab=2')}
        >
          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
            <MessageSquare size={24} style={{ color: '#9c27b0', marginBottom: 8 }} />
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, color: '#7b1fa2' }}>
              Messages
            </Typography>
            <Typography variant="caption" color="text.secondary">
              To mentor
            </Typography>
          </CardContent>
        </Card>

        {/* Replies */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #4caf50',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            '&:hover': {
              boxShadow: 3,
              borderColor: '#388e3c',
              transform: 'translateY(-2px)',
            },
          }}
          onClick={() => navigate('/children?tab=3')}
        >
          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
            <CheckCircle size={24} style={{ color: '#4caf50', marginBottom: 8 }} />
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, color: '#388e3c' }}>
              Replies
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mentor
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ParentDashboard;
