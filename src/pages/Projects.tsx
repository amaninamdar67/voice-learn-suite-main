import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  AvatarGroup,
  IconButton,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Assignment,
  Add,
  Group,
  Message,
  Upload,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number;
  teamName: string;
  members: { name: string; avatar: string }[];
  status: 'active' | 'completed' | 'overdue';
}

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

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openTeamChat, setOpenTeamChat] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [chatMessage, setChatMessage] = useState('');

  const projects: Project[] = [
    {
      id: '1',
      title: 'E-Commerce Website',
      description: 'Build a full-stack e-commerce platform with React and Node.js',
      deadline: '2024-01-15',
      progress: 75,
      teamName: 'Team Alpha',
      members: [
        { name: 'Alice', avatar: 'A' },
        { name: 'Bob', avatar: 'B' },
        { name: 'Charlie', avatar: 'C' },
      ],
      status: 'active',
    },
    {
      id: '2',
      title: 'Mobile App Development',
      description: 'Create a cross-platform mobile app using React Native',
      deadline: '2024-01-20',
      progress: 60,
      teamName: 'Team Beta',
      members: [
        { name: 'Diana', avatar: 'D' },
        { name: 'Eve', avatar: 'E' },
      ],
      status: 'active',
    },
    {
      id: '3',
      title: 'AI Chatbot',
      description: 'Develop an AI-powered chatbot for customer service',
      deadline: '2024-01-10',
      progress: 90,
      teamName: 'Team Gamma',
      members: [
        { name: 'Frank', avatar: 'F' },
        { name: 'Grace', avatar: 'G' },
        { name: 'Henry', avatar: 'H' },
      ],
      status: 'active',
    },
  ];

  const teamMessages = [
    { sender: 'Alice', message: 'I completed the login page', time: '10:30 AM' },
    { sender: 'Bob', message: 'Great! I\'m working on the backend API', time: '10:45 AM' },
    { sender: 'Charlie', message: 'Should we meet tomorrow to discuss?', time: '11:00 AM' },
  ];

  const submissions = [
    { name: 'Project Proposal.pdf', date: '2024-01-05', submittedBy: 'Alice' },
    { name: 'Design Mockups.fig', date: '2024-01-08', submittedBy: 'Bob' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'primary';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Handle message send
      setChatMessage('');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {user?.role === 'teacher' ? 'Project Management' : 'My Projects'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.role === 'teacher' 
              ? 'Manage student projects and teams'
              : 'Collaborate with your team on projects'}
          </Typography>
        </Box>
        {user?.role === 'teacher' && (
          <Button variant="contained" startIcon={<Add />}>
            Create Project
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {projects.map((project) => (
          <Card
            key={project.id}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
            onClick={() => {
              setSelectedProject(project);
              setOpenTeamChat(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Assignment color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {project.title}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                {project.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {project.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={project.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Due: {project.deadline}
                  </Typography>
                </Box>
                <Chip
                  label={project.status}
                  color={getStatusColor(project.status)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {project.teamName}
                  </Typography>
                  <AvatarGroup max={4} sx={{ mt: 0.5 }}>
                    {project.members.map((member, idx) => (
                      <Avatar key={idx} sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
                        {member.avatar}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
                <IconButton size="small" color="primary">
                  <Message />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Team Chat Dialog */}
      <Dialog
        open={openTeamChat}
        onClose={() => setOpenTeamChat(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assignment color="primary" />
            <Box>
              <Typography variant="h6">{selectedProject?.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedProject?.teamName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab icon={<Group />} label="Team Members" />
            <Tab icon={<Message />} label="Team Chat" />
            <Tab icon={<Upload />} label="Submissions" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedProject?.members.map((member, idx) => (
                <Paper key={idx} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar>{member.avatar}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {member.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Team Member
                    </Typography>
                  </Box>
                  {user?.role === 'teacher' && (
                    <Button size="small" color="error">
                      Remove
                    </Button>
                  )}
                </Paper>
              ))}
              {user?.role === 'teacher' && (
                <Button variant="outlined" startIcon={<Add />}>
                  Add Team Member
                </Button>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 2, height: 400, overflow: 'auto', mb: 2, bgcolor: 'background.default' }}>
              {teamMessages.map((msg, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {msg.sender}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {msg.time}
                    </Typography>
                  </Box>
                  <Paper sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                    <Typography variant="body2">{msg.message}</Typography>
                  </Paper>
                </Box>
              ))}
            </Paper>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message... (No DMs, team chat only)"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="contained" onClick={handleSendMessage}>
                Send
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {submissions.map((sub, idx) => (
                <Paper key={idx} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {sub.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted by {sub.submittedBy} on {sub.date}
                  </Typography>
                </Paper>
              ))}
            </Box>
            {user?.role === 'student' && (
              <Button variant="contained" startIcon={<Upload />} fullWidth>
                Upload Submission
              </Button>
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamChat(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
