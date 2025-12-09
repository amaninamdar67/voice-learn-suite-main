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
        .eq('is_deleted', false)
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
      const { mentorId, parentId, studentId, message, messageType, senderId } = req.body;

      console.log('[SEND MESSAGE] Attempting to send message:', {
        mentorId,
        parentId,
        studentId,
        senderId,
        messageLength: message?.length,
        messageType
      });

      // Validate required fields
      if (!mentorId || !parentId || !studentId || !message) {
        console.error('[SEND MESSAGE] Missing required fields:', {
          mentorId: !!mentorId,
          parentId: !!parentId,
          studentId: !!studentId,
          message: !!message
        });
        return res.status(400).json({ error: 'Missing required fields: mentorId, parentId, studentId, message' });
      }

      const { data, error } = await supabase
        .from('mentor_parent_messages')
        .insert([{
          mentor_id: mentorId,
          parent_id: parentId,
          student_id: studentId,
          message,
          message_type: messageType || 'text',
          sender_id: senderId
        }])
        .select()
        .single();

      if (error) {
        console.error('[SEND MESSAGE] Database error:', error);
        throw error;
      }

      console.log('[SEND MESSAGE] Message sent successfully:', data.id);
      res.json({ success: true, message: data });
    } catch (error) {
      console.error('[SEND MESSAGE] Error sending message:', error);
      res.status(400).json({ error: error.message || 'Failed to send message' });
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

      console.log('[GET CHILDREN] Fetching children for parent:', parentId);

      const { data, error } = await supabase
        .from('parent_student_links')
        .select('student_id, profiles!student_id(id, full_name)')
        .eq('parent_id', parentId);

      if (error) {
        console.error('[GET CHILDREN] Error:', error);
        throw error;
      }

      const children = data.map(item => item.profiles).filter(Boolean);
      console.log('[GET CHILDREN] Found', children.length, 'children');
      res.json({ children });
    } catch (error) {
      console.error('[GET CHILDREN] Error fetching parent children:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get student's mentor
  router.get('/student-mentor/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;

      console.log('[GET MENTOR] Fetching mentor for student:', studentId);

      const { data, error } = await supabase
        .from('mentor_student_links')
        .select('mentor_id, profiles!mentor_id(id, full_name)')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[GET MENTOR] Error:', error);
        throw error;
      }

      console.log('[GET MENTOR] Found mentor:', data?.profiles?.id);
      res.json({ mentor: data?.profiles || null });
    } catch (error) {
      console.error('[GET MENTOR] Error fetching student mentor:', error);
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
        .eq('is_deleted', false)
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

      // Verify the original message exists and get its details
      const { data: originalMsg, error: fetchError } = await supabase
        .from('mentor_parent_messages')
        .select('*')
        .eq('id', originalMessageId)
        .single();

      if (fetchError) throw fetchError;

      // The reply should have the same mentor_id and parent_id as the original message
      // This ensures the conversation stays between the same two people
      const { data, error } = await supabase
        .from('mentor_parent_messages')
        .insert([{
          mentor_id: originalMsg.mentor_id,
          parent_id: originalMsg.parent_id,
          student_id: studentId,
          message: replyMessage,
          message_type: 'reply',
          reply_to_id: originalMessageId,
          sender_id: mentorId
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
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      res.json({ replies: data });
    } catch (error) {
      console.error('Error fetching replies:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete message (SOFT DELETE - mark as deleted)
  router.delete('/messages/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      console.log('[DELETE] Soft deleting message:', messageId, 'by user:', userId);

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

      // SOFT DELETE - mark as deleted instead of removing from database
      const { error: deleteError } = await supabase
        .from('mentor_parent_messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (deleteError) {
        console.error('[DELETE] Delete error:', deleteError);
        return res.status(400).json({ error: 'Failed to delete message: ' + deleteError.message });
      }

      console.log('[DELETE] Message soft deleted:', messageId);
      res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
      console.error('[DELETE] Error deleting message:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete message (SOFT DELETE - mark as deleted) - using POST
  router.post('/messages/:messageId/delete', async (req, res) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      console.log('[DELETE-POST] Soft deleting message:', messageId, 'by user:', userId);

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

      // SOFT DELETE - mark as deleted instead of removing from database
      const { error: deleteError } = await supabase
        .from('mentor_parent_messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (deleteError) {
        console.error('[DELETE-POST] Delete error:', deleteError);
        return res.status(400).json({ error: 'Failed to delete message: ' + deleteError.message });
      }

      console.log('[DELETE-POST] Message soft deleted:', messageId);
      res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
      console.error('[DELETE-POST] Error deleting message:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete messages when parent is changed for a student
  // Delete ALL messages (both parent->mentor and mentor->parent) for this parent-student pair
  router.post('/cleanup-messages/parent/:studentId/:oldParentId', async (req, res) => {
    try {
      const { studentId, oldParentId } = req.params;

      console.log('[CLEANUP-PARENT] Deleting all messages for parent:', oldParentId, 'student:', studentId);

      // Delete ALL messages (incoming and outgoing) for this parent-student pair
      const { error: deleteError } = await supabase
        .from('mentor_parent_messages')
        .delete()
        .eq('parent_id', oldParentId)
        .eq('student_id', studentId);

      if (deleteError) throw deleteError;

      console.log('[CLEANUP-PARENT] Deleted all messages for parent-student pair');
      res.json({ success: true, message: 'All parent messages deleted' });
    } catch (error) {
      console.error('[CLEANUP-PARENT] Error deleting parent messages:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete messages when mentor is changed for a student
  // Delete ALL messages for this mentor-parent-student trio
  router.post('/cleanup-messages/mentor/:studentId/:oldMentorId/:oldParentId', async (req, res) => {
    try {
      const { studentId, oldMentorId, oldParentId } = req.params;

      console.log('[CLEANUP-MENTOR] Deleting all messages for mentor:', oldMentorId, 'parent:', oldParentId, 'student:', studentId);

      // Delete ALL messages (both directions) for this mentor-parent-student trio
      const { error: deleteError } = await supabase
        .from('mentor_parent_messages')
        .delete()
        .eq('mentor_id', oldMentorId)
        .eq('parent_id', oldParentId)
        .eq('student_id', studentId);

      if (deleteError) throw deleteError;

      console.log('[CLEANUP-MENTOR] Deleted all mentor-parent-student messages');
      res.json({ success: true, message: 'All mentor messages deleted' });
    } catch (error) {
      console.error('[CLEANUP-MENTOR] Error deleting mentor messages:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete ALL messages for a student (when completely unlinked)
  router.post('/cleanup-messages/student/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;

      console.log('[CLEANUP-STUDENT] Deleting ALL messages for student:', studentId);

      // Delete ALL messages for this student (both incoming and outgoing)
      const { error: deleteError } = await supabase
        .from('mentor_parent_messages')
        .delete()
        .eq('student_id', studentId);

      if (deleteError) throw deleteError;

      console.log('[CLEANUP-STUDENT] Deleted all messages for student');
      res.json({ success: true, message: 'All student messages deleted' });
    } catch (error) {
      console.error('[CLEANUP-STUDENT] Error deleting student messages:', error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};

export default initializeMentorParentMessaging;
