import { Router } from 'express';

const router = Router();

export const initializeMentorParentMessaging = (supabase) => {
  // Get conversations between mentor and parent
  router.get('/conversations/:mentorId/:parentId', async (req, res) => {
    try {
      const { mentorId, parentId } = req.params;
      
      const { data, error } = await supabase
        .from('mentor_parent_messages')
        .select(`
          *,
          mentor:profiles!mentor_id(id, full_name, avatar_url),
          parent:profiles!parent_id(id, full_name, avatar_url),
          student:profiles!student_id(id, full_name)
        `)
        .or(`and(mentor_id.eq.${mentorId},parent_id.eq.${parentId}),and(mentor_id.eq.${parentId},parent_id.eq.${mentorId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      res.json({ messages: data });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Send message
  router.post('/messages', async (req, res) => {
    try {
      const { mentorId, parentId, studentId, message, messageType } = req.body;

      const { data, error } = await supabase
        .from('mentor_parent_messages')
        .insert([{
          mentor_id: mentorId,
          parent_id: parentId,
          student_id: studentId,
          message,
          message_type: messageType || 'text'
        }])
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, message: data });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Mark messages as read
  router.put('/messages/read/:conversationId', async (req, res) => {
    try {
      const { conversationId } = req.params;

      const { error } = await supabase
        .from('mentor_parent_messages')
        .update({ is_read: true })
        .eq('id', conversationId);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking as read:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get student performance analytics
  router.get('/analytics/student/:studentId/:mentorId', async (req, res) => {
    try {
      const { studentId, mentorId } = req.params;

      const { data, error } = await supabase
        .from('student_performance_analytics')
        .select('*')
        .eq('student_id', studentId)
        .eq('mentor_id', mentorId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      res.json({ analytics: data || {} });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update student performance analytics
  router.put('/analytics/student/:studentId/:mentorId', async (req, res) => {
    try {
      const { studentId, mentorId } = req.params;
      const analyticsData = req.body;

      const { data: existing } = await supabase
        .from('student_performance_analytics')
        .select('id')
        .eq('student_id', studentId)
        .eq('mentor_id', mentorId)
        .single();

      let result;
      if (existing) {
        result = await supabase
          .from('student_performance_analytics')
          .update(analyticsData)
          .eq('student_id', studentId)
          .eq('mentor_id', mentorId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('student_performance_analytics')
          .insert([{
            student_id: studentId,
            mentor_id: mentorId,
            parent_id: analyticsData.parent_id,
            ...analyticsData
          }])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      res.json({ success: true, analytics: result.data });
    } catch (error) {
      console.error('Error updating analytics:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get parent's children
  router.get('/parent-children/:parentId', async (req, res) => {
    try {
      const { parentId } = req.params;

      const { data, error } = await supabase
        .from('parent_student_links')
        .select('student_id, profiles!student_id(id, full_name)')
        .eq('parent_id', parentId);

      if (error) throw error;

      const children = data.map(item => item.profiles).filter(Boolean);
      res.json({ children });
    } catch (error) {
      console.error('Error fetching parent children:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get student's mentor
  router.get('/student-mentor/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;

      const { data, error } = await supabase
        .from('mentor_student_link')
        .select('mentor_id, profiles!mentor_id(id, full_name)')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      res.json({ mentor: data?.profiles || null });
    } catch (error) {
      console.error('Error fetching student mentor:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get mentor's students
  router.get('/mentor-students/:mentorId', async (req, res) => {
    try {
      const { mentorId } = req.params;

      const { data, error } = await supabase
        .from('mentor_student_link')
        .select('student_id, profiles!student_id(id, full_name)')
        .eq('mentor_id', mentorId);

      if (error) throw error;

      const students = data.map(item => item.profiles).filter(Boolean);
      res.json({ students });
    } catch (error) {
      console.error('Error fetching mentor students:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get student's parent
  router.get('/student-parent/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;

      const { data, error } = await supabase
        .from('parent_student_links')
        .select('parent_id, profiles!parent_id(id, full_name)')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      res.json({ parent: data?.profiles || null });
    } catch (error) {
      console.error('Error fetching student parent:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get alerts
  router.get('/alerts/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const { data, error } = await supabase
        .from('mentor_parent_alerts')
        .select(`
          *,
          student:profiles!student_id(id, full_name)
        `)
        .or(`mentor_id.eq.${userId},parent_id.eq.${userId}`)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ alerts: data });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Create alert
  router.post('/alerts', async (req, res) => {
    try {
      const { mentorId, parentId, studentId, alertType, alertTitle, alertDescription, severity } = req.body;

      const { data, error } = await supabase
        .from('mentor_parent_alerts')
        .insert([{
          mentor_id: mentorId,
          parent_id: parentId,
          student_id: studentId,
          alert_type: alertType,
          alert_title: alertTitle,
          alert_description: alertDescription,
          severity: severity || 'medium'
        }])
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, alert: data });
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Resolve alert
  router.put('/alerts/:alertId/resolve', async (req, res) => {
    try {
      const { alertId } = req.params;

      const { data, error } = await supabase
        .from('mentor_parent_alerts')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, alert: data });
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};

export default router;
