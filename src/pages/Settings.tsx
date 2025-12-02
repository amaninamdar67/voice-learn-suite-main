import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Slider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  VolumeUp,
  Notifications,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { VoiceSettings } from '../types';
import { VoiceSettingsPanel } from '../components/VoiceSettings/VoiceSettingsPanel';

const PasswordResetForm: React.FC<{ userId?: string }> = ({ userId }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      <TextField
        fullWidth
        label="Current Password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <TextField
        fullWidth
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        helperText="Minimum 6 characters"
      />
      <TextField
        fullWidth
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={handleChangePassword}
        disabled={loading || !newPassword || !confirmPassword}
        startIcon={loading && <CircularProgress size={20} />}
        sx={{ mt: 2 }}
      >
        {loading ? 'Changing...' : 'Change Password'}
      </Button>
    </Box>
  );
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceType: 'female',
    speed: 1.0,
    enabled: true,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lessons: true,
    quizzes: true,
    discussions: false,
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update email in Supabase Auth
      const response = await fetch('http://localhost:3001/api/users/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: profileData.email,
          name: profileData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully! Please log in again with your new email.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account and preferences
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Profile Settings */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Person color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Profile Settings
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            
            <TextField
              fullWidth
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Role"
              value={user?.role}
              disabled
              sx={{ textTransform: 'capitalize' }}
            />
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>

        {/* Voice & Accessibility */}
        <VoiceSettingsPanel />

        {/* Notification Preferences */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Notifications color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.email}
                  onChange={(e) =>
                    setNotifications({ ...notifications, email: e.target.checked })
                  }
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.push}
                  onChange={(e) =>
                    setNotifications({ ...notifications, push: e.target.checked })
                  }
                />
              }
              label="Push Notifications"
            />
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Notify me about:
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.lessons}
                  onChange={(e) =>
                    setNotifications({ ...notifications, lessons: e.target.checked })
                  }
                />
              }
              label="New Lessons"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.quizzes}
                  onChange={(e) =>
                    setNotifications({ ...notifications, quizzes: e.target.checked })
                  }
                />
              }
              label="Quiz Deadlines"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.discussions}
                  onChange={(e) =>
                    setNotifications({ ...notifications, discussions: e.target.checked })
                  }
                />
              }
              label="Discussion Replies"
            />
          </Box>
        </Paper>

        {/* Security */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Security color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Security
            </Typography>
          </Box>

          <PasswordResetForm userId={user?.id} />
        </Paper>
      </Box>
    </Box>
  );
};

export default Settings;
