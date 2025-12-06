import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Child {
  id: string;
  name: string;
  grade: string;
  overall_score: number;
  attendance_rate: number;
  last_active: string;
}

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChildren();
  }, [user?.id]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/parent/${user?.id}/children`);
      const data = await response.json();
      setChildren(data.children || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChildStatus = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return 'unknown';
    if (child.attendance_rate < 75) return 'at-risk';
    if (child.overall_score < 60) return 'needs-help';
    return 'good';
  };

  const avgAttendance = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + c.attendance_rate, 0) / children.length)
    : 0;

  const avgScore = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + c.overall_score, 0) / children.length)
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h4" fontWeight={600} sx={{ mb: 4 }}>
        Parent Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        My Children
      </Typography>

      {children.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No children linked yet</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell fontWeight={600}>Child</TableCell>
                <TableCell fontWeight={600}>Grade</TableCell>
                <TableCell fontWeight={600}>Overall Score</TableCell>
                <TableCell fontWeight={600}>Attendance</TableCell>
                <TableCell fontWeight={600}>Status</TableCell>
                <TableCell fontWeight={600}>Last Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((child) => {
                const status = getChildStatus(child.id);
                return (
                  <TableRow key={child.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {child.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {child.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{child.grade}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{child.overall_score}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{child.attendance_rate}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status}
                        color={
                          status === 'good'
                            ? 'success'
                            : status === 'at-risk'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {child.last_active}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ParentDashboard;
