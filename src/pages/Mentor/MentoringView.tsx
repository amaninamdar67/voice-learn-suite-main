import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Quiz,
  School,
  Message,
  CheckCircle,
  Warning,
  VideoLibrary,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  grade: string;
  section: string;
  avatar?: string;
}

interface QuizResult {
  quiz_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  completed_at: string;
}

interface AttendanceData {
  type: string;
  title: string;
  date: string;
  percentage: number;
  duration?: number;
}

interface AssignmentData {
  title: string;
  status: string;
  marks_obtained: number | null;
  total_marks: number;
  submitted_at: string | null;
  graded_at: string | null;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const MentoringView: React.FC = () => {
  const { user } = useAuth();
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [assignmentData, setAssignmentData] = useState<AssignmentData[]>([]);
  const [studentStats, setStudentStats] = useState({
    totalPoints: 0,
    quizAverage: 0,
    attendanceRate: 0,
    assignmentsCompleted: 0,
    totalAssignments: 0,
  });

  useEffect(() => {
    fetchMentees();
  }, [user]);

  useEffect(() => {
    if (students.length > 0) {
      fetchStudentData(students[selectedStudentIndex].id);
    }
  }, [selectedStudentIndex, students]);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      // Fetch students assigned to this mentor
      const { data: mentees, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, grade, section, avatar')
        .eq('mentor_id', user?.id)
        .eq('role', 'student');

      if (error) throw error;

      setStudents(mentees || []);
      if (mentees && mentees.length > 0) {
        fetchStudentData(mentees[0].id);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      // Fetch quiz results
      const { data: quizData } = await supabase
        .from('quiz_results')
        .select(`
          score,
          total_marks,
          percentage,
          completed_at,
          quizzes (title)
        `)
        .eq('student_id', studentId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(10);

      const formattedQuizResults = quizData?.map((q: any) => ({
        quiz_title: q.quizzes?.title || 'Unknown Quiz',
        score: q.score,
        total_marks: q.total_marks,
        percentage: q.percentage,
        completed_at: q.completed_at,
      })) || [];
      setQuizResults(formattedQuizResults);

      // Fetch video lesson attendance
      const { data: lessonAttendance } = await supabase
        .from('lesson_attendance')
        .select(`
          watch_percentage,
          is_completed,
          last_watched_at,
          video_lessons (title)
        `)
        .eq('student_id', studentId)
        .order('last_watched_at', { ascending: false })
        .limit(10);

      // Fetch live class attendance
      const { data: liveAttendance } = await supabase
        .from('live_attendance')
        .select(`
          duration_seconds,
          joined_at,
          left_at,
          live_classes (title, duration_minutes)
        `)
        .eq('student_id', studentId)
        .order('joined_at', { ascending: false })
        .limit(10);

      // Combine attendance data
      const combinedAttendance: AttendanceData[] = [
        ...(lessonAttendance?.map((la: any) => ({
          type: 'Video Lesson',
          title: la.video_lessons?.title || 'Unknown Lesson',
          date: la.last_watched_at,
          percentage: la.watch_percentage,
        })) || []),
        ...(liveAttendance?.map((la: any) => ({
          type: 'Live Class',
          title: la.live_classes?.title || 'Unknown Class',
          date: la.joined_at,
          percentage: la.live_classes?.duration_minutes 
            ? (la.duration_seconds / (la.live_classes.duration_minutes * 60)) * 100 
            : 0,
          duration: la.duration_seconds,
        })) || []),
      ];
      setAttendanceData(combinedAttendance);

      // Fetch assignment submissions
      const { data: assignments } = await supabase
        .from('assignment_submissions')
        .select(`
          status,
          marks_obtained,
          submitted_at,
          graded_at,
          assignments (title, total_marks)
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(10);

      const formattedAssignments = assignments?.map((a: any) => ({
        title: a.assignments?.title || 'Unknown Assignment',
        status: a.status,
        marks_obtained: a.marks_obtained,
        total_marks: a.assignments?.total_marks || 0,
        submitted_at: a.submitted_at,
        graded_at: a.graded_at,
      })) || [];
      setAssignmentData(formattedAssignments);

      // Calculate stats
      const quizAvg = formattedQuizResults.length > 0
        ? formattedQuizResults.reduce((sum, q) => sum + q.percentage, 0) / formattedQuizResults.length
        : 0;

      const attendanceRate = combinedAttendance.length > 0
        ? combinedAttendance.reduce((sum, a) => sum + a.percentage, 0) / combinedAttendance.length
        : 0;

      const assignmentsCompleted = formattedAssignments.filter(a => a.status === 'graded').length;
      const totalAssignments = formattedAssignments.length;

      const totalPoints = formattedQuizResults.reduce((sum, q) => sum + q.score, 0) +
        formattedAssignments.reduce((sum, a) => sum + (a.marks_obtained || 0), 0);

      setStudentStats({
        totalPoints,
        quizAverage: quizAvg,
        attendanceRate,
        assignmentsCompleted,
        totalAssignments,
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (students.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          No Students Assigned
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have any students assigned to you yet.
        </Typography>
      </Box>
    );
  }

  const student = students[selectedStudentIndex];

  const getStatusColor = (percentage: number) => {
    if (percentage >= 85) return 'success';
    if (percentage >= 70) return 'primary';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Needs Attention';
    return 'At Risk';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Student Mentoring
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor and guide your assigned students
      </Typography>

      {/* Student Selector */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        {students.map((s, idx) => {
          const avgPerformance = idx === selectedStudentIndex ? studentStats.quizAverage : 0;
          return (
            <Card
              key={s.id}
              sx={{
                cursor: 'pointer',
                border: selectedStudentIndex === idx ? 2 : 0,
                borderColor: 'primary.main',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
              onClick={() => setSelectedStudentIndex(idx)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {s.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {s.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.grade && `Grade ${s.grade}`} {s.section && `- ${s.section}`}
                    </Typography>
                  </Box>
                  {idx === selectedStudentIndex && (
                    <Chip
                      label={getStatusLabel(avgPerformance)}
                      color={getStatusColor(avgPerformance)}
                      size="small"
                    />
                  )}
                </Box>
                {idx === selectedStudentIndex && (
                  <>
                    <LinearProgress
                      variant="determinate"
                      value={avgPerformance}
                      sx={{ height: 6, borderRadius: 3 }}
                      color={getStatusColor(avgPerformance)}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Average: {Math.round(avgPerformance)}%
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Student Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab icon={<Quiz />} label="Quiz Scores" iconPosition="start" />
              <Tab icon={<School />} label="Attendance" iconPosition="start" />
              <Tab icon={<AssignmentIcon />} label="Assignments" iconPosition="start" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quiz Performance
                </Typography>
                {quizResults.length > 0 ? (
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
                        {quizResults.map((quiz, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{quiz.quiz_title}</TableCell>
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
                  Attendance Tracking (Live Data)
                </Typography>
                {attendanceData.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Completion</TableCell>
                          <TableCell>Duration</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendanceData.map((data, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <Chip
                                icon={data.type === 'Video Lesson' ? <VideoLibrary /> : <School />}
                                label={data.type}
                                size="small"
                                color={data.type === 'Video Lesson' ? 'primary' : 'secondary'}
                              />
                            </TableCell>
                            <TableCell>{data.title}</TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(data.date)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(data.percentage, 100)}
                                  sx={{ width: 100, height: 6, borderRadius: 3 }}
                                  color={data.percentage >= 80 ? 'success' : 'warning'}
                                />
                                <Typography variant="caption">
                                  {Math.round(data.percentage)}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {data.duration ? formatDuration(data.duration) : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No attendance data available
                  </Typography>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Assignment Submissions
                </Typography>
                {assignmentData.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Assignment</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Submitted</TableCell>
                          <TableCell>Graded</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assignmentData.map((assignment, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{assignment.title}</TableCell>
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
                                  {assignment.marks_obtained}/{assignment.total_marks}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Not graded
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {assignment.submitted_at ? formatDate(assignment.submitted_at) : 'Not submitted'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {assignment.graded_at ? formatDate(assignment.graded_at) : '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No assignment data available
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
              Student Summary
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{student.full_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.grade && `Grade ${student.grade}`}
                  {student.section && ` - ${student.section}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {student.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quiz Average
              </Typography>
              <LinearProgress
                variant="determinate"
                value={studentStats.quizAverage}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color={getStatusColor(studentStats.quizAverage)}
              />
              <Typography variant="h5" fontWeight={700}>
                {Math.round(studentStats.quizAverage)}%
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Attendance Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={studentStats.attendanceRate}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color={getStatusColor(studentStats.attendanceRate)}
              />
              <Typography variant="h5" fontWeight={700}>
                {Math.round(studentStats.attendanceRate)}%
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Points Earned
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {studentStats.totalPoints}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Assignments Completed
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {studentStats.assignmentsCompleted}/{studentStats.totalAssignments}
              </Typography>
            </Box>

            <Chip
              label={getStatusLabel(studentStats.quizAverage)}
              color={getStatusColor(studentStats.quizAverage)}
              sx={{ width: '100%', py: 1 }}
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Quiz fontSize="small" color="primary" />
                  <Typography variant="body2">Quizzes Taken</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {quizResults.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoLibrary fontSize="small" color="primary" />
                  <Typography variant="body2">Classes Attended</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {attendanceData.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon fontSize="small" color="primary" />
                  <Typography variant="body2">Assignments</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {assignmentData.length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default MentoringView;
