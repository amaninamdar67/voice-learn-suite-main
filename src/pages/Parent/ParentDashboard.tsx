import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Notifications,
  Message,
} from '@mui/icons-material';

const ParentDashboard: React.FC = () => {
  const children = [
    { name: 'Emma Johnson', grade: '10th', progress: 85, avatar: 'EJ' },
    { name: 'Oliver Johnson', grade: '8th', progress: 72, avatar: 'OJ' },
  ];

  const alerts = [
    { type: 'success', message: 'Emma completed her Math quiz with 95%' },
    { type: 'warning', message: 'Oliver has a project deadline tomorrow' },
    { type: 'info', message: 'New parent-teacher meeting scheduled' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Parent Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor your children's progress and stay connected
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              My Children
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
              {children.map((child, index) => (
                <Card
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {child.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {child.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {child.grade} Grade
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Overall Progress
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {child.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={child.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                'Emma completed "Introduction to React" lesson',
                'Oliver submitted Math homework',
                'Emma scored 95% on Science quiz',
                'Oliver participated in group discussion',
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
                  <Typography variant="caption" color="text.secondary">
                    {index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index} days ago`}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
              Alerts & Updates
            </Typography>
            <Box sx={{ mt: 2 }}>
              {alerts.map((alert, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    borderLeft: 4,
                    borderLeftColor:
                      alert.type === 'success'
                        ? 'success.main'
                        : alert.type === 'warning'
                        ? 'warning.main'
                        : 'info.main',
                  }}
                >
                  <Typography variant="body2">{alert.message}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <Message sx={{ mr: 1, verticalAlign: 'middle' }} />
              Messages
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { from: 'Math Teacher', message: 'Parent meeting scheduled', time: '2h ago' },
                { from: 'Science Teacher', message: 'Great progress this week!', time: '1d ago' },
              ].map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {msg.from}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {msg.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {msg.time}
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

export default ParentDashboard;
