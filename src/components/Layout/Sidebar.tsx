import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  School,
  Quiz,
  Assignment,
  Message,
  Person,
  Settings,
  People,
  Analytics,
  VideoLibrary,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent', 'mentor'] },
  { text: 'Domains', icon: <Settings />, path: '/domains', roles: ['admin'] },
  { text: 'Users', icon: <People />, path: '/users', roles: ['admin'] },
  { text: 'Analytics', icon: <Analytics />, path: '/analytics', roles: ['admin'] },
  { text: 'System Config', icon: <Settings />, path: '/system-config', roles: ['admin'] },
  
  // Teacher LMS Menu
  { text: 'Video Lessons', icon: <School />, path: '/teacher/video-lessons', roles: ['teacher'] },
  { text: 'Recorded Videos', icon: <VideoLibrary />, path: '/teacher/recorded-videos', roles: ['teacher'] },
  { text: 'Live Classes', icon: <VideoLibrary />, path: '/teacher/live-classes', roles: ['teacher'] },
  { text: 'Quiz Creator', icon: <Quiz />, path: '/teacher/quiz-creator', roles: ['teacher'] },
  { text: 'Quiz Rankings', icon: <Quiz />, path: '/teacher/quiz-rankings', roles: ['teacher'] },
  
  // Student LMS Menu
  { text: 'Video Lessons', icon: <School />, path: '/student/video-lessons', roles: ['student'] },
  { text: 'Recorded Videos', icon: <VideoLibrary />, path: '/student/recorded-videos', roles: ['student'] },
  { text: 'Live Classes', icon: <VideoLibrary />, path: '/student/live-classes', roles: ['student'] },
  { text: 'Quizzes', icon: <Quiz />, path: '/student/quizzes', roles: ['student'] },
  { text: 'Quiz Rankings', icon: <Quiz />, path: '/student/quiz-rankings', roles: ['student'] },
  
  // Legacy/Other
  { text: 'Lessons', icon: <School />, path: '/lessons', roles: ['teacher', 'student'] },
  { text: 'Projects', icon: <Assignment />, path: '/projects', roles: ['teacher', 'student', 'mentor'] },
  { text: 'Discussions', icon: <Message />, path: '/discussions', roles: ['teacher', 'student', 'parent'] },
  { text: 'My Children', icon: <Person />, path: '/children', roles: ['parent'] },
  { text: 'Mentoring', icon: <People />, path: '/mentoring', roles: ['mentor'] },
  { text: 'Settings', icon: <Settings />, path: '/settings', roles: ['admin', 'teacher', 'student', 'parent', 'mentor'] },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <School />
          </Avatar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            LearnFlow AI
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      {user && (
        <>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar src={user.avatar} sx={{ width: 40, height: 40 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {user.role}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider />
        </>
      )}

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};
