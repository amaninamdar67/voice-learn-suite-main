import express from 'express';

export function initializeTeacherRoutes(supabase) {
  const router = express.Router();

  // Get all teachers (for students to message)
  router.get('/all', async (req, res) => {
    try {
      const { data: teachers, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'teacher')
        .limit(100);

      if (error) throw error;

      console.log('✅ Teachers fetched:', { count: teachers?.length || 0, teachers });
      res.json(teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get all teachers and mentors (for students to message)
  router.get('/all-contacts', async (req, res) => {
    try {
      const { data: contacts, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['teacher', 'mentor'])
        .limit(100);

      if (error) throw error;

      console.log('✅ Contacts fetched:', { count: contacts?.length || 0, contacts });
      res.json(contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get teacher's students
  router.get('/students/:teacherId', async (req, res) => {
    try {
      const { teacherId } = req.params;

      // Get all students assigned to this teacher
      // This could be through various relationships depending on your schema
      // For now, we'll get students from the same domain/department
      const { data: students, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'student')
        .limit(100);

      if (error) throw error;

      res.json(students || []);
    } catch (error) {
      console.error('Error fetching teacher students:', error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
