import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Avatar, Button,
  Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Rating, Divider
} from '@mui/material';
import { School, TrendingUp, Clock, MessageSquare, Users, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department?: string;
  semester?: string;
}

interface MentorStats {
  totalStudents: number;
  activeStudents: number;
  totalSessions: number;
  averageRating: number;
}

interface Session {
  id: string;
  student_id: string;
  student_name: string;
  session_date: string;
  duration_minutes: number;
  notes: string;
  rating: number;
}

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<MentorStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalSessions: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [sessionForm, setSessionForm] = useState({
    duration_minutes: 30,
    notes: '',
    rating: 5
  });

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      console.log('MentorDashboard - Current user ID:', user.id);
      
      const studentsRes = await fetch(`http://localhost:3001/api/mentor/students/${user.id}`);
      
      if (!studentsRes.ok) {
        throw new Error('Failed to fetch students');
      }

      const studentsData = await studentsRes.json();
      
      if (!studentsData.students || studentsData.students.length === 0) {
        console.log('No students found, attempting to set up mentor...');
        const setupRes = await fetch(`http://localhost:3001/api/mentor/setup/${user.id}`, {
          method: 'POST'
        });
        
        if (setupRes.ok) {
          const retryRes = await fetch(`http://localhost:3001/api/mentor/students/${user.id}`);
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            setStudents(retryData.students || []);
            setStats({
              totalStudents: retryData.students?.length || 0,
              activeStudents: retryData.activeStudents || 0,
              totalSessions: retryData.totalSessions || 0,
              averageRating: retryData.averageRating || 0
            });
          }
        }
      } else {
        setStudents(studentsData.students || []);
        setStats({
          totalStudents: studentsData.students?.length || 0,
          activeStudents: studentsData.activeStudents || 0,
          totalSessions: studentsData.totalSessions || 0,
          averageRating: studentsData.averageRating || 0
        });
      }
    } catch (err: any) {
      console.error('Error loading mentor data:', err);
      setError('Failed to load mentor data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://localhost:3001/api/mentor/sessions/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const createSession = async () => {
    if (!user?.id || !selectedStudent) return;
    try {
      const response = await fetch('http://localhost:3001/api/mentor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: user.id,
          student_id: selectedStudent,
          duration_minutes: sessionForm.duration_minutes,
          notes: sessionForm.notes,
          rating: sessionForm.rating
        })
      });
      if (response.ok) {
        setOpenSessionDialog(false);
        setSessionForm({ duration_minutes: 30, notes: '', rating: 5 });
        setSelectedStudent('');
        fetchSessions();
      }
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Mentor Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => setOpenSessionDialog(true)}
            sx={{ textTransform: 'none' }}
          >
            New Session
          </Button>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => window.location.href = '/mentoring'}
            sx={{ textTransform: 'none' }}
          >
            Start Mentoring
          </Button>
          <Button 
            variant="outlined"
            size="small"
            onClick={() => window.location.href = '/messages'}
            sx={{ textTransform: 'none' }}
          >
            Messages
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <School size={32} color="#1976d2" />
                <Box>
                  <Typography color="textSecondary" variant="body2">Total Students</Typography>
                  <Typography variant="h6">{stats.totalStudents}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Users size={32} color="#4caf50" />
                <Box>
                  <Typography color="textSecondary" variant="body2">Active Students</Typography>
                  <Typography variant="h6">{stats.activeStudents}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Clock size={32} color="#ff9800" />
                <Box>
                  <Typography color="textSecondary" variant="body2">Total Sessions</Typography>
                  <Typography variant="h6">{stats.totalSessions}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={32} color="#9c27b0" />
                <Box>
                  <Typography color="textSecondary" variant="body2">Avg Rating</Typography>
                  <Typography variant="h6">{stats.averageRating.toFixed(1)}/5</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content with Sidebar */}
      <Grid container spacing={3}>
        {/* Sessions Sidebar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Calendar size={20} color="#1976d2" />
              <Typography variant="h6" fontWeight={600}>
                Recent Sessions
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {sessions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary" variant="body2">
                  No sessions yet
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Create a new session to get started
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '500px', overflowY: 'auto' }}>
                {sessions.slice(0, 10).map((session) => (
                  <Card key={session.id} sx={{ 
                    p: 1.5, 
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: '#f0f2f5',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.2s'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1976d2' }}>
                          {session.student_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(session.session_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                      </Box>
                      <Rating value={session.rating} readOnly size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                      <Chip 
                        icon={<Clock size={14} />}
                        label={`${session.duration_minutes} mins`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 24 }}
                      />
                    </Box>
                    {session.notes && (
                      <Typography variant="caption" color="textSecondary" sx={{ 
                        display: 'block',
                        fontStyle: 'italic',
                        mt: 0.5,
                        p: 0.75,
                        bgcolor: '#fff',
                        borderRadius: 0.5,
                        borderLeft: '2px solid #1976d2'
                      }}>
                        {session.notes}
                      </Typography>
                    )}
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Session Dialog */}
      <Dialog open={openSessionDialog} onClose={() => setOpenSessionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            select
            fullWidth
            label="Select Student"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            sx={{ mb: 2 }}
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Duration (minutes)"
            value={sessionForm.duration_minutes}
            onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={sessionForm.notes}
            onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Rating</Typography>
            <Rating
              value={sessionForm.rating}
              onChange={(e, newValue) => setSessionForm({ ...sessionForm, rating: newValue || 5 })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDialog(false)}>Cancel</Button>
          <Button onClick={createSession} variant="contained">Create Session</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorDashboard;
