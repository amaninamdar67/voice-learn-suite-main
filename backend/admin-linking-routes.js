import { Router } from 'express';

const router = Router();

export const initializeAdminLinkingRoutes = (supabase) => {
  // Get users by role
  router.get('/users', async (req, res) => {
    try {
      const { role } = req.query;
      
      let query = supabase.from('profiles').select('id, full_name, email, role');
      
      if (role) {
        query = query.eq('role', role);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      res.json({ users: data });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get parent-student links
  router.get('/parent-student-links', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('parent_student_links')
        .select(`
          id,
          parent_id,
          student_id,
          relationship,
          parent:profiles!parent_id(full_name),
          student:profiles!student_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const links = data.map(link => ({
        id: link.id,
        parent_id: link.parent_id,
        student_id: link.student_id,
        relationship: link.relationship,
        parent_name: link.parent?.full_name,
        student_name: link.student?.full_name
      }));

      res.json({ links });
    } catch (error) {
      console.error('Error fetching parent-student links:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Create parent-student link
  router.post('/parent-student-links', async (req, res) => {
    try {
      const { parent_id, student_id, relationship } = req.body;

      const { data, error } = await supabase
        .from('parent_student_links')
        .insert([{
          parent_id,
          student_id,
          relationship: relationship || 'guardian'
        }])
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, link: data });
    } catch (error) {
      console.error('Error creating parent-student link:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete parent-student link
  router.delete('/parent-student-links/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('parent_student_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting parent-student link:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get parent-mentor links
  router.get('/parent-mentor-links', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('parent_mentor_links')
        .select(`
          id,
          parent_id,
          mentor_id,
          student_id,
          parent:profiles!parent_id(full_name),
          mentor:profiles!mentor_id(full_name),
          student:profiles!student_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const links = data.map(link => ({
        id: link.id,
        parent_id: link.parent_id,
        mentor_id: link.mentor_id,
        student_id: link.student_id,
        parent_name: link.parent?.full_name,
        mentor_name: link.mentor?.full_name,
        student_name: link.student?.full_name
      }));

      res.json({ links });
    } catch (error) {
      console.error('Error fetching parent-mentor links:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Create parent-mentor link
  router.post('/parent-mentor-links', async (req, res) => {
    try {
      const { parent_id, mentor_id, student_id } = req.body;

      const { data, error } = await supabase
        .from('parent_mentor_links')
        .insert([{
          parent_id,
          mentor_id,
          student_id
        }])
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, link: data });
    } catch (error) {
      console.error('Error creating parent-mentor link:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete parent-mentor link
  router.delete('/parent-mentor-links/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('parent_mentor_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting parent-mentor link:', error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};

export default router;
