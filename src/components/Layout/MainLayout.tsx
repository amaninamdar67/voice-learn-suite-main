import React from 'react';
import { Box, Toolbar, Breadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AITutorEnhanced } from '../AITutor/AITutorEnhanced';
import { useSystemConfig } from '../../contexts/SystemConfigContext';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isFeatureEnabled } = useSystemConfig();
  
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  const breadcrumbNameMap: { [key: string]: string } = {
    dashboard: 'Dashboard',
    lessons: 'Lessons',
    quizzes: 'Quizzes',
    projects: 'Projects',
    discussions: 'Discussions',
    videos: 'Videos',
    settings: 'Settings',
    users: 'User Management',
    analytics: 'Analytics',
    'system-config': 'System Configuration',
    children: 'My Children',
    mentoring: 'Mentoring',
    upload: 'Upload',
    create: 'Create',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: 'background.default',
          ml: '240px',
        }}
      >
        <Toolbar />
        
        {/* Global Title */}
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          E-Learning Using AI
        </Typography>
        
        {/* Breadcrumbs */}
        {pathnames.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 3 }}
          >
            <Link
              component={RouterLink}
              to="/dashboard"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <Home sx={{ mr: 0.5, fontSize: 20 }} />
              Home
            </Link>
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const label = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

              return last ? (
                <Typography key={to} color="text.primary" fontWeight={500}>
                  {label}
                </Typography>
              ) : (
                <Link
                  key={to}
                  component={RouterLink}
                  to={to}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        
        {children}
      </Box>
      {isFeatureEnabled('aiTutor') && <AITutorEnhanced />}
    </Box>
  );
};
