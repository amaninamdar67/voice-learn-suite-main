import { Router } from 'express';

export function initializeMentorRoutes(supabase) {
  const router = Router();

  // Setup endpoint to initialize mentor with student links
  router.post('/setup/:mentorId', async (req, res) => {
    try {
      const { mentorId } = req.params;

      console.log(`[MENTOR ROUTES] Setting up mentor: ${mentorId}`);

      // Step 1: Get first 3 students
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student')
        .limit(3);

      if (studentsError || !students || students.length === 0) {
        return res.status(200).json({ error: 'No students found', details: studentsError });
      }

      // Step 2: Create mentor-student links
      const links = students.map(student => ({
        mentor_id: mentorId,
        student_id: student.id,
        created_at: new Date().toISOString()
      }));

      const { error: linksError } = await supabase
        .from('mentor_student_links')
        .insert(links);

      if (linksError) {
        console.error('[MENTOR ROUTES] Error creating links:', linksError);
        return res.status(200).json({ error: 'Failed to create links', details: linksError });
      }

      res.status(200).json({
        success: true,
        message: 'Mentor setup complete',
        mentorId,
        studentsLinked: students.length
      });
    } catch (error) {
      console.error('[MENTOR ROUTES] Setup error:', error);
      res.status(200).json({ error: error.message });
    }
  });

  // Diagnostic endpoint to list all users
  router.get('/debug/list/all', async (req, res) => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .limit(20);

      if (error) {
        return res.status(200).json({ error: error.message });
      }

      res.status(200).json({ users: profiles });
    } catch (error) {
      console.error('[MENTOR ROUTES] List error:', error);
      res.status(200).json({ error: error.message });
    }
  });

  // Diagnostic endpoint to check mentor status
  router.get('/debug/:mentorId', async (req, res) => {
    try {
      const { mentorId } = req.params;

      // Check if user is a mentor
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', mentorId)
        .single();

      if (profileError) {
        return res.status(200).json({ error: 'User not found', mentorId });
      }

      // Check mentor-student links
      const { data: links, error: linksError } = await supabase
        .from('mentor_student_links')
        .select('id, mentor_id, student_id')
        .eq('mentor_id', mentorId);

      res.status(200).json({
        profile,
        linksCount: links?.length || 0,
        links: links || [],
        isMentor: profile?.role === 'mentor'
      });
    } catch (error) {
      console.error('[MENTOR ROUTES] Debug error:', error);
      res.status(200).json({ error: error.message });
    }
  });

  // Get student's mentors
  router.get('/my-mentors/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;

      console.log(`[MENTOR ROUTES] Fetching mentors for student: ${studentId}`);

      // Get all mentors linked to this student with their profile data
      const { data: mentorLinks, error: linksError } = await supabase
        .from('mentor_student_links')
        .select(`
          mentor_id,
          mentor:profiles!mentor_student_links_mentor_id_fkey(id, full_name, department, semester)
        `)
        .eq('student_id', studentId);

      if (linksError) {
        console.error('[MENTOR ROUTES] Error fetching mentor links:', linksError);
        return res.status(200).json({ mentors: [] });
      }

      console.log(`[MENTOR ROUTES] Found ${mentorLinks?.length || 0} mentor links`);

      if (!mentorLinks || mentorLinks.length === 0) {
        return res.status(200).json({ mentors: [] });
      }

      // Extract mentor profiles from the joined data
      const mentors = mentorLinks
        .map(link => link.mentor)
        .filter(mentor => mentor && mentor.id);

      console.log(`[MENTOR ROUTES] Found ${mentors?.length || 0} mentor profiles`);

      res.status(200).json({
        mentors: mentors || []
      });
    } catch (error) {
      console.error('[MENTOR ROUTES] Error fetching student mentors:', error);
      res.status(200).json({ mentors: [] });
    }
  });

  // Get mentor's students (with mentorId parameter)
  router.get('/students/:mentorId', async (req, res) => {
    try {
      const { mentorId } = req.params;

      console.log(`[MENTOR ROUTES] Fetching students for mentor: ${mentorId}`);

      // Step 1: Get all student IDs linked to this mentor
      const { data: mentorLinks, error: linksError } = await supabase
        .from('mentor_student_links')
        .select('student_id')
        .eq('mentor_id', mentorId);

      if (linksError) {
        console.error('[MENTOR ROUTES] Error fetching mentor links:', linksError);
        return res.status(200).json({ students: [], totalSessions: 0, averageRating: 0 });
      }

      console.log(`[MENTOR ROUTES] Found ${mentorLinks?.length || 0} student links`);

      if (!mentorLinks || mentorLinks.length === 0) {
        return res.status(200).json({ students: [], totalSessions: 0, averageRating: 0 });
      }

      // Step 2: Get student profiles
      const studentIds = mentorLinks.map(link => link.student_id);
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, department, semester')
        .in('id', studentIds);

      if (studentsError) {
        console.error('[MENTOR ROUTES] Error fetching student profiles:', studentsError);
        return res.status(200).json({ students: [], totalSessions: 0, averageRating: 0 });
      }

      console.log(`[MENTOR ROUTES] Found ${students?.length || 0} student profiles`);

      // Get session stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('mentoring_sessions')
        .select('id, rating, student_id, session_date')
        .eq('mentor_id', mentorId);

      if (sessionsError) {
        console.warn('[MENTOR ROUTES] Warning fetching sessions:', sessionsError.message);
        // Don't fail if sessions table doesn't exist
      }

      const totalSessions = sessions?.length || 0;
      const averageRating = sessions && sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.length
        : 0;

      // Calculate active status for each student (30 min window)
      const thirtyMinutesAgo = new Date();
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
      
      let activeCount = 0;
      let activeStudentMap = {};
      
      if (studentIds.length > 0) {
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          
          if (!authError && authData) {
            const usersList = authData.users || authData || [];
            
            if (Array.isArray(usersList)) {
              usersList.forEach(user => {
                if (studentIds.includes(user.id)) {
                  const isActive = user.last_sign_in_at && new Date(user.last_sign_in_at) >= thirtyMinutesAgo;
                  activeStudentMap[user.id] = isActive;
                  if (isActive) activeCount++;
                }
              });
            }
          }
        } catch (authErr) {
          console.warn('[MENTOR ROUTES] Warning fetching auth users:', authErr.message);
        }
      }

      // Add active status to each student
      const studentsWithStatus = (students || []).map(student => ({
        ...student,
        isActive: activeStudentMap[student.id] || false
      }));

      res.status(200).json({
        students: studentsWithStatus,
        totalSessions,
        averageRating,
        activeStudents: activeCount
      });
    } catch (error) {
      console.error('[MENTOR ROUTES] Error fetching mentor students:', error);
      res.status(200).json({ students: [], totalSessions: 0, averageRating: 0 });
    }
  });

  // Get mentor's sessions
  router.get('/sessions/:mentorId', async (req, res) => {
    try {
      const { mentorId } = req.params;

      const { data: sessions, error } = await supabase
        .from('mentoring_sessions')
        .select(`
          id,
          student_id,
          student:profiles!student_id(full_name),
          session_date,
          duration_minutes,
          notes,
          rating
        `)
        .eq('mentor_id', mentorId)
        .order('session_date', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedSessions = sessions?.map(s => ({
        id: s.id,
        student_id: s.student_id,
        student_name: s.student?.full_name || 'Unknown',
        session_date: s.session_date,
        duration_minutes: s.duration_minutes,
        notes: s.notes,
        rating: s.rating
      })) || [];

      res.json({ sessions: formattedSessions });
    } catch (error) {
      console.error('Error fetching mentor sessions:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Create a mentoring session
  router.post('/sessions', async (req, res) => {
    try {
      const { mentor_id, student_id, duration_minutes, notes, rating } = req.body;

      const { data, error } = await supabase
        .from('mentoring_sessions')
        .insert([{
          mentor_id,
          student_id,
          session_date: new Date().toISOString(),
          duration_minutes,
          notes,
          rating
        }])
        .select();

      if (error) throw error;

      res.json({ success: true, session: data?.[0] });
    } catch (error) {
      console.error('Error creating mentoring session:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get mentor stats
  router.get('/stats/:mentorId', async (req, res) => {
    try {
      const { mentorId } = req.params;

      // Total students
      const { data: studentLinks } = await supabase
        .from('mentor_student_links')
        .select('id')
        .eq('mentor_id', mentorId);

      // Active students (those with recent activity)
      const { data: activeSessions } = await supabase
        .from('mentoring_sessions')
        .select('student_id')
        .eq('mentor_id', mentorId)
        .gte('session_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Total sessions
      const { data: allSessions } = await supabase
        .from('mentoring_sessions')
        .select('rating')
        .eq('mentor_id', mentorId);

      const totalStudents = studentLinks?.length || 0;
      const activeStudents = new Set(activeSessions?.map(s => s.student_id)).size;
      const totalSessions = allSessions?.length || 0;
      const averageRating = allSessions && allSessions.length > 0
        ? allSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / allSessions.length
        : 0;

      res.json({
        totalStudents,
        activeStudents,
        totalSessions,
        averageRating
      });
    } catch (error) {
      console.error('Error fetching mentor stats:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get messages between two users
  router.get('/messages/:userId/:otherUserId', async (req, res) => {
    try {
      const { userId, otherUserId } = req.params;

      const { data: messages, error } = await supabase
        .from('mentor_parent_messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      res.json({ messages: messages || [] });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Send a message
  router.post('/messages', async (req, res) => {
    try {
      const { sender_id, receiver_id, content } = req.body;

      if (!sender_id || !receiver_id || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data: message, error } = await supabase
        .from('mentor_parent_messages')
        .insert([{
          sender_id,
          receiver_id,
          message: content,
          message_type: 'text',
          is_deleted: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, message });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(400).json({ error: error.message });
    }
  });



  return router;
}
