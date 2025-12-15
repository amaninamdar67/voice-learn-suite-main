import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupMentorData() {
  try {
    // Get Mentor1 (the mentor user)
    const { data: mentor, error: mentorError } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', 'Mentor1')
      .single();

    if (mentorError || !mentor) {
      console.error('Mentor not found');
      return;
    }

    console.log('Mentor ID:', mentor.id);

    // Get first 5 students
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'student')
      .limit(5);

    if (studentsError || !students || students.length === 0) {
      console.error('No students found');
      return;
    }

    console.log('Found students:', students.map(s => s.full_name));

    // Create mentor-student links
    const links = students.map(student => ({
      mentor_id: mentor.id,
      student_id: student.id,
      created_at: new Date().toISOString()
    }));

    const { error: linksError } = await supabase
      .from('mentor_student_links')
      .insert(links);

    if (linksError) {
      console.error('Error creating links:', linksError);
      return;
    }

    console.log('✅ Successfully linked', students.length, 'students to mentor');
  } catch (error) {
    console.error('Error:', error);
  }
}

setupMentorData();
