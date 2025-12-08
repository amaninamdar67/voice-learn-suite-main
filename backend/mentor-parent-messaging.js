import { Router } from 'express';

export const initializeMentorParentMessaging = (supabase) => {
  const router = Router();
  
  // Get conversations between mentor and parent
  router.get('/conversations/:mentorId/:parentId', async (req, res) => {
    try {
      const { mentorId, parentId } = req.params;
      
      const { data, error } = await supabase
        .from('mentor_parent_messages')
        .select(`
          *,
          mentor:profiles!mentor_id(id, full_name),
          parent:profiles!parent_id(id, full_name),
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
        .from('mentor_student_links')
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
        .from('mentor_student_links')
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

  // Get all messages for a mentor
  router.get('/mentor-messages/:mentorId', async (req, res) => {
    try {
      const { mentorId } = req.params;

      const { data, error } = await supabase
        .from('mentor_parent_messages')
        .select(`
          id,
          mentor_id,
          parent_id,
          student_id,
          message,
          is_read,
          created_at,
          mentor:profiles!mentor_id(id, full_name),
          parent:profiles!parent_id(id, full_name),
          student:profiles!student_id(id, full_name)
        `)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ messages: data });
    } catch (error) {
      console.error('Error fetching mentor messages:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Send reply from mentor to parent
  router.post('/reply', async (req, res) => {
    try {
      const { mentorId, parentId, studentId, replyMessage, originalMessageId } = req.body;

      console.log('[REPLY] Mentor:', mentorId, 'Parent:', parentId, 'Student:', studentId);

      const { data, error } = await supabase
        .from('mentor_parent_messages')
        .insert([{
          mentor_id: mentorId,
          parent_id: parentId,
          student_id: studentId,
          message: replyMessage,
          message_type: 'reply',
          reply_to_id: originalMessageId
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('[REPLY] Reply sent successfully:', data.id);
      res.json({ success: true, message: data });
    } catch (error) {
      console.error('Error sending reply:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get replies for a specific message
  router.get('/messages/:messageId/replies', async (req, res) => {
    try {
      const { messageId } = req.params;

      const { data, error } = await supabase
        .from('mentor_parent_messages')
        .select(`
          id,
          mentor_id,
          parent_id,
          student_id,
          message,
          is_read,
          created_at,
          mentor:profiles!mentor_id(id, full_name),
          parent:profiles!parent_id(id, full_name),
          student:profiles!student_id(id, full_name)
        `)
        .eq('reply_to_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      res.json({ replies: data });
    } catch (error) {
      console.error('Error fetching replies:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete message (PERMANENT - hard delete)
  router.delete('/messages/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      console.log('[DELETE] Permanently deleting message:', messageId, 'by user:', userId);

      // First, verify the message exists and get both parent_id and mentor_id
      const { data: messages, error: fetchError } = await supabase
        .from('mentor_parent_messages')
        .select('parent_id, mentor_id, id')
        .eq('id', messageId);

      if (fetchError) {
        console.error('[DELETE] Fetch error:', fetchError);
        return res.status(400).json({ error: 'Failed to fetch message: ' + fetchError.message });
      }

      if (!messages || messages.length === 0) {
        console.log('[DELETE] Message not found:', messageId);
        return res.status(404).json({ error: 'Message not found' });
      }

      const message = messages[0];
      console.log('[DELETE] Found message:', message);

      // Allow deletion if user is either the parent or mentor who sent the message
      if (message.parent_id !== userId && message.mentor_id !== userId) {
        console.log('[DELETE] Unauthorized - user is neither parent nor mentor');
        return res.status(403).json({ error: 'Unauthorized: You can only delete your own messages' });
      }

      // PERMANENT DELETE - remove from database completely
      const { error: deleteError } = await supabase
        .from('mentor_parent_messages')
        .delete()
        .eq('id', messageId);

      if (deleteError) {
        console.error('[DELETE] Delete error:', deleteError);
        return res.status(400).json({ error: 'Failed to delete message: ' + deleteError.message });
      }

      console.log('[DELETE] Message permanently deleted:', messageId);
      res.json({ success: true, message: 'Message permanently deleted' });
    } catch (error) {
      console.error('[DELETE] Error deleting message:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete message (PERMANENT - hard delete) - using POST
  router.post('/messages/:messageId/delete', async (req, res) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      console.log('[DELETE-POST] Permanently deleting message:', messageId, 'by user:', userId);

      // First, verify the message exists and get both parent_id and mentor_id
      const { data: messages, error: fetchError } = await supabase
        .from('mentor_parent_messages')
        .select('parent_id, mentor_id, id')
        .eq('id', messageId);

      if (fetchError) {
        console.error('[DELETE-POST] Fetch error:', fetchError);
        return res.status(400).json({ error: 'Failed to fetch message: ' + fetchError.message });
      }

      if (!messages || messages.length === 0) {
        console.log('[DELETE-POST] Message not found:', messageId);
        return res.status(404).json({ error: 'Message not found' });
      }

      const message = messages[0];
      console.log('[DELETE-POST] Found message:', message);

      // Allow deletion if user is either the parent or mentor who sent the message
      if (message.parent_id !== userId && message.mentor_id !== userId) {
        console.log('[DELETE-POST] Unauthorized - user is neither parent nor mentor');
        return res.status(403).json({ error: 'Unauthorized: You can only delete your own messages' });
      }

      // PERMANENT DELETE - remove from database completely
      const { error: deleteError } = await supabase
        .from('mentor_parent_messages')
        .delete()
        .eq('id', messageId);

      if (deleteError) {
        console.error('[DELETE-POST] Delete error:', deleteError);
        return res.status(400).json({ error: 'Failed to delete message: ' + deleteError.message });
      }

      console.log('[DELETE-POST] Message permanently deleted:', messageId);
      res.json({ success: true, message: 'Message permanently deleted' });
    } catch (error) {
      console.error('[DELETE-POST] Error deleting message:', error);
      res.status(400).json({ error: error.message });
    }
  });



  return router;
};

export default initializeMentorParentMessaging;
