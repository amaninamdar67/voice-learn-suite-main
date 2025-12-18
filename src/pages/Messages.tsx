import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  List,
  ListItemButton,
  ListItemAvatar,
  Chip,
} from '@mui/material';
import { Send as SendIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface Person {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedPeople = useRef(false);

  // Determine the role based on current URL
  const role = useMemo(() => {
    const path = window.location.pathname;
    if (path.includes('/teacher/')) return 'teacher';
    if (path.includes('/student/')) return 'student';
    if (path.includes('/mentor/')) return 'mentor';
    return 'student';
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('State updated:', { newMessage, sendingMessage, selectedPerson: selectedPerson?.id });
  }, [newMessage, sendingMessage, selectedPerson]);

  // Debug: Log user and role
  useEffect(() => {
    console.log('Current user:', { userId: user?.id, role });
  }, [user, role]);

  // Get the endpoint for fetching people list
  const getPeopleEndpoint = useMemo(() => {
    if (!user?.id) return '';
    if (role === 'teacher') {
      return `http://localhost:3001/api/teacher/students/${user.id}`;
    } else if (role === 'student') {
      // For students, fetch both teachers and mentors
      return `http://localhost:3001/api/teacher/all-contacts`;
    } else if (role === 'mentor') {
      return `http://localhost:3001/api/mentor/students/${user.id}`;
    }
    return '';
  }, [role, user?.id, user]);

  // Fetch people list - only once on mount
  useEffect(() => {
    if (!user?.id || !getPeopleEndpoint || hasFetchedPeople.current) return;

    const fetchPeople = async () => {
      try {
        setLoadingPeople(true);
        console.log('Fetching people from:', getPeopleEndpoint);
        const response = await fetch(getPeopleEndpoint);
        if (!response.ok) throw new Error(`Failed to fetch people: ${response.status}`);

        const data = await response.json();
        console.log('People fetched:', data);
        const peopleList = Array.isArray(data) ? data : data.students || [];
        console.log('People list:', peopleList);
        setPeople(peopleList);
        hasFetchedPeople.current = true;
      } catch (error) {
        console.error('Error fetching people:', error);
      } finally {
        setLoadingPeople(false);
      }
    };

    fetchPeople();
  }, [getPeopleEndpoint]);

  // Fetch messages when person is selected
  useEffect(() => {
    if (!user?.id || !selectedPerson?.id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await fetch(
          `http://localhost:3001/api/messages/conversation/${user.id}/${selectedPerson.id}`
        );
        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [user?.id, selectedPerson?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    console.log('handleSendMessage called', { newMessage: newMessage.trim(), selectedPerson: selectedPerson?.id, userId: user?.id });
    
    if (!newMessage.trim()) {
      console.warn('Cannot send: message is empty');
      return;
    }

    if (!selectedPerson) {
      console.warn('Cannot send: no person selected');
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
        receiver_id: selectedPerson.id,
        message: messageText,
        message_type: 'text',
      };

      console.log('Sending message with payload:', payload);

      const response = await fetch('http://localhost:3001/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend error response:', errorData);
        throw new Error(`Failed to send message: ${response.status} - ${errorData}`);
      }

      const newMsg = await response.json();
      console.log('Message sent successfully:', newMsg);
      // Add message to local state immediately
      setMessages((prevMessages) => [...prevMessages, newMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
      alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId: string, senderId: string) => {
    // Only allow deletion of own messages
    if (senderId !== user?.id) {
      alert('You can only delete your own messages');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.status}`);
      }

      // Remove message from local state
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
      console.log('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(`Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.created_at);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 0, bgcolor: '#f8f9fa', flexDirection: 'row-reverse' }}>
      {/* People List - Right Side */}
      <Paper
        sx={{
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e8eaed', bgcolor: 'white' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {role === 'teacher' ? 'My Students' : role === 'student' ? 'My Teachers' : 'My Students'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {people.length} {role === 'teacher' ? 'students' : role === 'student' ? 'teachers' : 'students'}
          </Typography>
        </Box>

        {loadingPeople ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress size={32} />
          </Box>
        ) : people.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No {role === 'teacher' ? 'students' : role === 'student' ? 'teachers' : 'students'} yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ flex: 1, overflowY: 'auto', bgcolor: 'white' }}>
            {people.map((person) => (
              <ListItemButton
                key={person.id}
                selected={selectedPerson?.id === person.id}
                onClick={() => setSelectedPerson(person)}
                sx={{
                  borderBottom: '1px solid #f0f0f0',
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: '#e3f2fd',
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                  },
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: '0.9rem' }}>
                    {person.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {person.full_name}
                    </Typography>
                    <Chip
                      label={person.role}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        textTransform: 'capitalize',
                        borderColor: person.role === 'teacher' ? '#ff9800' : person.role === 'mentor' ? '#2196f3' : '#9c27b0',
                        color: person.role === 'teacher' ? '#ff9800' : person.role === 'mentor' ? '#2196f3' : '#9c27b0',
                      }}
                    />
                  </Box>
                </Box>
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>

      {/* Messages Area - Right Side */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
        {selectedPerson ? (
          <>
            {/* Header */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: 'white',
                borderBottom: '1px solid #e8eaed',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontSize: '1.1rem' }}>
                {selectedPerson.full_name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                  {selectedPerson.full_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {selectedPerson.role}
                </Typography>
              </Box>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                bgcolor: '#f8f9fa',
              }}
            >
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={32} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ) : (
                Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <Box key={date}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.08)',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        {date}
                      </Typography>
                    </Box>
                    {dateMessages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                          mb: 1,
                          alignItems: 'flex-end',
                          gap: 1,
                        }}
                      >
                        <Paper
                          sx={{
                            maxWidth: '65%',
                            p: '10px 14px',
                            bgcolor: msg.sender_id === user?.id ? 'primary.main' : '#e8eaed',
                            color: msg.sender_id === user?.id ? 'white' : 'text.primary',
                            borderRadius: '12px',
                            boxShadow: 'none',
                            position: 'relative',
                          }}
                        >
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {msg.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                              fontSize: '0.7rem',
                            }}
                          >
                            {formatTime(msg.created_at)}
                          </Typography>
                        </Paper>
                        {msg.sender_id === user?.id && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMessage(msg.id, msg.sender_id)}
                            sx={{
                              color: 'error.main',
                              opacity: 0.6,
                              '&:hover': {
                                opacity: 1,
                                bgcolor: 'error.light',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2.5, bgcolor: 'white', borderTop: '1px solid #e8eaed' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={3}
                  size="small"
                  disabled={sendingMessage}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      bgcolor: '#f0f0f0',
                    },
                  }}
                />
                <IconButton
                  type="button"
                  onClick={() => {
                    console.log('Send button clicked', { newMessage, sendingMessage });
                    handleSendMessage();
                  }}
                  disabled={!newMessage.trim() || sendingMessage}
                  sx={{
                    bgcolor: newMessage.trim() && !sendingMessage ? 'primary.main' : '#ccc',
                    color: 'white',
                    padding: '8px',
                    '&:hover': {
                      bgcolor: newMessage.trim() && !sendingMessage ? 'primary.dark' : '#ccc',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  {sendingMessage ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6">Select a person to start messaging</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Messages;
