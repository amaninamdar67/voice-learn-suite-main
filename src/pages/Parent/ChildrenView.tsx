import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  School,
  Quiz,
  Assignment,
  Message,
  ChatBubble,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface LinkedStudent {
  id: string;
  full_name: string;
  email: string;
  progress?: number;
  lessonsCompleted?: number;
  quizzesPassed?: number;
  projectsActive?: number;
  attendance?: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ChildrenView: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedChild, setSelectedChild] = useState(0);
  const [tabValue, setTabValue] = useState(parseInt(searchParams.get('tab') || '0'));
  const [children, setChildren] = useState<LinkedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [mentorData, setMentorData] = useState<any>(null);
  const [mentorReplies, setMentorReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [originalMessages, setOriginalMessages] = useState<Map<string, any>>(new Map());
  const [expandedReply, setExpandedReply] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  useEffect(() => {
    loadLinkedStudents();
  }, [user]);

  useEffect(() => {
    if (children.length > 0) {
      loadActivityAndDeadlines(children[selectedChild].id);
      loadMentorReplies();
    }
  }, [selectedChild, children]);

  const loadMentorReplies = async () => {
    try {
      setLoadingReplies(true);
      if (!user?.id || children.length === 0 || !mentorData?.id) return;

      const child = children[selectedChild];
      // Fetch all messages between parent and mentor for this specific child
      const res = await fetch(`http://localhost:3001/api/mentor-parent/conversations/${mentorData.id}/${user.id}`);
      const data = await res.json();
      
      // Filter for replies only (messages where mentor is sender, parent is receiver, has reply_to_id, AND belongs to this child)
      const mentorReplies = (data.messages || []).filter((msg: any) => 
        msg.mentor_id === mentorData.id && 
        msg.parent_id === user.id && 
        msg.student_id === child.id &&
        msg.reply_to_id
      );
      
      // Fetch original messages for each reply
      const origMessages = new Map<string, any>();
      for (const reply of mentorReplies) {
        if (reply.reply_to_id && !origMessages.has(reply.reply_to_id)) {
          try {
            const allMessages = data.messages || [];
            const originalMsg = allMessages.find((msg: any) => msg.id === reply.reply_to_id && msg.student_id === child.id);
            if (originalMsg) {
              origMessages.set(reply.reply_to_id, originalMsg);
            }
          } catch (err) {
            console.error('Error fetching original message:', err);
          }
        }
      }
      
      setMentorReplies(mentorReplies);
      setOriginalMessages(origMessages);
    } catch (err) {
      console.error('Error loading mentor replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const loadLinkedStudents = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/admin-linking/parent-students/${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch linked students');
      }

      const data = await response.json();
      const linkedStudents = data.students || [];

      // Fetch real stats for each student
      const studentsWithStats = await Promise.all(
        linkedStudents.map(async (student: LinkedStudent) => {
          try {
            const statsRes = await fetch(`http://localhost:3001/api/parent-student/student-overview/${student.id}`);
            const statsData = await statsRes.json();
            return {
              ...student,
              progress: Math.round((statsData.stats.lessonsCompleted / Math.max(statsData.stats.totalCourses, 1)) * 100),
              lessonsCompleted: statsData.stats.lessonsCompleted,
              quizzesPassed: statsData.stats.quizzesCompleted,
              projectsActive: statsData.stats.assignmentsCompleted,
              attendance: statsData.stats.attendance,
            };
          } catch (err) {
            console.error('Error fetching student stats:', err);
            return student;
          }
        })
      );

      setChildren(studentsWithStats);
    } catch (err: any) {
      console.error('Error loading linked students:', err);
      setError('Failed to load linked students');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityAndDeadlines = async (studentId: string) => {
    try {
      // Load activity
      const activityRes = await fetch(`http://localhost:3001/api/parent-student/student-activity/${studentId}`);
      const activityData = await activityRes.json();
      setActivities(activityData.activities || []);

      // Load deadlines
      const deadlinesRes = await fetch(`http://localhost:3001/api/parent-student/student-deadlines/${studentId}`);
      const deadlinesData = await deadlinesRes.json();
      setDeadlines(deadlinesData.deadlines || []);

      // Load mentor data
      const mentorRes = await fetch(`http://localhost:3001/api/mentor-parent/student-mentor/${studentId}`);
      const mentorDataRes = await mentorRes.json();
      setMentorData(mentorDataRes.mentor);
      
      // Load courses (video lessons)
      const coursesRes = await fetch(`http://localhost:3001/api/lms/video-lessons?studentId=${studentId}`);
      const coursesData = await coursesRes.json();
      setCourses(coursesData.lessons || []);
      
      // Load comments (from community posts)
      const commentsRes = await fetch(`http://localhost:3001/api/parent-student/student-comments/${studentId}`);
      const commentsData = await commentsRes.json();
      setComments(commentsData.comments || []);
    } catch (err) {
      console.error('Error loading activity and deadlines:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    if (!mentorData) {
      alert('No mentor assigned to this student');
      return;
    }

    try {
      setSendingMessage(true);
      const child = children[selectedChild];

      const response = await fetch('http://localhost:3001/api/mentor-parent/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentorData.id,
          parentId: user?.id,
          studentId: child.id,
          message: `Subject: ${messageSubject}\n\n${messageContent}`,
          messageType: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      alert('Message sent successfully!');
      setMessageSubject('');
      setMessageContent('');
      loadMentorReplies(); // Refresh replies
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete || !user?.id) return;

    try {
      setDeletingMessage(true);
      const response = await fetch(`http://localhost:3001/api/mentor-parent/messages/${messageToDelete}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete message');
      }

      // Refresh the messages
      loadMentorReplies();
      setDeleteConfirmOpen(false);
      setMessageToDelete(null);
    } catch (err: any) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message: ' + err.message);
    } finally {
      setDeletingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const child = children.length > 0 ? children[selectedChild] : null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          My Children
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (children.length === 0) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          My Children
        </Typography>
        <Alert severity="info">No linked students found. Please link students in the admin panel.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        My Children
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor and manage your children's learning progress
      </Typography>

      {/* Child Selector */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {children.map((c, idx) => {
          const initials = c.full_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();

          return (
            <Card
              key={c.id}
              sx={{
                cursor: 'pointer',
                border: selectedChild === idx ? 2 : 0,
                borderColor: 'primary.main',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
              onClick={() => setSelectedChild(idx)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {c.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Student
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Child Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 3 }}>
        <Box>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, mb: 3 }}>
            <Card>
              <CardContent>
                <School color="primary" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {child.lessonsCompleted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lessons
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Quiz color="success" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {child.quizzesPassed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quizzes
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Assignment color="warning" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {child.projectsActive}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Assignments
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Person color="info" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {child.attendance}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Attendance
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <School color="secondary" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {courses.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Courses
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <ChatBubble color="error" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {comments.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Comments
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tabs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <Box
              onClick={() => setTabValue(0)}
              sx={{
                background: tabValue === 0 ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                color: tabValue === 0 ? 'white' : '#1565c0',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `2px solid ${tabValue === 0 ? '#1976d2' : '#1976d2'}`,
                boxShadow: tabValue === 0 ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                },
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                📚 Activity
              </Typography>
            </Box>

            <Box
              onClick={() => setTabValue(1)}
              sx={{
                background: tabValue === 1 ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' : 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                color: tabValue === 1 ? 'white' : '#f57c00',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `2px solid ${tabValue === 1 ? '#ff9800' : '#ff9800'}`,
                boxShadow: tabValue === 1 ? '0 4px 12px rgba(255, 152, 0, 0.3)' : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                },
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                ⏰ Deadlines
              </Typography>
            </Box>

            <Box
              onClick={() => setTabValue(2)}
              sx={{
                background: tabValue === 2 ? 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                color: tabValue === 2 ? 'white' : '#7b1fa2',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `2px solid ${tabValue === 2 ? '#9c27b0' : '#9c27b0'}`,
                boxShadow: tabValue === 2 ? '0 4px 12px rgba(156, 39, 176, 0.3)' : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                },
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                💬 Messages
              </Typography>
            </Box>

            <Box
              onClick={() => setTabValue(3)}
              sx={{
                background: tabValue === 3 ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                color: tabValue === 3 ? 'white' : '#388e3c',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `2px solid ${tabValue === 3 ? '#4caf50' : '#4caf50'}`,
                boxShadow: tabValue === 3 ? '0 4px 12px rgba(76, 175, 80, 0.3)' : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                },
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                ✅ Replies
              </Typography>
            </Box>
          </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {activities.length > 0 ? (
                    activities.map((item, idx) => (
                      <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" fontWeight={500}>{item.title}</Typography>
                        {item.content && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            "{item.content.substring(0, 100)}..."
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(item.time)}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  )}
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {deadlines.length > 0 ? (
                    deadlines.map((item, idx) => (
                      <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Due: {formatDeadline(item.dueDate)}
                            </Typography>
                          </Box>
                          <Chip
                            label={item.type}
                            size="small"
                            color={item.type === 'quiz' ? 'primary' : 'warning'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No upcoming deadlines
                    </Typography>
                  )}
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 2 }}>
                {mentorData ? (
                  <Typography variant="body2" sx={{ mb: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                    Mentor: <strong>{mentorData.full_name}</strong>
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    No mentor assigned to this student
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Subject"
                    placeholder="Message subject"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    disabled={sendingMessage}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Message"
                    placeholder="Type your message here..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    disabled={sendingMessage}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Message />}
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !mentorData}
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 2 }}>
                {/* Mentor Replies Section */}
                <Box>
                  
                  {loadingReplies ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : mentorReplies.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {mentorReplies.map((reply) => {
                        const originalMsg = originalMessages.get(reply.reply_to_id);
                        const originalSubject = originalMsg?.message.match(/Subject:\s*(.+?)(?:\n|$)/)?.[1] || 'No Subject';
                        const isExpanded = expandedReply === reply.id;
                        const messagePreview = reply.message.substring(0, 80);
                        const isLong = reply.message.length > 80;
                        
                        return (
                          <Box key={reply.id}>
                            {/* Original Message - Compact */}
                            {originalMsg && (
                              <Paper sx={{ p: 1.5, mb: 1, bgcolor: '#fff3e0', border: '1px solid #ffb74d' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                                      Your Message:
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.3 }}>
                                      {originalSubject}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                      {new Date(originalMsg.created_at).toLocaleString()}
                                    </Typography>
                                    <DeleteIcon
                                      sx={{
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                        color: '#ff9800',
                                        '&:hover': { color: '#f57c00' },
                                      }}
                                      onClick={() => {
                                        setMessageToDelete(originalMsg.id);
                                        setDeleteConfirmOpen(true);
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Paper>
                            )}
                            
                            {/* Mentor Reply - Expandable */}
                            <Paper 
                              sx={{ 
                                p: 2, 
                                bgcolor: '#f0f7ff', 
                                border: '2px solid #2196f3',
                                cursor: isLong ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                '&:hover': isLong ? { boxShadow: 2 } : {}
                              }}
                              onClick={() => isLong && setExpandedReply(isExpanded ? null : reply.id)}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {reply.mentor?.full_name || 'Mentor'} replied:
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                                  {new Date(reply.created_at).toLocaleString()}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                                {isExpanded ? reply.message : messagePreview}
                                {isLong && !isExpanded && '...'}
                              </Typography>
                              {isLong && (
                                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1, fontWeight: 600 }}>
                                  {isExpanded ? 'Show less' : 'Show more'}
                                </Typography>
                              )}
                            </Paper>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No replies from mentor yet
                    </Typography>
                  )}
                </Box>
              </Box>
            </TabPanel>
        </Box>

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
    </Box>
  );
};

export default ChildrenView;
