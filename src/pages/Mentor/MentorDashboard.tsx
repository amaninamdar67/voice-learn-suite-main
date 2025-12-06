import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Rating
} from '@mui/material';
import { School, TrendingUp, Clock, MessageSquare } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  mentoring_focus: string;
  progress_score: number;
  last_session: string;
}

interface MentoringSession {
  id: string;
  student_id: string;
  student_name: string;
  session_date: string;
  duration_minutes: number;
  notes: string;
  rating: number;
}

interface RealtimeUpdate {
  student_id: string;
  status: 'online' | 'offline';
  last_active: string;
}

const MentorDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<MentoringSession[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<Map<string, RealtimeUpdate>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sessionForm, setSessionForm] = useState({
    duration_minutes: 60,
    notes: '',
    rating: 5
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadRealtimeData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, sessionsRes] = await Promise.all([
        fetch('http://localhost:3001/api/mentor/students'),
        fetch('http://localhost:3001/api/mentor/sessions')
      ]);

      const studentsData = await studentsRes.json();
      const sessionsData = await sessionsRes.json();

      setStudents(studentsData.students || []);
      setSessions(sessionsData.sessions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/mentor/realtime-status');
      const data = await res.json();
      const statusMap = new Map(data.status?.map((s: RealtimeUpdate) => [s.student_id, s]) || []);
      setRealtimeStatus(statusMap);
    } catch (err) {
      console.error('Failed to load realtime data:', err);
    }
  };

  const handleSaveSession = async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch('http://localhost:3001/api/mentor/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          ...sessionForm
        })
      });

      if (!response.ok) throw new Error('Failed to save session');

      setOpenSessionDialog(false);
      setSessionForm({ duration_minutes: 60, notes: '', rating: 5 });
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStudentStatus = (studentId: string) => {
    const status = realtimeStatus.get(studentId);
    return status?.status || 'offline';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalStudents = students.length;
  const avgProgress = students.length > 0
    ? (students.reduce((sum, s) => sum + s.progress_score, 0) / students.length).toFixed(1)
    : 0;
  const onlineStudents = Array.from(realtimeStatus.values()).filter(s => s.status === 'online').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Mentor Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <School size={32} color="#1976d2" />
                <Box>
                  <Typography color="textSecondary" variant="body2">Total Students</Typography>
                  <Typography variant="h6">{totalStudents}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={32} color="#4caf50" />
                <Box>
                  <Typography color="textSecondary" variant="body2">Avg Progress</Typography>
                  <Typography variant="h6">{avgProgress}%</Typography>
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
                  <Typography color="textSecondary" variant="body2">Online Now</Typography>
                  <Typography variant="h6">{onlineStudents}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MessageSquare size={32} color="#9c27b0" />
                <Box>
                  <Typography color="textSecondary" variant="body2">Sessions</Typography>
                  <Typography variant="h6">{sessions.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>My Students</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell fontWeight={600}>Student</TableCell>
              <TableCell fontWeight={600}>Focus Area</TableCell>
              <TableCell fontWeight={600}>Progress</TableCell>
              <TableCell fontWeight={600}>Status</TableCell>
              <TableCell fontWeight={600}>Last Active</TableCell>
              <TableCell fontWeight={600}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              const status = getStudentStatus(student.id);
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>{student.name[0]}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{student.name}</Typography>
                        <Typography variant="caption" color="textSecondary">{student.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{student.mentoring_focus}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 100, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4 }}>
                        <Box sx={{
                          width: `${student.progress_score}%`,
                          height: '100%',
                          backgroundColor: '#4caf50',
                          borderRadius: 4
                        }} />
                      </Box>
                      <Typography variant="caption">{student.progress_score}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={status === 'online' ? 'Online' : 'Offline'}
                      color={status === 'online' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(student.last_session).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedStudent(student);
                        setOpenSessionDialog(true);
                      }}
                    >
                      Log Session
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recent Sessions</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell fontWeight={600}>Student</TableCell>
              <TableCell fontWeight={600}>Date</TableCell>
              <TableCell fontWeight={600}>Duration</TableCell>
              <TableCell fontWeight={600}>Rating</TableCell>
              <TableCell fontWeight={600}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.slice(0, 10).map((session) => (
              <TableRow key={session.id}>
                <TableCell>{session.student_name}</TableCell>
                <TableCell>{new Date(session.session_date).toLocaleDateString()}</TableCell>
                <TableCell>{session.duration_minutes} min</TableCell>
                <TableCell>
                  <Rating value={session.rating} readOnly size="small" />
                </TableCell>
                <TableCell>{session.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openSessionDialog} onClose={() => setOpenSessionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Mentoring Session</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">
              Student: <strong>{selectedStudent?.name}</strong>
            </Typography>
            <TextField
              label="Duration (minutes)"
              type="number"
              value={sessionForm.duration_minutes}
              onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) })}
              fullWidth
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Rating</Typography>
              <Rating
                value={sessionForm.rating}
                onChange={(e, value) => setSessionForm({ ...sessionForm, rating: value || 5 })}
              />
            </Box>
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={sessionForm.notes}
              onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSession}>Save Session</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorDashboard;
