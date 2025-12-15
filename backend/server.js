import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  initializeLMSRoutes,
  getVideoLessons,
  createVideoLesson,
  updateVideoLesson,
  deleteVideoLesson,
  getRecordedVideos,
  createRecordedVideo,
  updateRecordedVideo,
  deleteRecordedVideo,
  trackVideoProgress,
  getWatchHistory,
  getLiveClasses,
  createLiveClass,
  updateLiveClassStatus,
  sendAttendancePing,
  deleteLiveClass,
  getAssignments,
  getQuizzes,
  getQuizWithQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  trackLessonProgress,
  joinLiveClass,
  leaveLiveClass,
  respondToPing,
  submitQuiz,
  getQuizRankings,
  getStudentRank,
  getTopPerformers,
  getStudentRankingHistory,
  recalculateRankings,
  getStudentAnalytics,
  getTeacherAnalytics,
  updateCommunityPost,
  deleteCommunityPost,
  updateCommunityReply,
  deleteCommunityReply,
} from './lms-routes.js';
import { initializeMentorParentMessaging } from './mentor-parent-messaging.js';
import { initializeAdminLinkingRoutes } from './admin-linking-routes.js';
import { initializeParentStudentData } from './parent-student-data.js';
import { initializeMentorRoutes } from './mentor-routes.js';
import { initializeDatabase } from './db-setup.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase with service role key (has admin privileges)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize LMS routes with Supabase client
initializeLMSRoutes(supabase);

// Initialize Mentor-Parent Messaging routes
const mentorParentRouter = initializeMentorParentMessaging(supabase);
app.use('/api/mentor-parent', mentorParentRouter);

// Initialize Mentor routes
const mentorRouter = initializeMentorRoutes(supabase);
app.use('/api/mentor', mentorRouter);

// Test DELETE endpoint
app.delete('/api/test-delete/:id', (req, res) => {
  console.log('DELETE test endpoint hit with ID:', req.params.id);
  res.json({ success: true, message: 'DELETE works', id: req.params.id });
});

// Initialize Admin Linking routes
const adminLinkingRouter = initializeAdminLinkingRoutes(supabase);
app.use('/api/admin-linking', adminLinkingRouter);

// Initialize Parent Student Data routes
const parentStudentRouter = initializeParentStudentData(supabase);
app.use('/api/parent-student', parentStudentRouter);

// Get system activities
app.get('/api/system/activities', async (req, res) => {
  try {
    const activities = [];

    // Fetch recent user creations
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentUsers) {
      recentUsers.forEach((user) => {
        const roleText = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        activities.push({
          id: `user-${user.id}`,
          message: `New ${user.role} enrolled: ${user.full_name}`,
          timestamp: new Date(user.created_at).toLocaleString(),
          type: 'user',
        });
      });
    }

    // Fetch recent lessons
    const { data: recentLessons } = await supabase
      .from('lessons')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentLessons) {
      recentLessons.forEach((lesson) => {
        activities.push({
          id: `lesson-${lesson.id}`,
          message: `Teacher uploaded lesson: ${lesson.title}`,
          timestamp: new Date(lesson.created_at).toLocaleString(),
          type: 'lesson',
        });
      });
    }

    // Fetch recent quizzes
    const { data: recentQuizzes } = await supabase
      .from('quizzes')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentQuizzes) {
      recentQuizzes.forEach((quiz) => {
        activities.push({
          id: `quiz-${quiz.id}`,
          message: `New quiz created: ${quiz.title}`,
          timestamp: new Date(quiz.created_at).toLocaleString(),
          type: 'quiz',
        });
      });
    }

    // Sort by timestamp (newest first) and return top 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ activities: activities.slice(0, 10) });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get comprehensive admin analytics
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (range === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (range === 'month') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (range === 'year') {
      startDate.setMonth(endDate.getMonth() - 12);
    }

    // Fetch all data in parallel
    const [usersRes, lessonsRes, quizzesRes, assignmentsRes, liveClassesRes, attendanceRes] = await Promise.all([
      supabase.from('profiles').select('id, created_at').gte('created_at', startDate.toISOString()),
      supabase.from('lessons').select('id, created_at').gte('created_at', startDate.toISOString()),
      supabase.from('quizzes').select('id, created_at').gte('created_at', startDate.toISOString()),
      supabase.from('assignments').select('id, created_at').gte('created_at', startDate.toISOString()),
      supabase.from('live_classes').select('id, created_at').gte('created_at', startDate.toISOString()),
      supabase.from('live_attendance').select('id, is_present, created_at').gte('created_at', startDate.toISOString()),
    ]);

    // Group data by date (using ISO date string as key for proper sorting)
    const groupByDate = (data) => {
      const grouped = {};
      
      if (!data) return grouped;
      
      data.forEach((item) => {
        const date = new Date(item.created_at);
        // Use ISO date string (YYYY-MM-DD) as key for consistent grouping
        const dateStr = date.toISOString().split('T')[0];
        
        if (!grouped[dateStr]) grouped[dateStr] = 0;
        grouped[dateStr]++;
      });
      
      return grouped;
    };

    const usersByDate = groupByDate(usersRes.data);
    const lessonsByDate = groupByDate(lessonsRes.data);
    const quizzesByDate = groupByDate(quizzesRes.data);
    const assignmentsByDate = groupByDate(assignmentsRes.data);
    const liveClassesByDate = groupByDate(liveClassesRes.data);

    // Calculate attendance stats
    const totalAttendance = attendanceRes.data?.length || 0;
    const presentCount = attendanceRes.data?.filter(a => a.is_present)?.length || 0;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Generate all dates in range (linear progression)
    const allDatesInRange = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0); // Set to start of day
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      allDatesInRange.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // chartData is already in linear order since we iterate through allDatesInRange
    const chartData = allDatesInRange.map((dateStr, index) => {
      const date = new Date(dateStr + 'T00:00:00Z');
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date: displayDate,
        dateStr: dateStr, // Keep ISO date for reference
        dateIndex: index, // Use index for proper x-axis ordering
        users: usersByDate[dateStr] || 0,
        lessons: lessonsByDate[dateStr] || 0,
        quizzes: quizzesByDate[dateStr] || 0,
        assignments: assignmentsByDate[dateStr] || 0,
        liveClasses: liveClassesByDate[dateStr] || 0,
        total: (usersByDate[dateStr] || 0) + (lessonsByDate[dateStr] || 0) + (quizzesByDate[dateStr] || 0) + (assignmentsByDate[dateStr] || 0) + (liveClassesByDate[dateStr] || 0),
      };
    });

    // Calculate totals
    const totals = {
      users: usersRes.data?.length || 0,
      lessons: lessonsRes.data?.length || 0,
      quizzes: quizzesRes.data?.length || 0,
      assignments: assignmentsRes.data?.length || 0,
      liveClasses: liveClassesRes.data?.length || 0,
      attendance: {
        total: totalAttendance,
        present: presentCount,
        rate: attendanceRate,
      },
    };

    res.json({ chartData, totals, range });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get weekly attendance data
app.get('/api/admin/attendance/weekly', async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // For each day, calculate attendance
    const weeklyData = {};
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];

      // Get attendance for this day
      const { data: dayAttendance } = await supabase
        .from('live_attendance')
        .select('id, is_present')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`);

      const total = dayAttendance?.length || 0;
      const present = dayAttendance?.filter(a => a.is_present)?.length || 0;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      weeklyData[dayName] = {
        day: dayName,
        percentage,
        total,
        present,
        date: dateStr,
      };
    }

    res.json({ weeklyData: Object.values(weeklyData) });
  } catch (error) {
    console.error('Error fetching weekly attendance:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get quiz performance analytics
app.get('/api/admin/quiz-performance', async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (range === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (range === 'month') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (range === 'year') {
      startDate.setMonth(endDate.getMonth() - 12);
    }

    // Get all quizzes with submissions
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id, title')
      .gte('created_at', startDate.toISOString());

    const quizPerformance = [];

    for (const quiz of quizzes || []) {
      const { data: submissions } = await supabase
        .from('quiz_submissions')
        .select('score')
        .eq('quiz_id', quiz.id)
        .gte('created_at', startDate.toISOString());

      if (submissions && submissions.length > 0) {
        const avgScore = Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length);
        quizPerformance.push({
          subject: quiz.title,
          avgScore,
          students: submissions.length,
        });
      }
    }

    res.json({ quizPerformance });
  } catch (error) {
    console.error('Error fetching quiz performance:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get AI Tutor usage statistics
app.get('/api/admin/ai-tutor-stats', async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (range === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (range === 'month') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (range === 'year') {
      startDate.setMonth(endDate.getMonth() - 12);
    }

    // Get AI tutor sessions (if table exists)
    let aiSessions = [];
    try {
      const { data } = await supabase
        .from('ai_tutor_sessions')
        .select('id, category, tokens_used, created_at')
        .gte('created_at', startDate.toISOString());
      aiSessions = data || [];
    } catch (e) {
      aiSessions = [];
    }

    // Group by category
    const categories = {};
    let totalTokens = 0;
    let totalSessions = 0;

    if (aiSessions && aiSessions.length > 0) {
      aiSessions.forEach(session => {
        const category = session.category || 'General Help';
        if (!categories[category]) {
          categories[category] = { sessions: 0, tokens: 0 };
        }
        categories[category].sessions++;
        categories[category].tokens += session.tokens_used || 0;
        totalTokens += session.tokens_used || 0;
        totalSessions++;
      });
    }

    // Format response
    const aiTutorEngagement = Object.entries(categories).map(([category, data]) => ({
      category,
      sessions: data.sessions,
      tokensUsed: data.tokens,
    }));

    // Get popular questions
    let questions = [];
    try {
      const { data } = await supabase
        .from('ai_tutor_questions')
        .select('question, count')
        .gte('created_at', startDate.toISOString())
        .order('count', { ascending: false })
        .limit(4);
      questions = data || [];
    } catch (e) {
      questions = [];
    }

    res.json({
      aiTutorEngagement,
      totalSessions,
      totalTokensUsed: totalTokens,
      popularQuestions: questions || [],
    });
  } catch (error) {
    console.error('Error fetching AI tutor stats:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get LMS analytics
app.get('/api/admin/lms-analytics', async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (range === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (range === 'month') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (range === 'year') {
      startDate.setMonth(endDate.getMonth() - 12);
    }

    // Get LMS content stats
    const [videoLessonsRes, recordedVideosRes, liveClassesRes, quizzesRes, assignmentsRes] = await Promise.all([
      supabase.from('lessons').select('id').gte('created_at', startDate.toISOString()),
      supabase.from('recorded_videos').select('id').gte('created_at', startDate.toISOString()),
      supabase.from('live_classes').select('id').gte('created_at', startDate.toISOString()),
      supabase.from('quizzes').select('id').gte('created_at', startDate.toISOString()),
      supabase.from('assignments').select('id').gte('created_at', startDate.toISOString()),
    ]);

    // Get engagement metrics
    const { data: lessonTracking } = await supabase
      .from('lesson_attendance')
      .select('id, is_completed')
      .gte('created_at', startDate.toISOString());

    const completedLessons = lessonTracking?.filter(l => l.is_completed)?.length || 0;
    const totalLessonViews = lessonTracking?.length || 0;
    const avgCompletion = totalLessonViews > 0 ? Math.round((completedLessons / totalLessonViews) * 100) : 0;

    res.json({
      videoLessons: recordedVideosRes.data?.length || 0,
      studyMaterials: videoLessonsRes.data?.length || 0,
      liveClasses: liveClassesRes.data?.length || 0,
      quizzes: quizzesRes.data?.length || 0,
      assignments: assignmentsRes.data?.length || 0,
      totalViews: totalLessonViews,
      avgCompletion,
    });
  } catch (error) {
    console.error('Error fetching LMS analytics:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get notifications for a user
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch live classes for this user
    const { data: liveClasses } = await supabase
      .from('live_classes')
      .select('id, title, created_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch assignments for this user
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title, created_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch quizzes for this user
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id, title, created_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Combine all notifications
    const notifications = [];

    if (liveClasses && liveClasses.length > 0) {
      liveClasses.forEach((liveClass) => {
        notifications.push({
          id: `live-${liveClass.id}`,
          message: `New live class: ${liveClass.title}`,
          time: new Date(liveClass.created_at).toLocaleString(),
          type: 'lesson',
        });
      });
    }

    if (assignments && assignments.length > 0) {
      assignments.forEach((assignment) => {
        notifications.push({
          id: `assign-${assignment.id}`,
          message: `New assignment: ${assignment.title}`,
          time: new Date(assignment.created_at).toLocaleString(),
          type: 'assignment',
        });
      });
    }

    if (quizzes && quizzes.length > 0) {
      quizzes.forEach((quiz) => {
        notifications.push({
          id: `quiz-${quiz.id}`,
          message: `New quiz: ${quiz.title}`,
          time: new Date(quiz.created_at).toLocaleString(),
          type: 'quiz',
        });
      });
    }

    // Sort by time (newest first)
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({ notifications: notifications.slice(0, 10) });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create user endpoint (with domain support)
app.post('/api/users/create', async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create profile with domain fields
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        ...profile,
        // Ensure domain fields are included
        sub_domain_id: profile.sub_domain_id,
      }]);

    if (profileError) throw profileError;

    res.json({ success: true, user: authData.user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Reset password endpoint
app.post('/api/users/reset-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) throw error;

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user email endpoint
app.post('/api/users/update-email', async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    // Update email in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { email }
    );

    if (authError) throw authError;

    // Update name in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', userId);

    if (profileError) throw profileError;

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    // Get profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    // Get auth users to fetch emails
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;

    // Merge profile data with email and last sign in from auth users
    const usersWithEmails = profiles.map(profile => {
      const authUser = authUsers.find(u => u.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || 'N/A',
        last_sign_in_at: authUser?.last_sign_in_at || profile.created_at
      };
    });

    res.json({ users: usersWithEmails });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) throw profileError;

    // Get auth user to fetch email
    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(id);
    
    if (authError) throw authError;

    // Merge profile data with email
    const userWithEmail = {
      ...profile,
      email: authUser?.email || 'N/A'
    };

    res.json({ user: userWithEmail });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { children_ids, ...profileData } = req.body;
    
    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Only update relationships if children_ids is explicitly provided in the request
    if ('children_ids' in req.body && Array.isArray(children_ids)) {
      // Delete existing relationships
      await supabase
        .from('parent_children')
        .delete()
        .eq('parent_id', id);

      // Insert new relationships
      if (children_ids.length > 0) {
        const relationships = children_ids.map(child_id => ({
          parent_id: id,
          child_id: child_id
        }));

        await supabase
          .from('parent_children')
          .insert(relationships);
      }
    }

    res.json({ success: true, user: data });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user from auth (this will cascade delete the profile due to foreign key)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) throw authError;

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== DOMAINS ENDPOINTS ====================

// Get all domains
app.get('/api/domains', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    res.json({ domains: data });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create domain
app.post('/api/domains/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const { data, error } = await supabase
      .from('domains')
      .insert([{ name, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, domain: data });
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update domain
app.put('/api/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    const { data, error } = await supabase
      .from('domains')
      .update({ name, description, is_active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, domain: data });
  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete domain
app.delete('/api/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Note: Cascading deletes are handled by database foreign key constraints
    // with ON DELETE CASCADE for sub_domains, departments, semesters, and lessons
    
    // Update users to remove domain association (set to NULL instead of deleting users)
    await supabase
      .from('profiles')
      .update({ 
        domain_id: null,
        sub_domain_id: null,
        department_id: null,
        semester_id: null
      })
      .eq('domain_id', id);
    
    // Delete the domain (cascading will handle related records)
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Domain deleted successfully. Users have been unassigned from this domain.' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== STAT ENDPOINTS ====================

// Get total teachers count
app.get('/api/stats/teachers-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'teacher');
    
    if (error) throw error;
    
    res.json({ totalTeachers: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching teachers count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get total students count
app.get('/api/stats/students-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');
    
    if (error) throw error;
    
    res.json({ totalStudents: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching students count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get total active live classes count (only classes with status='live')
app.get('/api/stats/live-classes-count', async (req, res) => {
  try {
    // Count all live classes that have been conducted (status='ended' or 'live')
    const { data, error } = await supabase
      .from('live_classes')
      .select('id')
      .in('status', ['ended', 'live']);
    
    if (error) throw error;
    
    res.json({ totalLiveClasses: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching live classes count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get ongoing live classes count (only classes with status='live')
app.get('/api/stats/ongoing-live-classes-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('live_classes')
      .select('id')
      .eq('status', 'live');
    
    if (error) throw error;
    
    res.json({ ongoingLiveClasses: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching ongoing live classes count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get total domains count
app.get('/api/stats/domains-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('id');
    
    if (error) throw error;
    
    res.json({ totalDomains: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching domains count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get community activity count (posts + replies)
app.get('/api/stats/community-activity-count', async (req, res) => {
  try {
    const [postsRes, repliesRes] = await Promise.all([
      supabase.from('community_posts').select('id'),
      supabase.from('community_replies').select('id'),
    ]);

    const posts = postsRes.data?.length || 0;
    const replies = repliesRes.data?.length || 0;
    
    res.json({ totalCommunityActivity: posts + replies });
  } catch (error) {
    console.error('Error fetching community activity count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get parent reports count (messages from parents to mentors)
app.get('/api/stats/parent-reports-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mentor_parent_messages')
      .select('id')
      .not('parent_id', 'is', null);
    
    if (error) throw error;
    
    res.json({ totalParentReports: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching parent reports count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get mentor talk count (messages from mentors)
app.get('/api/stats/mentor-talk-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mentor_parent_messages')
      .select('id')
      .not('mentor_id', 'is', null);
    
    if (error) throw error;
    
    res.json({ totalMentorTalk: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching mentor talk count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get account linked count (sum of parent-student, mentor-student, and parent-mentor links)
app.get('/api/stats/account-linked-count', async (req, res) => {
  try {
    let totalAccountLinked = 0;
    
    // Try parent_children table
    try {
      const { data } = await supabase.from('parent_children').select('id');
      totalAccountLinked += data?.length || 0;
    } catch (e) {
      console.log('parent_children table not found or error:', e.message);
    }
    
    // Try mentor_students table
    try {
      const { data } = await supabase.from('mentor_students').select('id');
      totalAccountLinked += data?.length || 0;
    } catch (e) {
      console.log('mentor_students table not found or error:', e.message);
    }
    
    // Try mentor_student_links table (alternative name)
    try {
      const { data } = await supabase.from('mentor_student_links').select('id');
      totalAccountLinked += data?.length || 0;
    } catch (e) {
      console.log('mentor_student_links table not found or error:', e.message);
    }
    
    // Try parent_mentor_links table
    try {
      const { data } = await supabase.from('parent_mentor_links').select('id');
      totalAccountLinked += data?.length || 0;
    } catch (e) {
      console.log('parent_mentor_links table not found or error:', e.message);
    }
    
    console.log('✅ Account linked count:', totalAccountLinked);
    res.json({ totalAccountLinked });
  } catch (error) {
    console.error('Error fetching account linked count:', error);
    res.json({ totalAccountLinked: 0 });
  }
});

// ==================== DEPARTMENTS ENDPOINTS ====================

// Get all departments (optionally filtered by domain)
app.get('/api/departments', async (req, res) => {
  try {
    const { domainId } = req.query;
    
    let query = supabase.from('departments').select('*');
    
    if (domainId) {
      query = query.eq('domain_id', domainId);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ departments: data });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create department
app.post('/api/departments/create', async (req, res) => {
  try {
    const { domain_id, sub_domain_id, name, description } = req.body;
    
    const { data, error } = await supabase
      .from('departments')
      .insert([{ domain_id, sub_domain_id, name, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, department: data });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update department
app.put('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, sub_domain_id } = req.body;
    
    const { data, error } = await supabase
      .from('departments')
      .update({ name, description, is_active, sub_domain_id })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, department: data });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete department
app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== SUB-DOMAINS ENDPOINTS ====================

// Get total subdomains count (all domains combined) - MUST BE BEFORE /api/subdomains
app.get('/api/subdomains-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sub_domains')
      .select('id');
    
    if (error) throw error;
    
    res.json({ totalSubdomains: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching subdomains count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all sub-domains (optionally filtered by domain)
app.get('/api/subdomains', async (req, res) => {
  try {
    const { domainId } = req.query;
    
    let query = supabase.from('sub_domains').select('*');
    
    if (domainId) {
      query = query.eq('domain_id', domainId);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ subdomains: data });
  } catch (error) {
    console.error('Error fetching sub-domains:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create sub-domain
app.post('/api/subdomains/create', async (req, res) => {
  try {
    const { domain_id, name, description, type, default_department, default_semester } = req.body;
    
    console.log('Creating subdomain with data:', { domain_id, name, description, type, default_department, default_semester });
    
    // Build insert data with only non-null values
    const insertData = {
      domain_id,
      name,
      type: type || 'ug',
    };
    
    if (description) insertData.description = description;
    if (default_department) insertData.default_department = default_department;
    if (default_semester) insertData.default_semester = default_semester;
    
    console.log('Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('sub_domains')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Created subdomain:', data);
    res.json({ success: true, subdomain: data });
  } catch (error) {
    console.error('Error creating sub-domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update sub-domain
app.put('/api/subdomains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, is_active, default_department, default_semester } = req.body;
    
    console.log('Updating subdomain:', id);
    console.log('Received data:', { name, description, type, is_active, default_department, default_semester });
    
    const updateData = {
      name,
      description,
      type,
      is_active,
      default_department: default_department || null,
      default_semester: default_semester || null,
    };
    
    console.log('Update data being sent to Supabase:', updateData);
    
    const { data, error } = await supabase
      .from('sub_domains')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Updated subdomain data:', data);
    res.json({ success: true, subdomain: data });
  } catch (error) {
    console.error('Error updating sub-domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete sub-domain
app.delete('/api/subdomains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('sub_domains')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Sub-domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== SEMESTERS ENDPOINTS ====================

// Get all semesters (optionally filtered by domain or department)
app.get('/api/semesters', async (req, res) => {
  try {
    const { domainId, departmentId } = req.query;
    
    let query = supabase.from('semesters').select('*');
    
    if (domainId) {
      query = query.eq('domain_id', domainId);
    }
    
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ semesters: data });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create semester
app.post('/api/semesters/create', async (req, res) => {
  try {
    const { domain_id, department_id, sub_domain_id, name, description } = req.body;
    
    const { data, error } = await supabase
      .from('semesters')
      .insert([{ domain_id, department_id, sub_domain_id, name, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, semester: data });
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update semester
app.put('/api/semesters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, department_id, is_active, sub_domain_id } = req.body;
    
    const { data, error } = await supabase
      .from('semesters')
      .update({ name, description, department_id, is_active, sub_domain_id })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, semester: data });
  } catch (error) {
    console.error('Error updating semester:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete semester
app.delete('/api/semesters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('semesters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Semester deleted successfully' });
  } catch (error) {
    console.error('Error deleting semester:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user's domains (for login domain selection)
app.post('/api/auth/user-domains', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get all profiles with this email across domains
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('domain_id, domains(id, name)')
      .eq('email', email);
    
    if (error) throw error;
    
    // Extract unique domains
    const domains = profiles
      .filter(p => p.domains)
      .map(p => p.domains)
      .filter((domain, index, self) => 
        index === self.findIndex(d => d.id === domain.id)
      );
    
    res.json({ domains });
  } catch (error) {
    console.error('Error fetching user domains:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== PARENT-CHILDREN ENDPOINTS ====================

// Create parent-children relationships
app.post('/api/parent-children', async (req, res) => {
  try {
    const { relationships } = req.body;
    
    const { data, error } = await supabase
      .from('parent_children')
      .insert(relationships)
      .select();

    if (error) throw error;

    res.json({ success: true, relationships: data });
  } catch (error) {
    console.error('Error creating parent-children relationships:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get children for a parent
app.get('/api/parent-children/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    
    const { data, error } = await supabase
      .from('parent_children')
      .select('child_id, profiles!parent_children_child_id_fkey(*)')
      .eq('parent_id', parentId);

    if (error) throw error;

    res.json({ children: data });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== LESSONS ENDPOINTS ====================

// Get all lessons (filtered by role)
app.get('/api/lessons', async (req, res) => {
  try {
    const { grade, subject, teacherId } = req.query;
    
    let query = supabase.from('lessons').select('*, profiles!lessons_teacher_id_fkey(full_name)');
    
    if (grade) query = query.eq('grade', grade);
    if (subject) query = query.eq('subject', subject);
    if (teacherId) query = query.eq('teacher_id', teacherId);
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ lessons: data });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create lesson (metadata only, file upload handled separately)
app.post('/api/lessons/create', async (req, res) => {
  try {
    const { 
      title, description, teacherId, subject,
      documentUrl, documentName, documentType, fileSize,
      domain_id, sub_domain_id, department_id, semester_id 
    } = req.body;
    
    const { data, error } = await supabase
      .from('lessons')
      .insert([{
        title,
        description,
        teacher_id: teacherId,
        subject,
        document_url: documentUrl,
        document_name: documentName,
        document_type: documentType,
        file_size: fileSize,
        domain_id,
        sub_domain_id,
        department_id,
        semester_id,
        is_permanent: true,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, lesson: data });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update lesson
app.put('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, grade, section } = req.body;
    
    const { data, error } = await supabase
      .from('lessons')
      .update({
        title,
        description,
        subject,
        grade,
        section,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, lesson: data });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete lesson
app.delete('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the lesson to extract file path
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('document_url')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from database
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Extract file path from URL if it's a storage URL
    let filePath = null;
    if (lesson?.document_url && lesson.document_url.includes('lesson-files')) {
      const urlParts = lesson.document_url.split('lesson-files/');
      if (urlParts.length > 1) {
        filePath = urlParts[1].split('?')[0]; // Remove query params
      }
    }
    
    res.json({ success: true, message: 'Lesson deleted successfully', filePath });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== SYSTEM CONFIGURATION ENDPOINTS ====================

// Get system configuration
app.get('/api/system/config', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_key', 'features')
      .single();
    
    if (error) throw error;
    
    res.json({ config: data });
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update system configuration
app.put('/api/system/config', async (req, res) => {
  try {
    const { features, userId } = req.body;
    
    const { data, error } = await supabase
      .from('system_config')
      .update({ 
        config_value: features,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', 'features')
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, config: data });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create backup
app.post('/api/system/backup', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Get all data from main tables
    const [profiles, lessons, domains, departments, subDomains, semesters] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('lessons').select('*'),
      supabase.from('domains').select('*'),
      supabase.from('departments').select('*'),
      supabase.from('sub_domains').select('*'),
      supabase.from('semesters').select('*'),
    ]);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        profiles: profiles.data || [],
        lessons: lessons.data || [],
        domains: domains.data || [],
        departments: departments.data || [],
        sub_domains: subDomains.data || [],
        semesters: semesters.data || [],
      }
    };
    
    // Calculate size
    const backupJson = JSON.stringify(backupData);
    const backupSize = new Blob([backupJson]).size;
    
    // Save backup record
    const { data: backup, error } = await supabase
      .from('system_backups')
      .insert([{
        backup_name: `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
        backup_size: backupSize,
        backup_url: null, // In production, upload to storage
        status: 'completed',
        created_by: userId,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      backup,
      downloadData: backupData // Send data for client-side download
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get backup history
app.get('/api/system/backups', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    res.json({ backups: data });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(400).json({ error: error.message });
  }
});

// Restore from backup (simplified - in production would restore from file)
app.post('/api/system/restore', async (req, res) => {
  try {
    const { backupData } = req.body;
    
    if (!backupData || !backupData.data) {
      throw new Error('Invalid backup data');
    }
    
    // Note: In production, you'd want to:
    // 1. Create a backup before restoring
    // 2. Use transactions
    // 3. Validate data integrity
    // 4. Handle foreign key constraints properly
    
    res.json({ 
      success: true, 
      message: 'Restore functionality requires manual implementation for safety'
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== LMS ENDPOINTS ====================

// Video Lessons
app.get('/api/lms/video-lessons', getVideoLessons);
app.post('/api/lms/video-lessons', createVideoLesson);
app.put('/api/lms/video-lessons/:id', updateVideoLesson);
app.delete('/api/lms/video-lessons/:id', deleteVideoLesson);

// Recorded Videos
app.get('/api/lms/recorded-videos', getRecordedVideos);
app.post('/api/lms/recorded-videos', createRecordedVideo);
app.put('/api/lms/recorded-videos/:id', updateRecordedVideo);
app.delete('/api/lms/recorded-videos/:id', deleteRecordedVideo);
app.post('/api/lms/recorded-videos/:videoId/track', trackVideoProgress);
app.get('/api/lms/watch-history/:studentId', getWatchHistory);

// Assignments
app.get('/api/lms/assignments', getAssignments);

// Live Classes
app.get('/api/lms/live-classes', getLiveClasses);
app.post('/api/lms/live-classes', createLiveClass);
app.put('/api/lms/live-classes/:id/status', updateLiveClassStatus);
app.post('/api/lms/live-classes/:id/ping', sendAttendancePing);
app.delete('/api/lms/live-classes/:id', deleteLiveClass);

// Quizzes
app.get('/api/lms/quizzes', getQuizzes);
app.get('/api/lms/quizzes/:id', getQuizWithQuestions);
app.post('/api/lms/quizzes', createQuiz);
app.put('/api/lms/quizzes/:id', updateQuiz);
app.delete('/api/lms/quizzes/:id', deleteQuiz);

// Quiz Rankings
app.get('/api/lms/quizzes/:quizId/rankings', getQuizRankings);
app.get('/api/lms/quizzes/:quizId/rankings/:studentId', getStudentRank);
app.get('/api/lms/rankings/top-performers', getTopPerformers);
app.get('/api/lms/rankings/student/:studentId', getStudentRankingHistory);
app.post('/api/lms/quizzes/:quizId/recalculate-rankings', recalculateRankings);

// Student Tracking
app.post('/api/lms/lessons/:lessonId/track', trackLessonProgress);
app.post('/api/lms/live-classes/:classId/join', joinLiveClass);
app.put('/api/lms/live-attendance/:attendanceId/leave', leaveLiveClass);
app.post('/api/lms/pings/:pingId/respond', respondToPing);
app.post('/api/lms/quizzes/:quizId/submit', submitQuiz);

// Analytics
app.get('/api/lms/analytics/student/:studentId', getStudentAnalytics);
app.get('/api/lms/analytics/teacher/:teacherId', getTeacherAnalytics);

// Community
app.put('/api/community/posts/:id', updateCommunityPost);
app.delete('/api/community/posts/:id', deleteCommunityPost);
app.put('/api/community/replies/:id', updateCommunityReply);
app.delete('/api/community/replies/:id', deleteCommunityReply);

// Get total comments count
app.get('/api/admin/comments-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('id', { count: 'exact', head: true });
    
    if (error) throw error;
    
    res.json({ totalComments: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching comments count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all analytics data in one call
app.get('/api/admin/all-analytics', async (req, res) => {
  try {
    // Get all data in parallel
    const [
      { data: allMessages, error: msgError },
      { data: parentChildLinks, error: pcError },
      { data: mentorStudentLinks, error: msError },
      { data: communityPosts, error: cpError }
    ] = await Promise.all([
      supabase.from('mentor_parent_messages').select('id', { count: 'exact', head: true }),
      supabase.from('parent_child_links').select('id', { count: 'exact', head: true }),
      supabase.from('mentor_student_links').select('id', { count: 'exact', head: true }),
      supabase.from('community_posts').select('id', { count: 'exact', head: true })
    ]);

    if (msgError || pcError || msError || cpError) {
      throw msgError || pcError || msError || cpError;
    }

    const totalParentMessages = allMessages?.length || 0;
    const totalAccountsLinked = (parentChildLinks?.length || 0) + (mentorStudentLinks?.length || 0);
    const totalComments = communityPosts?.length || 0;

    res.json({
      totalParentMessages,
      totalMentorReplies: 0,
      replyRatio: `0/${totalParentMessages}`,
      totalAccountsLinked,
      totalComments,
      allMessagesCount: totalParentMessages
    });
  } catch (error) {
    console.error('Error fetching all analytics:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get total parent messages count
app.get('/api/admin/parent-messages-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mentor_parent_messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_role', 'parent');
    
    if (error) throw error;
    
    res.json({ totalMessages: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching parent messages count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get total mentor replies count
app.get('/api/admin/mentor-replies-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mentor_parent_messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_role', 'mentor')
      .not('reply_to_id', 'is', null);
    
    if (error) throw error;
    
    res.json({ totalReplies: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching mentor replies count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get total accounts linked count
app.get('/api/admin/accounts-linked-count', async (req, res) => {
  try {
    // Count parent-child links
    const { data: parentChildLinks, error: pcError } = await supabase
      .from('parent_child_links')
      .select('id', { count: 'exact', head: true });
    
    // Count mentor-student links
    const { data: mentorStudentLinks, error: msError } = await supabase
      .from('mentor_student_links')
      .select('id', { count: 'exact', head: true });
    
    if (pcError || msError) throw pcError || msError;
    
    const totalLinked = (parentChildLinks?.length || 0) + (mentorStudentLinks?.length || 0);
    res.json({ totalLinked });
  } catch (error) {
    console.error('Error fetching accounts linked count:', error);
    res.status(400).json({ error: error.message });
  }
});

// Debug endpoint to check messages table
app.get('/api/admin/debug-messages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mentor_parent_messages')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    
    res.json({
      count: data?.length || 0,
      messages: data,
      error: null
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(400).json({ error: error.message, count: 0 });
  }
});

// Get mentor-parent interactions count
app.get('/api/admin/mentor-parent-interactions', async (req, res) => {
  try {
    // Get all non-deleted messages
    const { data: allMessages, error: allError, count } = await supabase
      .from('mentor_parent_messages')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);
    
    if (allError) throw allError;
    
    const totalMessages = count || allMessages?.length || 0;
    
    // Count parent messages (messages where reply_to_id is NULL - original messages)
    const parentMessages = allMessages?.filter(msg => !msg.reply_to_id) || [];
    const totalParentMessages = parentMessages.length;
    
    // Count mentor replies (messages where reply_to_id is NOT NULL - replies to parent messages)
    const mentorReplies = allMessages?.filter(msg => msg.reply_to_id) || [];
    const totalMentorReplies = mentorReplies.length;
    
    console.log('Mentor-Parent Messages Debug:', {
      totalMessages,
      totalParentMessages,
      totalMentorReplies,
      count,
      dataLength: allMessages?.length,
      firstMessage: allMessages?.[0]
    });
    
    res.json({
      totalParentMessages,
      totalMentorReplies,
    });
  } catch (error) {
    console.error('Error fetching mentor-parent interactions:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== AI TUTOR ENDPOINTS (OLLAMA) ====================

// AI Tutor chat endpoint
app.post('/api/ai-tutor/chat', async (req, res) => {
  try {
    const { message, model = 'deepseek-r1:1.5b' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[AI Tutor] Received message: "${message.substring(0, 50)}..." using model: ${model}`);

    // Call Ollama API running on localhost:11434
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      console.log(`[AI Tutor] Calling Ollama with model: ${model}`);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: message,
          stream: false,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI Tutor] HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Read the entire response as text first
      const text = await response.text();
      
      if (!text || text.trim().length === 0) {
        console.error('[AI Tutor] Empty response from Ollama');
        return res.status(500).json({ error: 'Empty response from Ollama' });
      }
      
      // Parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[AI Tutor] JSON parse failed');
        console.error('[AI Tutor] Response length:', text.length);
        console.error('[AI Tutor] First 500 chars:', text.substring(0, 500));
        console.error('[AI Tutor] Last 200 chars:', text.substring(Math.max(0, text.length - 200)));
        return res.status(500).json({ 
          error: 'Failed to parse Ollama response',
          details: `Response length: ${text.length}, Parse error: ${parseError.message}`
        });
      }
      
      // Extract response text
      const responseText = data.response || data.text || '';
      
      if (!responseText || responseText.trim().length === 0) {
        console.warn('[AI Tutor] Empty response text from model');
        return res.status(500).json({ error: 'Model returned empty response' });
      }
      
      console.log(`[AI Tutor] Success! Response length: ${responseText.length}`);
      res.json({ response: responseText });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('AI response timeout. Ollama may be overloaded or not responding.');
      }
      
      if (fetchError.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running on port 11434. Run: ollama serve');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error calling AI Tutor:', error);
    
    let errorMessage = error.message;
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Cannot connect')) {
      errorMessage = 'Ollama is not running. Start it with: ollama serve or use START_DEEPSEEK_OLLAMA.bat';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      hint: 'Make sure Ollama is running with: ollama serve'
    });
  }
});

// AI Tutor document analysis endpoint
app.post('/api/ai-tutor/analyze', async (req, res) => {
  try {
    const { fileName, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Document content is required' });
    }

    const analysisPrompt = `Analyze this document and provide:
1. Summary (2-3 sentences)
2. Key Points (3-5 bullet points)
3. Mistakes or Issues (if any)
4. Improvements (suggestions)
5. Related Concepts

Document: ${content.substring(0, 2000)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for analysis

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          prompt: analysisPrompt,
          stream: false,
          temperature: 0.5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json({ analysis: { content: data.response || 'Analysis could not be generated' } });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Analysis timeout. Document may be too large or Ollama is overloaded.');
      }
      
      if (fetchError.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running on port 11434.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error analyzing document:', error);
    
    let errorMessage = error.message;
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Cannot connect')) {
      errorMessage = 'Ollama is not running. Start it with: ollama serve';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      hint: 'Make sure Ollama is running'
    });
  }
});

// ==================== MENTOR DASHBOARD ENDPOINTS ====================
// Note: Mentor endpoints are now handled by mentor-routes.js
// This keeps the code organized and maintainable

// ==================== PARENT DASHBOARD ENDPOINTS ====================

// Get parent's children
app.get('/api/parent/:parentId/children', async (req, res) => {
  try {
    const { parentId } = req.params;

    const { data, error } = await supabase
      .from('parent_student_links')
      .select(`
        student_id,
        profiles!parent_student_links_student_id_fkey(
          id, full_name
        )
      `)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching parent_student_links:', error.message);
      // Return empty array if table doesn't exist yet
      return res.json({ children: [] });
    }

    const children = data.map(link => ({
      id: link.profiles?.id,
      name: link.profiles?.full_name || 'Unknown',
      grade: 'N/A',
      overall_score: 0,
      attendance_rate: 0,
      last_active: new Date().toISOString(),
    })).filter(c => c.id);

    res.json({ children });
  } catch (error) {
    console.error('Error fetching parent children:', error);
    res.status(400).json({ error: error.message, children: [] });
  }
});

// ==================== ACTIVE USERS TRACKING ====================

// Get active users (users who logged in within last 24 hours)
app.get('/api/stats/active-users-count', async (req, res) => {
  try {
    // Check for users active in the last 30 minutes (more accurate for real-time)
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    // Get users who have logged in within the last 30 minutes
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;

    // Filter users who logged in within last 30 minutes
    const activeUsers = users.filter(user => {
      if (!user.last_sign_in_at) return false;
      const lastSignIn = new Date(user.last_sign_in_at);
      return lastSignIn > thirtyMinutesAgo;
    });

    console.log(`✅ Active Users (last 30min): ${activeUsers.length}`);
    res.json({ activeUsers: activeUsers.length });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3001;

// Start server with async initialization
(async () => {
  try {
    // Initialize database
    await initializeDatabase(supabase);
    
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
