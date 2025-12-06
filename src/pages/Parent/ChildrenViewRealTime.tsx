import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Person,
  School,
  Quiz,
  Assignment,
  VideoLibrary,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ChildrenViewRealTime: React.FC = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [childData, setChildData] = useState<any>(null);

  useEffect(() => {
    fetchChildren();
  }, [user]);

  useEffect(() => {
    if (children.length > 0) {
      fetchChildData(children[selectedChild].child.id);
    }
  }, [selectedChild, children]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/parent/${user?.id}/children`);
      const data = await response.json();
      
      if (data.success && data.children.length > 0) {
        setChildren(data.children);
        fetchChildData(data.children[0].child.id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (studentId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/parent/child/${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        setChildData(data);
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (children.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          No Children Linked
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please contact an administrator to link your children to your account.
        </Typography>
      </Box>
    );
  }

  const child = children[selectedChild];
  const stats = childData?.stats || {};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 85) return 'success';
    if (percentage >= 70) return 'primary';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        My Children
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor your children's learning progress in real-time
      </Typography>

      {/* Child Selector */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(250px, 1fr))' }, gap: 2, mb: 4 }}>
        {children.map((c, idx) => (
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
                  {c.child.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {c.child.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.child.grade && `Grade ${c.child.grade}`}
                    {c.child.section && ` - ${c.child.section}`}
                  </Typography>
                  <Chip
                    label={c.relationship_type}
                    size="small"
                    color="primary"
                    sx={{ mt: 0.5, textTransform: 'capitalize' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Child Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <Card>
              <CardContent>
                <VideoLibrary color="primary" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {stats.totalVideos || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Videos Watched
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Quiz color="success" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {stats.totalQuizzes || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quizzes Taken
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Assignment color="warning" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {stats.assignmentsCompleted || 0}/{stats.totalAssignments || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Assignments
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <School color="info" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {stats.liveClassAttendance || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Live Classes
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tabs */}
          <Paper>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Quiz Results" />
              <Tab label="Video Progress" />
              <Tab label="Assignments" />
              <Tab label="Live Classes" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quiz Performance (Real-Time)
                </Typography>
                {childData?.quizResults && childData.quizResults.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Quiz Title</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Percentage</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {childData.quizResults.map((quiz: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{quiz.lms_quizzes?.title || 'Unknown Quiz'}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {quiz.score}/{quiz.total_marks}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {Math.round(quiz.percentage)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(quiz.completed_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {quiz.percentage >= 85 ? (
                                <Chip icon={<CheckCircle />} label="Excellent" color="success" size="small" />
                              ) : quiz.percentage >= 70 ? (
                                <Chip label="Good" color="primary" size="small" />
                              ) : (
                                <Chip icon={<Warning />} label="Needs Work" color="warning" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No quiz results available
                  </Typography>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Video Lesson Progress
                </Typography>
                {childData?.videoLessons && childData.videoLessons.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Lesson Title</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Watched</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {childData.videoLessons.map((video: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{video.lms_video_lessons?.title || 'Unknown Lesson'}</TableCell>
                            <TableCell>
                              <Chip label={video.lms_video_lessons?.subject || 'N/A'} size="small" />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={video.watch_percentage}
                                  sx={{ width: 100, height: 6, borderRadius: 3 }}
                                  color={video.is_completed ? 'success' : 'primary'}
                                />
                                <Typography variant="caption">
                                  {Math.round(video.watch_percentage)}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {video.is_completed ? (
                                <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />
                              ) : (
                                <Chip label="In Progress" color="primary" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(video.last_watched_at)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No video lessons watched yet
                  </Typography>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Assignment Submissions
                </Typography>
                {childData?.assignments && childData.assignments.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Assignment</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Due Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {childData.assignments.map((assignment: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{assignment.assignments?.title || 'Unknown Assignment'}</TableCell>
                            <TableCell>
                              <Chip label={assignment.assignments?.subject || 'N/A'} size="small" />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={assignment.status}
                                size="small"
                                color={
                                  assignment.status === 'graded' ? 'success' :
                                  assignment.status === 'submitted' ? 'primary' :
                                  assignment.status === 'pending' ? 'warning' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {assignment.marks_obtained !== null ? (
                                <Typography variant="body2" fontWeight={600}>
                                  {assignment.marks_obtained}/{assignment.assignments?.total_marks}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Not graded
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {assignment.assignments?.due_date ? formatDate(assignment.assignments.due_date) : 'N/A'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No assignments available
                  </Typography>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Live Class Attendance
                </Typography>
                {childData?.liveClasses && childData.liveClasses.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Class Title</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Joined</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {childData.liveClasses.map((liveClass: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{liveClass.lms_live_classes?.title || 'Unknown Class'}</TableCell>
                            <TableCell>
                              <Chip label={liveClass.lms_live_classes?.subject || 'N/A'} size="small" />
                            </TableCell>
                            <TableCell>
                              <Chip icon={<CheckCircle />} label="Attended" color="success" size="small" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {Math.floor(liveClass.duration_seconds / 60)} min
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(liveClass.joined_at)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No live class attendance records
                  </Typography>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Box>

        {/* Summary Sidebar */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Performance Summary
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quiz Average
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.quizAverage || 0}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color={getStatusColor(stats.quizAverage || 0)}
              />
              <Typography variant="h5" fontWeight={700}>
                {stats.quizAverage || 0}%
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Video Completion Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.videoCompletionRate || 0}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color={getStatusColor(stats.videoCompletionRate || 0)}
              />
              <Typography variant="h5" fontWeight={700}>
                {stats.videoCompletionRate || 0}%
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Points Earned
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {stats.totalPoints || 0}
              </Typography>
            </Box>

            <Chip
              label={
                (stats.quizAverage || 0) >= 85 ? 'Excellent' :
                (stats.quizAverage || 0) >= 70 ? 'Good' :
                (stats.quizAverage || 0) >= 50 ? 'Needs Attention' : 'At Risk'
              }
              color={getStatusColor(stats.quizAverage || 0)}
              sx={{ width: '100%', py: 1 }}
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Quiz fontSize="small" color="primary" />
                  <Typography variant="body2">Quizzes</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {stats.totalQuizzes || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoLibrary fontSize="small" color="primary" />
                  <Typography variant="body2">Videos</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {stats.totalVideos || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment fontSize="small" color="primary" />
                  <Typography variant="body2">Assignments</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {stats.assignmentsCompleted || 0}/{stats.totalAssignments || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School fontSize="small" color="primary" />
                  <Typography variant="body2">Live Classes</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {stats.liveClassAttendance || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ChildrenViewRealTime;
