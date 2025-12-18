import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { MessageSquare, Phone, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface Person {
  id: string;
  full_name: string;
  department?: string;
  semester?: string;
  isActive?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

const StudentMentoringView: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Determine role and labels based on current route
  const isStudent = location.pathname.includes('/student/mentoring');
  const isTeacher = location.pathname.includes('/teacher/students');
  const isMentor = location.pathname.includes('/mentor/students');

  const getLabels = () => {
    if (isStudent) return { title: 'My Teachers', role: 'Teacher', endpoint: 'my-mentors' };
    if (isTeacher) return { title: 'My Students', role: 'Student', endpoint: 'students' };
    if (isMentor) return { title: 'My Students', role: 'Student', endpoint: 'students' };
    return { title: 'My Mentors', role: 'Mentor', endpoint: 'my-mentors' };
  };

  const labels = getLabels();

  useEffect(() => {
    if (user?.id) {
      fetchPeople();
      
      // Set up real-time polling
      const interval = setInterval(() => {
        fetchPeople();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id, location.pathname]);

  const fetchPeople = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      let endpoint = '';
      if (isStudent) {
        endpoint = `http://localhost:3001/api/mentor/my-mentors/${user.id}`;
      } else if (isTeacher || isMentor) {
        endpoint = `http://localhost:3001/api/mentor/students/${user.id}`;
      }

      if (!endpoint) throw new Error('Invalid route');

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${labels.role}s`);
      }

      const data = await response.json();
      setPeople(data.mentors || data.students || []);
    } catch (err: any) {
      console.error(`Error fetching ${labels.role}s:`, err);
      setError(`Failed to load ${labels.role}s`);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
    fetchMessages(person.id);
  };

  const fetchMessages = async (personId: string) => {
    if (!user?.id) return;

    try {
      setLoadingMessages(true);
      const response = await fetch(
        `http://localhost:3001/api/mentor/messages/${user.id}/${personId}`
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Set up real-time message polling when a person is selected
  useEffect(() => {
    if (selectedPerson && user?.id) {
      fetchMessages(selectedPerson.id);
      
      const interval = setInterval(() => {
        fetchMessages(selectedPerson.id);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [selectedPerson?.id, user?.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedPerson || !user?.id) return;

    try {
      const response = await fetch('http://localhost:3001/api/mentor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: selectedPerson.id,
          content: messageText,
        }),
      });

      if (response.ok) {
        setMessageText('');
        fetchMessages(selectedPerson.id);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!user?.id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">User not logged in</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        {selectedPerson ? (
          // Messaging View
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                {selectedPerson.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {selectedPerson.full_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {labels.role}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSelectedPerson(null)}
              >
                Back
              </Button>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="textSecondary">No messages yet. Start a conversation!</Typography>
                </Box>
              ) : (
                messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '70%',
                        bgcolor: msg.sender_id === user?.id ? 'primary.main' : '#f0f0f0',
                        color: msg.sender_id === user?.id ? 'white' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send size={20} />
              </IconButton>
            </Box>
          </Box>
        ) : (
          // People List View
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {labels.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {isStudent 
                ? 'Connect with your assigned teachers for guidance and support'
                : 'View and communicate with your assigned students'}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : people.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="textSecondary" variant="body1" sx={{ mb: 2 }}>
                  No {labels.role}s assigned yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Contact your administrator to get assigned {labels.role}s
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                {people.map((person) => (
                  <Card
                    key={person.id}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => handlePersonSelect(person)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: 'primary.main',
                              fontSize: '1.5rem',
                            }}
                          >
                            {person.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </Avatar>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              bgcolor: person.isActive ? '#4caf50' : '#bdbdbd',
                              border: '2px solid white',
                            }}
                          />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {person.full_name}
                          </Typography>
                          <Typography variant="caption" color={person.isActive ? 'success.main' : 'text.secondary'}>
                            {person.isActive ? 'Active now' : 'Inactive'}
                          </Typography>
                        </Box>
                      </Box>

                      {person.department && (
                        <Box sx={{ mb: 1.5 }}>
                          <Chip
                            label={`${person.department}${person.semester ? ` - ${person.semester}` : ''}`}
                            size="small"
                            variant="outlined"
                            sx={{ width: '100%' }}
                          />
                        </Box>
                      )}

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {isStudent 
                          ? 'Your assigned teacher is here to guide you through your learning journey.'
                          : 'Connect with your students for guidance and support.'}
                      </Typography>
                    </CardContent>

                    <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        startIcon={<MessageSquare size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePersonSelect(person);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Message
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<Phone size={16} />}
                        disabled
                        sx={{ textTransform: 'none' }}
                      >
                        Schedule
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Right Sidebar - List of People */}
      <Box
        sx={{
          width: 280,
          bgcolor: 'white',
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#f9f9f9',
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {labels.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {people.length} {labels.role}s
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            sx={{ p: 0.5 }}
          >
            {sidebarExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </Box>

        {/* Content */}
        {sidebarExpanded && (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : people.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  No one assigned yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {people.map((person, idx) => (
                  <Box key={person.id}>
                    <ListItem
                      disablePadding
                      sx={{
                        bgcolor: selectedPerson?.id === person.id ? '#e3f2fd' : 'transparent',
                        '&:hover': { bgcolor: '#f5f5f5' },
                      }}
                    >
                      <ListItemButton
                        onClick={() => handlePersonSelect(person)}
                        sx={{ py: 1 }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40, position: 'relative' }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {person.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </Avatar>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: person.isActive ? '#4caf50' : '#bdbdbd',
                              border: '1.5px solid white',
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {person.full_name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color={person.isActive ? 'success.main' : 'textSecondary'} noWrap>
                              {person.isActive ? 'Active now' : person.department ? person.department : 'Inactive'}
                              {person.department && person.semester && ` - ${person.semester}`}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {idx < people.length - 1 && <Divider sx={{ my: 0 }} />}
                  </Box>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StudentMentoringView;
