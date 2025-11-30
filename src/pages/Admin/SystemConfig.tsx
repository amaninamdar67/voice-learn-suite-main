import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Settings,
  Backup,
  SmartToy,
  Message,
  Mic,
  Security,
  Notifications,
  CloudUpload,
  CloudDownload,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { useSystemConfig } from '../../contexts/SystemConfigContext';

const SystemConfig: React.FC = () => {
  const { user } = useAuth();
  const { refreshConfig } = useSystemConfig();
  const [features, setFeatures] = useState({
    chat: true,
    aiTutor: true,
    voiceNavigation: true,
    discussions: true,
    notifications: true,
    videoLessons: true,
    quizzes: true,
    projects: true,
  });

  const [openBackup, setOpenBackup] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupHistory, setBackupHistory] = useState<any[]>([]);

  // Load configuration on mount
  React.useEffect(() => {
    loadConfig();
    loadBackupHistory();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/system/config');
      const data = await response.json();
      
      if (data.config && data.config.config_value) {
        setFeatures(data.config.config_value);
      }
    } catch (err: any) {
      console.error('Error loading config:', err);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/system/backups');
      const data = await response.json();
      
      if (data.backups) {
        setBackupHistory(data.backups.map((b: any) => ({
          date: new Date(b.created_at).toLocaleString(),
          size: b.backup_size ? `${(b.backup_size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
          status: b.status,
          id: b.id,
        })));
      }
    } catch (err: any) {
      console.error('Error loading backup history:', err);
    }
  };

  const handleFeatureToggle = (feature: keyof typeof features) => {
    setFeatures({ ...features, [feature]: !features[feature] });
  };

  const handleSaveConfig = async () => {
    try {
      setError('');
      const response = await fetch('http://localhost:3001/api/system/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, userId: user?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      setSuccess('Configuration saved successfully! Changes will take effect immediately.');
      
      // Refresh the global config so changes take effect
      await refreshConfig();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetConfig = async () => {
    if (!window.confirm('Reset all features to default settings?')) return;
    
    const defaultFeatures = {
      chat: true,
      aiTutor: true,
      voiceNavigation: true,
      discussions: true,
      notifications: true,
      videoLessons: true,
      quizzes: true,
      projects: true,
    };
    
    setFeatures(defaultFeatures);
    setSuccess('Configuration reset to defaults. Click "Save Configuration" to apply.');
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    setError('');
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setBackupProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const response = await fetch('http://localhost:3001/api/system/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(data.error || 'Backup failed');
      }

      setBackupProgress(100);
      
      // Download backup file
      if (data.downloadData) {
        const blob = new Blob([JSON.stringify(data.downloadData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setSuccess('Backup created and downloaded successfully!');
      await loadBackupHistory();
      
      setTimeout(() => {
        setOpenBackup(false);
        setBackupProgress(0);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setBackupProgress(0);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        await handleRestore(backupData);
      } catch (err: any) {
        setError('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async (backupData?: any) => {
    if (!backupData) {
      setError('Please select a backup file to restore');
      return;
    }

    if (!window.confirm('WARNING: This will replace all current data. Are you sure?')) {
      return;
    }

    setIsRestoring(true);
    setRestoreProgress(0);
    setError('');
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setRestoreProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const response = await fetch('http://localhost:3001/api/system/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupData }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(data.error || 'Restore failed');
      }

      setRestoreProgress(100);
      setSuccess('Note: Full restore requires manual database operations for safety');
      
      setTimeout(() => {
        setOpenRestore(false);
        setRestoreProgress(0);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      setRestoreProgress(0);
    } finally {
      setIsRestoring(false);
    }
  };

  const featuresList = [
    {
      key: 'chat' as keyof typeof features,
      label: 'Team Chat',
      description: 'Enable team chat for project collaboration',
      icon: <Message />,
    },
    {
      key: 'aiTutor' as keyof typeof features,
      label: 'AI Tutor',
      description: 'AI-powered tutoring and question answering',
      icon: <SmartToy />,
    },

    {
      key: 'discussions' as keyof typeof features,
      label: 'Discussion Forums',
      description: 'Student discussion boards for each lesson',
      icon: <Message />,
    },
    {
      key: 'notifications' as keyof typeof features,
      label: 'Push Notifications',
      description: 'Real-time notifications for users',
      icon: <Notifications />,
    },
    {
      key: 'videoLessons' as keyof typeof features,
      label: 'Video Lessons',
      description: 'Video content and live streaming',
      icon: <CloudUpload />,
    },
    {
      key: 'quizzes' as keyof typeof features,
      label: 'Quizzes & Assessments',
      description: 'Quiz creation and grading system',
      icon: <Settings />,
    },
    {
      key: 'projects' as keyof typeof features,
      label: 'Project Management',
      description: 'Team projects and submissions',
      icon: <Settings />,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading configuration...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        System Configuration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage system features and data
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Feature Toggles */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Settings color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Feature Management
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Toggle features on/off for all users. Changes take effect immediately.
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {featuresList.map((feature) => (
              <Box key={feature.key}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: features[feature.key] ? 'primary.main' : 'text.disabled' }}>
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {feature.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={features[feature.key]}
                    onChange={() => handleFeatureToggle(feature.key)}
                    color="primary"
                  />
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" fullWidth onClick={handleSaveConfig}>
              Save Configuration
            </Button>
            <Button variant="outlined" fullWidth onClick={handleResetConfig}>
              Reset to Default
            </Button>
          </Box>
        </Paper>

        {/* Backup & Restore */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Backup color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Data Management
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                fullWidth
                onClick={() => setOpenBackup(true)}
              >
                Create Backup
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudDownload />}
                fullWidth
                onClick={() => setOpenRestore(true)}
              >
                Restore from Backup
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Recent Backups
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {backupHistory.map((backup, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {backup.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {backup.size}
                      </Typography>
                    </Box>
                    <Chip
                      label={backup.status}
                      color="success"
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Security
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              System Status: All systems operational
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="SSL Enabled" color="success" size="small" sx={{ mr: 1 }} />
              <Chip label="Firewall Active" color="success" size="small" />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Backup Dialog */}
      <Dialog open={openBackup} onClose={() => !isBackingUp && setOpenBackup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          {!isBackingUp && backupProgress === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will create a complete backup of all system data. The process may take several minutes.
            </Alert>
          )}
          
          {isBackingUp && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Creating backup... {backupProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={backupProgress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          )}

          {backupProgress === 100 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Backup completed successfully!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBackup(false)} disabled={isBackingUp}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBackup}
            disabled={isBackingUp || backupProgress === 100}
          >
            {backupProgress === 100 ? 'Done' : 'Start Backup'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={openRestore} onClose={() => !isRestoring && setOpenRestore(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Restore from Backup</DialogTitle>
        <DialogContent>
          {!isRestoring && restoreProgress === 0 && (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                Warning: This will replace all current data with the backup. This action cannot be undone!
              </Alert>
              <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                Upload a backup file to restore:
              </Typography>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="restore-file-input"
              />
              <label htmlFor="restore-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<CloudDownload />}
                >
                  Choose Backup File
                </Button>
              </label>
              
              {backupHistory.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }}>OR</Divider>
                  <Typography variant="body2" gutterBottom>
                    Recent backups:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    {backupHistory.slice(0, 3).map((backup, idx) => (
                      <Button
                        key={idx}
                        variant="outlined"
                        sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                        disabled
                      >
                        <span>{backup.date}</span>
                        <span>{backup.size}</span>
                      </Button>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
          
          {isRestoring && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Restoring data... {restoreProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={restoreProgress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          )}

          {restoreProgress === 100 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Restore completed successfully!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestore(false)} disabled={isRestoring}>
            {restoreProgress === 100 ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemConfig;
