import express from 'express';

export function initializeMessagingRoutes(supabase) {
  const router = express.Router();

  // Get conversation between two users
  router.get('/conversation/:userId/:otherUserId', async (req, res) => {
    try {
      const { userId, otherUserId } = req.params;

      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      res.json(data || []);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Send a message
  router.post('/send', async (req, res) => {
    try {
      const { sender_id, receiver_id, message, message_type = 'text' } = req.body;

      if (!sender_id || !receiver_id || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('user_messages')
        .insert([
          {
            sender_id,
            receiver_id,
            message,
            message_type,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Message sent:', { from: sender_id, to: receiver_id, timestamp: new Date().toLocaleTimeString() });
      res.json(data);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Mark message as read
  router.put('/read/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;

      const { data, error } = await supabase
        .from('user_messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete message (soft delete)
  router.delete('/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;

      const { data, error } = await supabase
        .from('user_messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get unread message count for a user
  router.get('/unread-count/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const { data, error, count } = await supabase
        .from('user_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false)
        .eq('is_deleted', false);

      if (error) throw error;

      res.json({ unreadCount: count || 0 });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a message (soft delete)
  router.delete('/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;

      const { data, error } = await supabase
        .from('user_messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Message deleted:', { messageId });
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
