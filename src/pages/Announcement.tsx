import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Send as SendIcon, Warning as WarningIcon, Info as InfoIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Announcement {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
  announcement_tag: string;
}

const TAG_OPTIONS = [
  { value: 'normal', label: 'Normal', color: '#2196f3', bgColor: '#e3f2fd' },
  { value: 'urgent', label: 'Urgent', color: '#d32f2f', bgColor: '#ffebee' },
  { value: 'important', label: 'Important', color: '#f57c00', bgColor: '#fff3e0' },
  { value: 'info', label: 'Info', color: '#388e3c', bgColor: '#e8f5e9' },
];

const Announcement: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState('normal');
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedAnnouncements = useRef(false);

  // Determine the role based on current URL
  const role = useMemo(() => {
    const path = window.location.pathname;
    if (path.includes('/teacher/')) return 'teacher';
    if (path.includes('/student/')) return 'student';
    if (path.includes('/mentor/')) return 'mentor';
    return 'student';
  }, []);

  // Check if user can send announcements
  const canSend = useMemo(() => {
    return role === 'teacher' || role === 'mentor';
  }, [role]);

  // Fetch all announcements - refresh on mount and when announcements change
  useEffect(() => {
    if (!user?.id) return;

    const fetchAnnouncements = async () => {
      try {
        setLoadingAnnouncements(true);
        console.log('Fetching all announcements for user:', user?.id);
        const response = await fetch(`http://localhost:3001/api/announcements/all/${user?.id}?t=${Date.now()}`);
        if (!response.ok) throw new Error(`Failed to fetch announcements: ${response.status}`);

        const data = await response.json();
        console.log('Announcements fetched:', data);
        
        // Deduplicate announcements by sender_id and created_at
        const uniqueAnnouncements = Array.from(
          new Map(
            (Array.isArray(data) ? data : []).map((ann) => [
              `${ann.sender_id}-${ann.created_at}`,
              ann,
            ])
          ).values()
        );
        
        setAnnouncements(uniqueAnnouncements);

        // Mark all announcements as read for this user
        if (user?.id) {
          try {
            const markReadResponse = await fetch(`http://localhost:3001/api/announcements/mark-read/${user.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
            });
            if (markReadResponse.ok) {
              console.log('✅ Announcements marked as read');
            }
          } catch (error) {
            console.error('Error marking announcements as read:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, [user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [announcements]);

  const handleSendAnnouncement = async () => {
    if (!newMessage.trim()) {
      console.warn('Cannot send: message is empty');
      return;
    }

    if (!user?.id) {
      console.warn('Cannot send: user not authenticated');
      return;
    }

    const messageText = newMessage.trim();
    try {
      setSendingMessage(true);
      setNewMessage('');

      const payload = {
        sender_id: user.id,
        message: messageText,
        message_type: 'announcement',
        announcement_tag: selectedTag,
      };

      console.log('Sending announcement with payload:', payload);

      const response = await fetch('http://localhost:3001/api/announcements/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend error response:', errorData);
        throw new Error(`Failed to send announcement: ${response.status} - ${errorData}`);
      }

      const newMsg = await response.json();
      console.log('Announcement sent successfully:', newMsg);
      setAnnouncements((prevAnnouncements) => [...prevAnnouncements, newMsg]);
    } catch (error) {
      console.error('Error sending announcement:', error);
      setNewMessage(messageText);
      alert(`Failed to send announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteClick = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!announcementToDelete) return;

    try {
      setDeletingId(announcementToDelete.id);
      const response = await fetch(`http://localhost:3001/api/announcements/${announcementToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: user?.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete announcement: ${response.status}`);
      }

      // Remove announcement from local state
      setAnnouncements((prevAnnouncements) => 
        prevAnnouncements.filter((ann) => ann.id !== announcementToDelete.id)
      );
      console.log('Announcement deleted successfully');
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert(`Failed to delete announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
  };

  const getTagStyle = (tag: string) => {
    const tagOption = TAG_OPTIONS.find((t) => t.value === tag);
    return tagOption || TAG_OPTIONS[0];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'auto', width: '100%' }}>
      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Announcements
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Input Area - Only for teachers/mentors - AT TOP */}
      {canSend && (
        <Box sx={{ p: 0, bgcolor: 'transparent', borderTop: 'none', mb: 3 }}>
          <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#333' }}>
              📢 Broadcast Announcement to All Students
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={selectedTag}
                  label="Priority"
                  onChange={(e) => setSelectedTag(e.target.value)}
                  size="small"
                  disabled={sendingMessage}
                >
                  {TAG_OPTIONS.map((tag) => (
                    <MenuItem key={tag.value} value={tag.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: tag.color,
                          }}
                        />
                        {tag.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                placeholder="Type your announcement here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnnouncement();
                  }
                }}
                multiline
                maxRows={4}
                size="small"
                disabled={sendingMessage}
                sx={{
                  flex: 1,
                  minWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8f9fa',
                    '&:hover': {
                      bgcolor: '#f0f0f0',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendAnnouncement}
                disabled={!newMessage.trim() || sendingMessage}
                sx={{
                  height: '40px',
                  minWidth: '120px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                }}
                startIcon={sendingMessage ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Announcements Feed */}
      <Box
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          bgcolor: 'transparent',
          maxWidth: '900px',
          mx: 'auto',
          width: '100%',
        }}
      >
          {loadingAnnouncements ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={40} />
            </Box>
          ) : announcements.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
              <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }} />
              <Typography variant="body2" color="text.secondary">
                No announcements yet
              </Typography>
            </Box>
          ) : (
            announcements.map((announcement) => {
              const tagStyle = getTagStyle(announcement.announcement_tag);
              const isDeleting = deletingId === announcement.id;
              return (
                <Paper
                  key={announcement.id}
                  sx={{
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    borderLeft: `5px solid ${tagStyle.color}`,
                    transition: 'all 0.3s ease',
                    opacity: isDeleting ? 0.5 : 1,
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: tagStyle.color,
                        width: 48,
                        height: 48,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                      }}
                    >
                      {announcement.sender_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {announcement.sender_name}
                        </Typography>
                        <Chip
                          label={TAG_OPTIONS.find((t) => t.value === (announcement.announcement_tag || 'normal'))?.label || 'Normal'}
                          size="small"
                          sx={{
                            bgcolor: tagStyle.bgColor,
                            color: tagStyle.color,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: '24px',
                          }}
                          icon={(announcement.announcement_tag || 'normal') === 'urgent' ? <WarningIcon sx={{ fontSize: '0.9rem' }} /> : undefined}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(announcement.created_at)}
                      </Typography>
                    </Box>
                    {announcement.sender_id === user?.id && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(announcement)}
                        disabled={isDeleting}
                        sx={{
                          color: 'error.main',
                          opacity: 0.6,
                          '&:hover': {
                            opacity: 1,
                            bgcolor: 'error.light',
                          },
                          '&:disabled': {
                            opacity: 0.3,
                          },
                        }}
                      >
                        {isDeleting ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
                      </IconButton>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-word',
                      lineHeight: 1.7,
                      color: '#333',
                      fontSize: '0.95rem',
                    }}
                  >
                    {announcement.message}
                  </Typography>
                </Paper>
              );
            })
          )}
          <div ref={messagesEndRef} />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <DeleteIcon />
          Delete Announcement
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to delete this announcement? This action cannot be undone.
          </Typography>
          {announcementToDelete && (
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Message:
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {announcementToDelete.message}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            disabled={deletingId !== null}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deletingId !== null}
            startIcon={deletingId ? <CircularProgress size={18} /> : <DeleteIcon />}
          >
            {deletingId ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcement;
