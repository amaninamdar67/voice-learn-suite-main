import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
} from '@mui/material';
import {
  Person,
  School,
  Quiz,
  Assignment,
  Message,
  Timer,
  Block,
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

const ChildrenView: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [screenTimeLimit, setScreenTimeLimit] = useState(120);
  const [contentFilter, setContentFilter] = useState(true);

  const children = [
    {
      name: 'Emma Johnson',
      grade: '10th',
      avatar: 'EJ',
      progress: 85,
      lessonsCompleted: 12,
      quizzesPassed: 8,
      projectsActive: 2,
      attendance: 95,
    },
    {
      name: 'Oliver Johnson',
      grade: '8th',
      avatar: 'OJ',
      progress: 72,
      lessonsCompleted: 9,
      quizzesPassed: 6,
      projectsActive: 1,
      attendance: 88,
    },
  ];

  const recentActivity = [
    { activity: 'Completed "Introduction to React" lesson', time: '2 hours ago' },
    { activity: 'Scored 95% on Math quiz', time: '1 day ago' },
    { activity: 'Submitted project milestone', time: '2 days ago' },
    { activity: 'Participated in discussion forum', time: '3 days ago' },
  ];

  const upcomingDeadlines = [
    { title: 'Science Quiz', date: 'Tomorrow', type: 'quiz' },
    { title: 'Math Project', date: 'In 3 days', type: 'project' },
    { title: 'English Essay', date: 'Next week', type: 'assignment' },
  ];

  const child = children[selectedChild];

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        My Children
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor and manage your children's learning progress
      </Typography>

      {/* Child Selector */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        {children.map((c, idx) => (
          <Card
            key={idx}
            sx={{
              cursor: 'pointer',
              border: selectedChild === idx ? 2 : 0,
              borderColor: 'primary.main',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 4,
              },
            }}
            onClick={() => setSelectedChild(idx)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  {c.avatar}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {c.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.grade} Grade
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Child Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <Card>
              <CardContent>
                <School color="primary" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {child.lessonsCompleted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lessons
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Quiz color="success" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {child.quizzesPassed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quizzes
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Assignment color="warning" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {child.projectsActive}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Projects
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Person color="info" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {child.attendance}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Attendance
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tabs */}
          <Paper>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Activity" />
              <Tab label="Deadlines" />
              <Tab label="Messages" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  {recentActivity.map((item, idx) => (
                    <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2">{item.activity}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.time}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Upcoming Deadlines
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {upcomingDeadlines.map((item, idx) => (
                    <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due: {item.date}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.type}
                          size="small"
                          color="primary"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Send Message
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="To"
                    defaultValue="teacher"
                    SelectProps={{ native: true }}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Subject"
                    placeholder="Message subject"
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Message"
                    placeholder="Type your message here..."
                  />
                  <Button variant="contained" startIcon={<Message />}>
                    Send Message
                  </Button>
                </Box>
              </Box>
            </TabPanel>
          </Paper>
        </Box>

        {/* Controls Sidebar */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Timer color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Parental Controls
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Screen Time Limit
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  type="number"
                  size="small"
                  value={screenTimeLimit}
                  onChange={(e) => setScreenTimeLimit(parseInt(e.target.value))}
                  sx={{ width: 100 }}
                />
                <Typography variant="body2" color="text.secondary">
                  minutes/day
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(screenTimeLimit / 180) * 100}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={contentFilter}
                  onChange={(e) => setContentFilter(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Block fontSize="small" />
                  <Typography variant="body2">Content Filter</Typography>
                </Box>
              }
            />

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, ml: 4 }}>
              Restrict access to inappropriate content
            </Typography>

            <Button variant="contained" fullWidth sx={{ mt: 3 }}>
              Save Controls
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Overall Progress
            </Typography>
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Typography variant="h2" fontWeight={700} color="primary">
                {child.progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={child.progress}
                sx={{ mt: 2, height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              Excellent progress this semester!
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ChildrenView;
