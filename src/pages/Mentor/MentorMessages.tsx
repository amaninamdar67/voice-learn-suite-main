import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface StudentInfo {
  student_id: string;
  student_name: string;
  unread_count: number;
  last_message: string;
  last_message_time: string;
}

interface ParentMessage {
  parent_id: string;
  parent_name: string;
  students: StudentInfo[];
}

interface Message {
  id: string;
  mentor_id: string;
  parent_id: string;
  student_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  reply_to_id?: string;
  mentor?: { id: string; full_name: string };
  parent?: { id: string; full_name: string };
  student?: { id: string; full_name: string };
}

export const MentorMessages: React.FC = () => {
  const { user } = useAuth();
  const [parents, setParents] = useState<ParentMessage[]>([]);
  const [selectedParent, setSelectedParent] = useState<ParentMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [replies, setReplies] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [messagesWithReplies, setMessagesWithReplies] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadParentMessages();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedParent) {
      loadMessagesForParent(selectedParent.parent_id);
    }
  }, [selectedParent]);

  const loadParentMessages = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all messages for this mentor
      const messagesRes = await fetch(`http://localhost:3001/api/mentor-parent/mentor-messages/${user?.id}`);
      const messagesData = await messagesRes.json();
      const allMessages = messagesData.messages || [];

      // Group messages by parent and then by student
      const parentMap = new Map<string, { parent_name: string; studentMap: Map<string, StudentInfo> }>();
      
      allMessages.forEach((msg: Message) => {
        const parentId = msg.parent_id;
        const studentId = msg.student_id;
        
        if (!parentMap.has(parentId)) {
          parentMap.set(parentId, {
            parent_name: msg.parent?.full_name || 'Unknown',
            studentMap: new Map(),
          });
        }
        
        const parentData = parentMap.get(parentId)!;
        
        if (!parentData.studentMap.has(studentId)) {
          parentData.studentMap.set(studentId, {
            student_id: studentId,
            student_name: msg.student?.full_name || 'Unknown',
            unread_count: 0,
            last_message: '',
            last_message_time: '',
          });
        }
        
        const student = parentData.studentMap.get(studentId)!;
        if (!msg.is_read) {
          student.unread_count++;
        }
        student.last_message = msg.message.substring(0, 50);
        student.last_message_time = new Date(msg.created_at).toLocaleTimeString();
      });

      // Convert to ParentMessage array
      const results: ParentMessage[] = Array.from(parentMap.entries()).map(([parentId, data]) => ({
        parent_id: parentId,
        parent_name: data.parent_name,
        students: Array.from(data.studentMap.values()),
      }));

      setParents(results);
      if (results.length > 0) {
        setSelectedParent(results[0]);
        if (results[0].students.length > 0) {
          loadMessagesForParent(results[0].parent_id, results[0].students[0].student_id);
        }
      }
    } catch (err: any) {
      console.error('Error loading parent messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesForParent = async (parentId: string, studentId?: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/mentor-parent/conversations/${user?.id}/${parentId}`);
      const data = await res.json();
      let allMessages = data.messages || [];
      
      // Filter by student if provided
      if (studentId) {
        allMessages = allMessages.filter((msg: Message) => msg.student_id === studentId);
      }
      
      // Filter to only show messages FROM parent TO mentor (incoming messages only)
      // Use sender_id to determine who actually sent the message
      allMessages = allMessages.filter((msg: Message) => {
        // Message is from parent if sender_id is the parent (not the mentor)
        // and it doesn't have a reply_to_id (original messages only, not replies)
        return msg.sender_id === msg.parent_id && !msg.reply_to_id;
      });
      
      setMessages(allMessages);
      
      // Check which messages have replies
      const withReplies = new Set<string>();
      for (const msg of allMessages) {
        try {
          const repliesRes = await fetch(`http://localhost:3001/api/mentor-parent/messages/${msg.id}/replies`);
          const repliesData = await repliesRes.json();
          if ((repliesData.replies || []).length > 0) {
            withReplies.add(msg.id);
          }
        } catch (err) {
          console.error('Error checking replies:', err);
        }
      }
      setMessagesWithReplies(withReplies);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
    setReplyText('');
    
    // Load replies
    try {
      const res = await fetch(`http://localhost:3001/api/mentor-parent/messages/${message.id}/replies`);
      const data = await res.json();
      setReplies(data.replies || []);
    } catch (err) {
      console.error('Error loading replies:', err);
    }
    
    // Mark as read
    if (!message.is_read) {
      try {
        await fetch(`http://localhost:3001/api/mentor-parent/messages/read/${message.id}`, {
          method: 'PUT',
        });
        // Update local state
        setMessages(messages.map(m => m.id === message.id ? { ...m, is_read: true } : m));
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      setSendingReply(true);
      const response = await fetch('http://localhost:3001/api/mentor-parent/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: user?.id,
          parentId: selectedMessage.parent_id,
          studentId: selectedMessage.student_id,
          replyMessage: replyText,
          originalMessageId: selectedMessage.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to send reply');

      const data = await response.json();
      setReplies([...replies, data.message]);
      setReplyText('');
      
      // Mark this message as having replies
      const newSet = new Set(messagesWithReplies);
      newSet.add(selectedMessage.id);
      setMessagesWithReplies(newSet);
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete || !user?.id) return;

    try {
      setDeletingMessage(true);
      console.log('Deleting message:', messageToDelete, 'User ID:', user.id);
      
      const response = await fetch(`http://localhost:3001/api/mentor-parent/messages/${messageToDelete}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to delete message');
        } catch (e) {
          throw new Error(errorText || 'Failed to delete message');
        }
      }

      const data = await response.json();
      console.log('Delete success:', data);
      
      // Remove the deleted message from the local state
      setMessages(messages.filter(m => m.id !== messageToDelete));
      
      // Refresh the parent messages list
      loadParentMessages();
      
      setDeleteConfirmOpen(false);
      setMessageToDelete(null);
      setMessageDialogOpen(false);
    } catch (err: any) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message: ' + err.message);
    } finally {
      setDeletingMessage(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 4 }}>
        Messages from Parents
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3 }}>
        {/* Parents List */}
        <Paper sx={{ height: 'fit-content', maxHeight: '600px', overflow: 'auto', boxShadow: 2 }}>
          <List sx={{ p: 0 }}>
            {parents.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No messages"
                  secondary="No parents have messaged you yet"
                />
              </ListItem>
            ) : (
              parents.map((parent, idx) => (
                <Box key={parent.parent_id}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2.5, px: 2.5, bgcolor: '#f8f9fa' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      width: '100%', 
                      mb: 2, 
                      pb: 2, 
                      borderBottom: '3px solid #e0e0e0',
                      borderRadius: '4px 4px 0 0'
                    }}>
                      <Avatar sx={{ width: 45, height: 45, mr: 2, bgcolor: 'primary.main', fontWeight: 700 }}>
                        {parent.parent_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.95rem' }}>
                          {parent.parent_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {parent.students.length} student{parent.students.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                    {parent.students.map((student, studentIdx) => (
                      <Box key={student.student_id} sx={{ width: '100%' }}>
                        <ListItemButton
                          selected={selectedParent?.parent_id === parent.parent_id}
                          onClick={() => {
                            setSelectedParent(parent);
                            loadMessagesForParent(parent.parent_id, student.student_id);
                          }}
                          sx={{
                            pl: 5.5,
                            pr: 1.5,
                            py: 1.25,
                            width: '100%',
                            borderRadius: 1.5,
                            mb: 0.75,
                            border: '1px solid #e0e0e0',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#e3f2fd',
                              borderColor: 'primary.main',
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#bbdefb',
                              borderLeft: '5px solid',
                              borderLeftColor: 'primary.main',
                              borderColor: 'primary.main',
                              fontWeight: 600,
                            },
                          }}
                        >
                          <Badge
                            badgeContent={student.unread_count}
                            color="error"
                            sx={{ mr: 1.5 }}
                          >
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          </Badge>
                          <ListItemText
                            primary={student.student_name}
                            secondary={student.last_message}
                            slotProps={{
                              primary: { variant: 'caption', sx: { fontWeight: 600, fontSize: '0.85rem' } },
                              secondary: { variant: 'caption', sx: { fontSize: '0.75rem' } }
                            }}
                          />
                        </ListItemButton>
                        {studentIdx < parent.students.length - 1 && (
                          <Divider sx={{ my: 0.75, ml: 5.5, mr: 1.5, borderColor: '#e0e0e0' }} />
                        )}
                      </Box>
                    ))}
                  </ListItem>
                  {idx < parents.length - 1 && <Divider sx={{ my: 0 }} />}
                </Box>
              ))
            )}
          </List>
        </Paper>

        {/* Messages Area */}
        <Paper sx={{ p: 3 }}>
          {selectedParent ? (
            <Box>
              <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight={600}>
                  {selectedParent.parent_name}
                </Typography>
                {selectedParent.students.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Student: {selectedParent.students[0].student_name}
                  </Typography>
                )}
              </Box>
              
              {/* Messages List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '500px', overflow: 'auto' }}>
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    // Extract subject from message - try "Subject:" format first, then use first line
                    let subject = 'No Subject';
                    const subjectMatch = msg.message.match(/Subject:\s*(.+?)(?:\n|$)/);
                    if (subjectMatch) {
                      subject = subjectMatch[1];
                    } else {
                      // Use first line as subject if no explicit Subject: line
                      const firstLine = msg.message.split('\n')[0];
                      if (firstLine && firstLine.trim().length > 0) {
                        subject = firstLine.substring(0, 50);
                      }
                    }
                    const hasReplies = messagesWithReplies.has(msg.id);
                    return (
                      <Paper
                        key={msg.id}
                        sx={{
                          p: 2.5,
                          cursor: 'pointer',
                          border: `2px solid ${hasReplies ? '#2196f3' : msg.is_read ? '#4caf50' : '#f44336'}`,
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                          <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleMessageClick(msg)}>
                            <Typography variant="body2" fontWeight={600}>
                              {msg.parent?.full_name} → {msg.student?.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 1 }}>
                              {new Date(msg.created_at).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {subject}
                            </Typography>
                          </Box>
                          <Trash2
                            size={18}
                            style={{
                              cursor: 'pointer',
                              color: '#ff9800',
                              flexShrink: 0,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageToDelete(msg.id);
                              setDeleteConfirmOpen(true);
                            }}
                          />
                        </Box>
                      </Paper>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No messages from this parent
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MessageSquare size={48} style={{ color: '#ccc', margin: '0 auto 16px' }} />
              <Typography color="text.secondary">
                Select a parent to view messages
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Message Detail Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Message Details</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mt: 2 }}>
            {/* Message Section */}
            <Box>
              {selectedMessage && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>From:</strong> {selectedMessage.parent?.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Student:</strong> {selectedMessage.student?.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Time:</strong> {new Date(selectedMessage.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, whiteSpace: 'pre-wrap', minHeight: '200px' }}>
                    {selectedMessage.message}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Reply Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Replies
              </Typography>
              
              {/* Existing Replies */}
              <Box sx={{ mb: 2, maxHeight: '250px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {replies.length > 0 ? (
                  replies.map((reply) => (
                    <Paper key={reply.id} sx={{ p: 1.5, bgcolor: '#e8f5e9' }}>
                      <Typography variant="caption" fontWeight={600}>
                        {reply.mentor?.full_name || 'You'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {new Date(reply.created_at).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {reply.message}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No replies yet
                  </Typography>
                )}
              </Box>

              {/* Reply Input */}
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type your reply here..."
                variant="outlined"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={sendingReply}
                sx={{ mb: 2 }}
              />
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
              >
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Are you sure you want to delete this message? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deletingMessage}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteMessage}
            color="error"
            variant="contained"
            disabled={deletingMessage}
          >
            {deletingMessage ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorMessages;
