import express from 'express';

export function initializeAnnouncementsRoutes(supabase) {
  const router = express.Router();

  // Get all announcements for a user (filtered by receiver_id)
  router.get('/all/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      // Try to fetch with announcement_tag first
      let { data: announcements, error } = await supabase
        .from('user_messages')
        .select(`
          id,
          sender_id,
          message,
          created_at,
          announcement_tag,
          profiles!user_messages_sender_id_fkey(full_name)
        `)
        .eq('receiver_id', userId)
        .eq('message_type', 'announcement')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      // If column doesn't exist, fetch without it
      if (error && error.message && error.message.includes('announcement_tag')) {
        console.log('⚠️  announcement_tag column not found, fetching without it');
        const { data: announcementsNoTag, error: error2 } = await supabase
          .from('user_messages')
          .select(`
            id,
            sender_id,
            message,
            created_at,
            profiles!user_messages_sender_id_fkey(full_name)
          `)
          .eq('receiver_id', userId)
          .eq('message_type', 'announcement')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error2) throw error2;
        announcements = announcementsNoTag;
      } else if (error) {
        throw error;
      }

      // Format the response to include sender_name and handle missing announcement_tag
      const formattedAnnouncements = announcements.map((ann) => ({
        id: ann.id,
        sender_id: ann.sender_id,
        sender_name: ann.profiles?.full_name || 'Unknown',
        message: ann.message,
        created_at: ann.created_at,
        announcement_tag: ann.announcement_tag || 'normal',
      }));

      console.log('✅ Announcements fetched:', { userId, count: formattedAnnouncements.length });
      res.json(formattedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get all announcements (legacy endpoint - kept for compatibility)
  router.get('/all', async (req, res) => {
    try {
      // Try to fetch with announcement_tag first
      let { data: announcements, error } = await supabase
        .from('user_messages')
        .select(`
          id,
          sender_id,
          message,
          created_at,
          announcement_tag,
          profiles!user_messages_sender_id_fkey(full_name)
        `)
        .eq('message_type', 'announcement')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      // If column doesn't exist, fetch without it
      if (error && error.message && error.message.includes('announcement_tag')) {
        console.log('⚠️  announcement_tag column not found, fetching without it');
        const { data: announcementsNoTag, error: error2 } = await supabase
          .from('user_messages')
          .select(`
            id,
            sender_id,
            message,
            created_at,
            profiles!user_messages_sender_id_fkey(full_name)
          `)
          .eq('message_type', 'announcement')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error2) throw error2;
        announcements = announcementsNoTag;
      } else if (error) {
        throw error;
      }

      // Format the response to include sender_name and handle missing announcement_tag
      const formattedAnnouncements = announcements.map((ann) => ({
        id: ann.id,
        sender_id: ann.sender_id,
        sender_name: ann.profiles?.full_name || 'Unknown',
        message: ann.message,
        created_at: ann.created_at,
        announcement_tag: ann.announcement_tag || 'normal',
      }));

      console.log('✅ Announcements fetched:', { count: formattedAnnouncements.length });
      res.json(formattedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get urgent/important announcements for a user (all, not just unread)
  router.get('/unread-urgent/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      let { data: announcements, error } = await supabase
        .from('user_messages')
        .select(`
          id,
          sender_id,
          message,
          created_at,
          announcement_tag,
          profiles!user_messages_sender_id_fkey(full_name)
        `)
        .eq('receiver_id', userId)
        .eq('message_type', 'announcement')
        .eq('is_deleted', false)
        .in('announcement_tag', ['urgent', 'important'])
        .order('created_at', { ascending: false });

      // If column doesn't exist, fetch without it
      if (error && error.message && error.message.includes('announcement_tag')) {
        console.log('⚠️  announcement_tag column not found, fetching without it');
        const { data: announcementsNoTag, error: error2 } = await supabase
          .from('user_messages')
          .select(`
            id,
            sender_id,
            message,
            created_at,
            profiles!user_messages_sender_id_fkey(full_name)
          `)
          .eq('receiver_id', userId)
          .eq('message_type', 'announcement')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });
        
        if (error2) throw error2;
        announcements = announcementsNoTag;
      } else if (error) {
        throw error;
      }

      // Format the response
      let formattedAnnouncements = (announcements || []).map((ann) => ({
        id: ann.id,
        sender_id: ann.sender_id,
        sender_name: ann.profiles?.full_name || 'Unknown',
        message: ann.message,
        created_at: ann.created_at,
        announcement_tag: ann.announcement_tag || 'normal',
      }));

      // Sort by priority: urgent first, then important, then by date (newest first)
      const priorityOrder = { urgent: 0, important: 1, normal: 2, info: 3 };
      formattedAnnouncements.sort((a, b) => {
        const priorityDiff = (priorityOrder[a.announcement_tag] || 2) - (priorityOrder[b.announcement_tag] || 2);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log('✅ Urgent announcements:', { userId, count: formattedAnnouncements.length });
      res.json({ count: formattedAnnouncements.length, announcements: formattedAnnouncements });
    } catch (error) {
      console.error('Error fetching urgent announcements:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Mark announcements as read
  router.put('/mark-read/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const { data, error } = await supabase
        .from('user_messages')
        .update({ is_read: true })
        .eq('receiver_id', userId)
        .eq('message_type', 'announcement')
        .eq('is_deleted', false)
        .select();

      if (error) throw error;

      console.log('✅ Announcements marked as read:', { userId, count: data?.length || 0 });
      res.json({ success: true, count: data?.length || 0 });
    } catch (error) {
      console.error('Error marking announcements as read:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Broadcast announcement to all students
  router.post('/broadcast', async (req, res) => {
    try {
      const { sender_id, message, message_type = 'announcement', announcement_tag = 'normal' } = req.body;

      if (!sender_id || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get all students
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        return res.json({ success: true, message: 'No students to send announcement to', count: 0 });
      }

      // Create announcement for each student
      const announcements = students.map((student) => ({
        sender_id,
        receiver_id: student.id,
        message,
        message_type,
        announcement_tag,
      }));

      let data;
      let error;
      
      // Try to insert with announcement_tag
      ({ data, error } = await supabase
        .from('user_messages')
        .insert(announcements)
        .select());

      // If column doesn't exist, try without it
      if (error && error.message && error.message.includes('announcement_tag')) {
        console.log('⚠️  announcement_tag column not found, inserting without it');
        const announcementsNoTag = students.map((student) => ({
          sender_id,
          receiver_id: student.id,
          message,
          message_type,
        }));
        
        ({ data, error } = await supabase
          .from('user_messages')
          .insert(announcementsNoTag)
          .select());
      }

      if (error) throw error;

      console.log('✅ Announcement broadcast:', { from: sender_id, to_count: students.length, tag: announcement_tag, timestamp: new Date().toLocaleTimeString() });
      
      // Return the first announcement with sender info for display
      const { data: senderData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', sender_id)
        .single();

      res.json({
        id: data[0]?.id,
        sender_id,
        sender_name: senderData?.full_name || 'Unknown',
        message,
        created_at: data[0]?.created_at,
        announcement_tag,
      });
    } catch (error) {
      console.error('Error broadcasting announcement:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete an announcement (soft delete) - only sender can delete
  router.delete('/:announcementId', async (req, res) => {
    try {
      const { announcementId } = req.params;
      const { sender_id } = req.body;

      if (!sender_id) {
        return res.status(400).json({ error: 'sender_id is required' });
      }

      // First, get the announcement to verify sender
      const { data: announcement, error: fetchError } = await supabase
        .from('user_messages')
        .select('sender_id, message_type')
        .eq('id', announcementId)
        .single();

      if (fetchError) throw fetchError;

      // Check if the user is the sender
      if (announcement.sender_id !== sender_id) {
        return res.status(403).json({ error: 'You can only delete your own announcements' });
      }

      // For announcements, we need to delete all instances (sent to all students)
      // Get the message content to find all instances
      const { data: allInstances, error: findError } = await supabase
        .from('user_messages')
        .select('id')
        .eq('sender_id', sender_id)
        .eq('message_type', 'announcement')
        .eq('id', announcementId);

      if (findError) throw findError;

      // Soft delete all instances
      const { error: deleteError } = await supabase
        .from('user_messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('sender_id', sender_id)
        .eq('message_type', 'announcement')
        .eq('id', announcementId);

      if (deleteError) throw deleteError;

      console.log('✅ Announcement deleted:', { announcementId, sender_id });
      res.json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
