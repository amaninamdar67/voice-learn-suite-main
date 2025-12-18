import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface UrgentAnnouncement {
  id: string;
  message: string;
  sender_name: string;
  sender_id: string;
  created_at: string;
  announcement_tag: string;
}

export const NotificationPanel: React.FC = () => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [urgentAnnouncements, setUrgentAnnouncements] = useState<UrgentAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch urgent announcements
  useEffect(() => {
    if (!user?.id) return;

    const fetchUrgentAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/announcements/unread-urgent/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUrgentAnnouncements(data.announcements || []);
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching urgent announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentAnnouncements();
    
    // Poll every 5 seconds
    const interval = setInterval(fetchUrgentAnnouncements, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleDeleteAnnouncement = async (announcementId: string, senderId: string) => {
    // Only allow deletion of own announcements
    if (senderId !== user?.id) {
      alert('You can only delete your own announcements');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete announcement: ${response.status}`);
      }

      // Remove from local state
      setUrgentAnnouncements((prev) => prev.filter((ann) => ann.id !== announcementId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      console.log('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert(`Failed to delete announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateStr = '';
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday';
    } else {
      dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'relative',
          color: unreadCount > 0 ? '#d32f2f' : 'inherit',
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#d32f2f',
              color: '#fff',
              fontSize: '0.65rem',
              height: '20px',
              minWidth: '20px',
              padding: '0 4px',
              fontWeight: 700,
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper
          sx={{
            width: 380,
            maxHeight: 500,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#d32f2f',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon />
              <Typography variant="subtitle1" fontWeight={700}>
                Urgent Announcements
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: 'white' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider />

          {/* Content */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : urgentAnnouncements.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  No urgent announcements
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {urgentAnnouncements.map((announcement, index) => (
                  <React.Fragment key={announcement.id}>
                    <ListItem
                      sx={{
                        p: 2,
                        bgcolor: index % 2 === 0 ? '#fafafa' : 'white',
                        borderLeft: '4px solid #d32f2f',
                        '&:hover': {
                          bgcolor: '#f5f5f5',
                        },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 0.5,
                            }}
                          >
                            {announcement.message}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              From: {announcement.sender_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {formatDateTime(announcement.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                      {announcement.sender_id === user?.id && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAnnouncement(announcement.id, announcement.sender_id)}
                          sx={{
                            color: 'error.main',
                            opacity: 0.6,
                            ml: 1,
                            '&:hover': {
                              opacity: 1,
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItem>
                    {index < urgentAnnouncements.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      </Popover>
    </>
  );
};
