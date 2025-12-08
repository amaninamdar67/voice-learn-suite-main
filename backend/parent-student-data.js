import { Router } from 'express';

const router = Router();

export const initializeParentStudentData = (supabase) => {
  // Get comprehensive student data for parent
  router.get('/student-overview/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;

      // Get student profile
      const { data: student } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', studentId)
        .single();

      // Get video lessons progress
      const { data: lessonsData } = await supabase
        .from('video_lesson_progress')
        .select('*')
        .eq('student_id', studentId);

      const lessonsCompleted = lessonsData?.filter(l => l.is_completed)?.length || 0;

      // Get quizzes submitted
      const { data: quizzesData } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('student_id', studentId);

      const quizzesCompleted = quizzesData?.length || 0;

      // Get assignments submitted
      const { data: assignmentsData } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentId);

      const assignmentsCompleted = assignmentsData?.length || 0;

      // Get attendance
      const { data: attendanceData } = await supabase
        .from('live_class_attendance')
        .select('*')
        .eq('student_id', studentId);

      const totalClasses = attendanceData?.length || 0;
      const attendedClasses = attendanceData?.filter(a => a.attended)?.length || 0;
      const attendance = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

      // Get courses (video lessons)
      const { data: coursesData } = await supabase
        .from('video_lessons')
        .select('id, title, is_completed')
        .eq('student_id', studentId);

      const coursesCompleted = coursesData?.filter(c => c.is_completed)?.length || 0;
      const totalCourses = coursesData?.length || 0;

      // Get comments count
      const { data: commentsData } = await supabase
        .from('community_replies')
        .select('id')
        .eq('user_id', studentId);

      const totalComments = commentsData?.length || 0;

      res.json({
        student,
        stats: {
          lessonsCompleted,
          quizzesCompleted,
          assignmentsCompleted,
          attendance,
          coursesCompleted,
          totalCourses,
          totalComments,
        },
      });
    } catch (error) {
      console.error('Error fetching student overview:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get student activity (submissions and comments)
  router.get('/student-activity/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const activities = [];

      // Get assignment submissions
      const { data: assignmentSubmissions } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          created_at,
          assignment:assignments(id, title, due_date)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (assignmentSubmissions) {
        assignmentSubmissions.forEach(sub => {
          activities.push({
            type: 'assignment_submitted',
            title: `Submitted assignment: ${sub.assignment?.title}`,
            time: sub.created_at,
            timestamp: new Date(sub.created_at).getTime(),
          });
        });
      }

      // Get quiz submissions
      const { data: quizSubmissions } = await supabase
        .from('quiz_submissions')
        .select(`
          id,
          created_at,
          score,
          quiz:quizzes(id, title)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (quizSubmissions) {
        quizSubmissions.forEach(sub => {
          activities.push({
            type: 'quiz_submitted',
            title: `Scored ${sub.score}% on quiz: ${sub.quiz?.title}`,
            time: sub.created_at,
            timestamp: new Date(sub.created_at).getTime(),
          });
        });
      }

      // Get comments
      const { data: comments } = await supabase
        .from('community_replies')
        .select(`
          id,
          content,
          created_at,
          post:community_posts(id, title)
        `)
        .eq('user_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (comments) {
        comments.forEach(comment => {
          activities.push({
            type: 'comment',
            title: `Commented on discussion`,
            content: comment.content,
            time: comment.created_at,
            timestamp: new Date(comment.created_at).getTime(),
          });
        });
      }

      // Sort by timestamp descending
      activities.sort((a, b) => b.timestamp - a.timestamp);

      res.json({ activities: activities.slice(0, 10) });
    } catch (error) {
      console.error('Error fetching student activity:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get student comments
  router.get('/student-comments/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;

      const { data: comments, error } = await supabase
        .from('community_replies')
        .select(`
          id,
          content,
          created_at,
          user:profiles!user_id(id, full_name)
        `)
        .eq('user_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedComments = comments?.map(comment => ({
        id: comment.id,
        author: comment.user?.full_name || 'Anonymous',
        content: comment.content,
        created_at: comment.created_at,
      })) || [];

      res.json({ comments: formattedComments });
    } catch (error) {
      console.error('Error fetching student comments:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get student deadlines (pending assignments and quizzes)
  router.get('/student-deadlines/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const deadlines = [];

      // Get pending assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, due_date')
        .gt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true });

      if (assignments) {
        // Filter to only assignments not yet submitted by this student
        const { data: submitted } = await supabase
          .from('assignment_submissions')
          .select('assignment_id')
          .eq('student_id', studentId);

        const submittedIds = submitted?.map(s => s.assignment_id) || [];

        assignments.forEach(assignment => {
          if (!submittedIds.includes(assignment.id)) {
            deadlines.push({
              type: 'assignment',
              title: assignment.title,
              dueDate: assignment.due_date,
              timestamp: new Date(assignment.due_date).getTime(),
            });
          }
        });
      }

      // Get pending quizzes
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id, title, due_date')
        .gt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true });

      if (quizzes) {
        // Filter to only quizzes not yet submitted by this student
        const { data: submitted } = await supabase
          .from('quiz_submissions')
          .select('quiz_id')
          .eq('student_id', studentId);

        const submittedIds = submitted?.map(s => s.quiz_id) || [];

        quizzes.forEach(quiz => {
          if (!submittedIds.includes(quiz.id)) {
            deadlines.push({
              type: 'quiz',
              title: quiz.title,
              dueDate: quiz.due_date,
              timestamp: new Date(quiz.due_date).getTime(),
            });
          }
        });
      }

      // Sort by timestamp ascending (nearest deadline first)
      deadlines.sort((a, b) => a.timestamp - b.timestamp);

      res.json({ deadlines: deadlines.slice(0, 10) });
    } catch (error) {
      console.error('Error fetching student deadlines:', error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};

export default router;
