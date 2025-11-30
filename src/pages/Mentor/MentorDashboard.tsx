import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People,
  TrendingUp,
  Assignment,
  Message,
} from '@mui/icons-material';

const MentorDashboard: React.FC = () => {
  const assignedStudents = [
    { name: 'Alice Smith', progress: 85, attendance: 95, status: 'excellent' },
    { name: 'Bob Johnson', progress: 72, attendance: 88, status: 'good' },
    { name: 'Charlie Brown', progress: 58, attendance: 75, status: 'needs-attention' },
    { name: 'Diana Prince', progress: 91, attendance: 98, status: 'excellent' },
  ];

  const projectTeams = [
    { name: 'Team Alpha', project: 'E-Commerce Website', progress: 75 },
    { name: 'Team Beta', project: 'Mobile App', progress: 60 },
    { name: 'Team Gamma', project: 'AI Chatbot', progress: 85 },
  ];

  const stats = [
    { label: 'Assigned Students', value: assignedStudents.length, icon: <People />, color: 'primary.main' },
    { label: 'Project Teams', value: projectTeams.length, icon: <Assignment />, color: 'success.main' },
    { label: 'Avg Progress', value: '76%', icon: <TrendingUp />, color: 'warning.main' },
    { label: 'Pending Messages', value: '5', icon: <Message />, color: 'info.main' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Mentor Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Guide and monitor your students' progress
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ color: stat.color, mr: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Assigned Students
          </Typography>
          <Box sx={{ mt: 2 }}>
            {assignedStudents.map((student, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>{student.name.split(' ').map(n => n[0]).join('')}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {student.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Attendance: {student.attendance}%
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={student.status.replace('-', ' ')}
                      color={
                        student.status === 'excellent'
                          ? 'success'
                          : student.status === 'good'
                          ? 'primary'
                          : 'warning'
                      }
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Progress
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {student.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={student.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>

        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Project Teams
            </Typography>
            <Box sx={{ mt: 2 }}>
              {projectTeams.map((team, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {team.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {team.project}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={team.progress}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {team.progress}% Complete
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Communications
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { type: 'Student', name: 'Alice Smith', time: '2h ago' },
                { type: 'Parent', name: 'Mr. Johnson', time: '1d ago' },
                { type: 'Teacher', name: 'Ms. Davis', time: '2d ago' },
              ].map((comm, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {comm.type}: {comm.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comm.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default MentorDashboard;
