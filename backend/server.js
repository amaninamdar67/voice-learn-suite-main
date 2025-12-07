import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  initializeLMSRoutes,
  getVideoLessons,
  createVideoLesson,
  updateVideoLesson,
  deleteVideoLesson,
  getRecordedVideos,
  createRecordedVideo,
  updateRecordedVideo,
  deleteRecordedVideo,
  trackVideoProgress,
  getWatchHistory,
  getLiveClasses,
  createLiveClass,
  updateLiveClassStatus,
  sendAttendancePing,
  deleteLiveClass,
  getQuizzes,
  getQuizWithQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  trackLessonProgress,
  joinLiveClass,
  leaveLiveClass,
  respondToPing,
  submitQuiz,
  getQuizRankings,
  getStudentRank,
  getTopPerformers,
  getStudentRankingHistory,
  recalculateRankings,
  getStudentAnalytics,
  getTeacherAnalytics,
  updateCommunityPost,
  deleteCommunityPost,
  updateCommunityReply,
  deleteCommunityReply,
} from './lms-routes.js';
import { initializeMentorParentMessaging } from './mentor-parent-messaging.js';
import { initializeAdminLinkingRoutes } from './admin-linking-routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase with service role key (has admin privileges)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize LMS routes with Supabase client
initializeLMSRoutes(supabase);

// Initialize Mentor-Parent Messaging routes
const mentorParentRouter = initializeMentorParentMessaging(supabase);
app.use('/api/mentor-parent', mentorParentRouter);

// Initialize Admin Linking routes
const adminLinkingRouter = initializeAdminLinkingRoutes(supabase);
app.use('/api/admin', adminLinkingRouter);

// Create user endpoint (with domain support)
app.post('/api/users/create', async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create profile with domain fields
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        ...profile,
        // Ensure domain fields are included
        sub_domain_id: profile.sub_domain_id,
      }]);

    if (profileError) throw profileError;

    res.json({ success: true, user: authData.user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Reset password endpoint
app.post('/api/users/reset-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) throw error;

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user email endpoint
app.post('/api/users/update-email', async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    // Update email in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { email }
    );

    if (authError) throw authError;

    // Update name in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', userId);

    if (profileError) throw profileError;

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    // Get profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    // Get auth users to fetch emails
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;

    // Merge profile data with email and last sign in from auth users
    const usersWithEmails = profiles.map(profile => {
      const authUser = authUsers.find(u => u.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || 'N/A',
        last_sign_in_at: authUser?.last_sign_in_at || profile.created_at
      };
    });

    res.json({ users: usersWithEmails });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) throw profileError;

    // Get auth user to fetch email
    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(id);
    
    if (authError) throw authError;

    // Merge profile data with email
    const userWithEmail = {
      ...profile,
      email: authUser?.email || 'N/A'
    };

    res.json({ user: userWithEmail });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { children_ids, ...profileData } = req.body;
    
    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If children_ids provided (for parent role), update relationships
    if (children_ids && Array.isArray(children_ids)) {
      // Delete existing relationships
      await supabase
        .from('parent_children')
        .delete()
        .eq('parent_id', id);

      // Insert new relationships
      if (children_ids.length > 0) {
        const relationships = children_ids.map(child_id => ({
          parent_id: id,
          child_id: child_id
        }));

        await supabase
          .from('parent_children')
          .insert(relationships);
      }
    }

    res.json({ success: true, user: data });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user from auth (this will cascade delete the profile due to foreign key)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) throw authError;

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== DOMAINS ENDPOINTS ====================

// Get all domains
app.get('/api/domains', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    res.json({ domains: data });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create domain
app.post('/api/domains/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const { data, error } = await supabase
      .from('domains')
      .insert([{ name, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, domain: data });
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update domain
app.put('/api/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    const { data, error } = await supabase
      .from('domains')
      .update({ name, description, is_active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, domain: data });
  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete domain
app.delete('/api/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Note: Cascading deletes are handled by database foreign key constraints
    // with ON DELETE CASCADE for sub_domains, departments, semesters, and lessons
    
    // Update users to remove domain association (set to NULL instead of deleting users)
    await supabase
      .from('profiles')
      .update({ 
        domain_id: null,
        sub_domain_id: null,
        department_id: null,
        semester_id: null
      })
      .eq('domain_id', id);
    
    // Delete the domain (cascading will handle related records)
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Domain deleted successfully. Users have been unassigned from this domain.' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== DEPARTMENTS ENDPOINTS ====================

// Get all departments (optionally filtered by domain)
app.get('/api/departments', async (req, res) => {
  try {
    const { domainId } = req.query;
    
    let query = supabase.from('departments').select('*');
    
    if (domainId) {
      query = query.eq('domain_id', domainId);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ departments: data });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create department
app.post('/api/departments/create', async (req, res) => {
  try {
    const { domain_id, sub_domain_id, name, description } = req.body;
    
    const { data, error } = await supabase
      .from('departments')
      .insert([{ domain_id, sub_domain_id, name, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, department: data });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update department
app.put('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, sub_domain_id } = req.body;
    
    const { data, error } = await supabase
      .from('departments')
      .update({ name, description, is_active, sub_domain_id })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, department: data });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete department
app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== SUB-DOMAINS ENDPOINTS ====================

// Get all sub-domains (optionally filtered by domain)
app.get('/api/subdomains', async (req, res) => {
  try {
    const { domainId } = req.query;
    
    let query = supabase.from('sub_domains').select('*');
    
    if (domainId) {
      query = query.eq('domain_id', domainId);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ subdomains: data });
  } catch (error) {
    console.error('Error fetching sub-domains:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create sub-domain
app.post('/api/subdomains/create', async (req, res) => {
  try {
    const { domain_id, name, description, type, department_name, semester_name } = req.body;
    
    const { data, error } = await supabase
      .from('sub_domains')
      .insert([{ domain_id, name, description, type, department_name, semester_name }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, subdomain: data });
  } catch (error) {
    console.error('Error creating sub-domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update sub-domain
app.put('/api/subdomains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, is_active, department_name, semester_name } = req.body;
    
    const { data, error } = await supabase
      .from('sub_domains')
      .update({ name, description, type, is_active, department_name, semester_name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, subdomain: data });
  } catch (error) {
    console.error('Error updating sub-domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete sub-domain
app.delete('/api/subdomains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('sub_domains')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Sub-domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-domain:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== SEMESTERS ENDPOINTS ====================

// Get all semesters (optionally filtered by domain or department)
app.get('/api/semesters', async (req, res) => {
  try {
    const { domainId, departmentId } = req.query;
    
    let query = supabase.from('semesters').select('*');
    
    if (domainId) {
      query = query.eq('domain_id', domainId);
    }
    
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ semesters: data });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create semester
app.post('/api/semesters/create', async (req, res) => {
  try {
    const { domain_id, department_id, sub_domain_id, name, description } = req.body;
    
    const { data, error } = await supabase
      .from('semesters')
      .insert([{ domain_id, department_id, sub_domain_id, name, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, semester: data });
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update semester
app.put('/api/semesters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, department_id, is_active, sub_domain_id } = req.body;
    
    const { data, error } = await supabase
      .from('semesters')
      .update({ name, description, department_id, is_active, sub_domain_id })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, semester: data });
  } catch (error) {
    console.error('Error updating semester:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete semester
app.delete('/api/semesters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('semesters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Semester deleted successfully' });
  } catch (error) {
    console.error('Error deleting semester:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user's domains (for login domain selection)
app.post('/api/auth/user-domains', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get all profiles with this email across domains
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('domain_id, domains(id, name)')
      .eq('email', email);
    
    if (error) throw error;
    
    // Extract unique domains
    const domains = profiles
      .filter(p => p.domains)
      .map(p => p.domains)
      .filter((domain, index, self) => 
        index === self.findIndex(d => d.id === domain.id)
      );
    
    res.json({ domains });
  } catch (error) {
    console.error('Error fetching user domains:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== PARENT-CHILDREN ENDPOINTS ====================

// Create parent-children relationships
app.post('/api/parent-children', async (req, res) => {
  try {
    const { relationships } = req.body;
    
    const { data, error } = await supabase
      .from('parent_children')
      .insert(relationships)
      .select();

    if (error) throw error;

    res.json({ success: true, relationships: data });
  } catch (error) {
    console.error('Error creating parent-children relationships:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get children for a parent
app.get('/api/parent-children/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    
    const { data, error } = await supabase
      .from('parent_children')
      .select('child_id, profiles!parent_children_child_id_fkey(*)')
      .eq('parent_id', parentId);

    if (error) throw error;

    res.json({ children: data });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== LESSONS ENDPOINTS ====================

// Get all lessons (filtered by role)
app.get('/api/lessons', async (req, res) => {
  try {
    const { grade, subject, teacherId } = req.query;
    
    let query = supabase.from('lessons').select('*, profiles!lessons_teacher_id_fkey(full_name)');
    
    if (grade) query = query.eq('grade', grade);
    if (subject) query = query.eq('subject', subject);
    if (teacherId) query = query.eq('teacher_id', teacherId);
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ lessons: data });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create lesson (metadata only, file upload handled separately)
app.post('/api/lessons/create', async (req, res) => {
  try {
    const { 
      title, description, teacherId, subject,
      documentUrl, documentName, documentType, fileSize,
      domain_id, sub_domain_id, department_id, semester_id 
    } = req.body;
    
    const { data, error } = await supabase
      .from('lessons')
      .insert([{
        title,
        description,
        teacher_id: teacherId,
        subject,
        document_url: documentUrl,
        document_name: documentName,
        document_type: documentType,
        file_size: fileSize,
        domain_id,
        sub_domain_id,
        department_id,
        semester_id,
        is_permanent: true,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, lesson: data });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update lesson
app.put('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, grade, section } = req.body;
    
    const { data, error } = await supabase
      .from('lessons')
      .update({
        title,
        description,
        subject,
        grade,
        section,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, lesson: data });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete lesson
app.delete('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the lesson to extract file path
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('document_url')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from database
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Extract file path from URL if it's a storage URL
    let filePath = null;
    if (lesson?.document_url && lesson.document_url.includes('lesson-files')) {
      const urlParts = lesson.document_url.split('lesson-files/');
      if (urlParts.length > 1) {
        filePath = urlParts[1].split('?')[0]; // Remove query params
      }
    }
    
    res.json({ success: true, message: 'Lesson deleted successfully', filePath });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== SYSTEM CONFIGURATION ENDPOINTS ====================

// Get system configuration
app.get('/api/system/config', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_key', 'features')
      .single();
    
    if (error) throw error;
    
    res.json({ config: data });
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update system configuration
app.put('/api/system/config', async (req, res) => {
  try {
    const { features, userId } = req.body;
    
    const { data, error } = await supabase
      .from('system_config')
      .update({ 
        config_value: features,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', 'features')
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, config: data });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create backup
app.post('/api/system/backup', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Get all data from main tables
    const [profiles, lessons, domains, departments, subDomains, semesters] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('lessons').select('*'),
      supabase.from('domains').select('*'),
      supabase.from('departments').select('*'),
      supabase.from('sub_domains').select('*'),
      supabase.from('semesters').select('*'),
    ]);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        profiles: profiles.data || [],
        lessons: lessons.data || [],
        domains: domains.data || [],
        departments: departments.data || [],
        sub_domains: subDomains.data || [],
        semesters: semesters.data || [],
      }
    };
    
    // Calculate size
    const backupJson = JSON.stringify(backupData);
    const backupSize = new Blob([backupJson]).size;
    
    // Save backup record
    const { data: backup, error } = await supabase
      .from('system_backups')
      .insert([{
        backup_name: `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
        backup_size: backupSize,
        backup_url: null, // In production, upload to storage
        status: 'completed',
        created_by: userId,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      backup,
      downloadData: backupData // Send data for client-side download
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get backup history
app.get('/api/system/backups', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    res.json({ backups: data });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(400).json({ error: error.message });
  }
});

// Restore from backup (simplified - in production would restore from file)
app.post('/api/system/restore', async (req, res) => {
  try {
    const { backupData } = req.body;
    
    if (!backupData || !backupData.data) {
      throw new Error('Invalid backup data');
    }
    
    // Note: In production, you'd want to:
    // 1. Create a backup before restoring
    // 2. Use transactions
    // 3. Validate data integrity
    // 4. Handle foreign key constraints properly
    
    res.json({ 
      success: true, 
      message: 'Restore functionality requires manual implementation for safety'
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== LMS ENDPOINTS ====================

// Video Lessons
app.get('/api/lms/video-lessons', getVideoLessons);
app.post('/api/lms/video-lessons', createVideoLesson);
app.put('/api/lms/video-lessons/:id', updateVideoLesson);
app.delete('/api/lms/video-lessons/:id', deleteVideoLesson);

// Recorded Videos
app.get('/api/lms/recorded-videos', getRecordedVideos);
app.post('/api/lms/recorded-videos', createRecordedVideo);
app.put('/api/lms/recorded-videos/:id', updateRecordedVideo);
app.delete('/api/lms/recorded-videos/:id', deleteRecordedVideo);
app.post('/api/lms/recorded-videos/:videoId/track', trackVideoProgress);
app.get('/api/lms/watch-history/:studentId', getWatchHistory);

// Live Classes
app.get('/api/lms/live-classes', getLiveClasses);
app.post('/api/lms/live-classes', createLiveClass);
app.put('/api/lms/live-classes/:id/status', updateLiveClassStatus);
app.post('/api/lms/live-classes/:id/ping', sendAttendancePing);
app.delete('/api/lms/live-classes/:id', deleteLiveClass);

// Quizzes
app.get('/api/lms/quizzes', getQuizzes);
app.get('/api/lms/quizzes/:id', getQuizWithQuestions);
app.post('/api/lms/quizzes', createQuiz);
app.put('/api/lms/quizzes/:id', updateQuiz);
app.delete('/api/lms/quizzes/:id', deleteQuiz);

// Quiz Rankings
app.get('/api/lms/quizzes/:quizId/rankings', getQuizRankings);
app.get('/api/lms/quizzes/:quizId/rankings/:studentId', getStudentRank);
app.get('/api/lms/rankings/top-performers', getTopPerformers);
app.get('/api/lms/rankings/student/:studentId', getStudentRankingHistory);
app.post('/api/lms/quizzes/:quizId/recalculate-rankings', recalculateRankings);

// Student Tracking
app.post('/api/lms/lessons/:lessonId/track', trackLessonProgress);
app.post('/api/lms/live-classes/:classId/join', joinLiveClass);
app.put('/api/lms/live-attendance/:attendanceId/leave', leaveLiveClass);
app.post('/api/lms/pings/:pingId/respond', respondToPing);
app.post('/api/lms/quizzes/:quizId/submit', submitQuiz);

// Analytics
app.get('/api/lms/analytics/student/:studentId', getStudentAnalytics);
app.get('/api/lms/analytics/teacher/:teacherId', getTeacherAnalytics);

// Community
app.put('/api/community/posts/:id', updateCommunityPost);
app.delete('/api/community/posts/:id', deleteCommunityPost);
app.put('/api/community/replies/:id', updateCommunityReply);
app.delete('/api/community/replies/:id', deleteCommunityReply);

// ==================== AI TUTOR ENDPOINTS (OLLAMA) ====================

// AI Tutor chat endpoint
app.post('/api/ai-tutor/chat', async (req, res) => {
  try {
    const { message, model = 'deepseek-r1:1.5b' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[AI Tutor] Received message: "${message.substring(0, 50)}..." using model: ${model}`);

    // Call Ollama API running on localhost:11434
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      console.log(`[AI Tutor] Calling Ollama with model: ${model}`);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: message,
          stream: false,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI Tutor] HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Read the entire response as text first
      const text = await response.text();
      
      if (!text || text.trim().length === 0) {
        console.error('[AI Tutor] Empty response from Ollama');
        return res.status(500).json({ error: 'Empty response from Ollama' });
      }
      
      // Parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[AI Tutor] JSON parse failed');
        console.error('[AI Tutor] Response length:', text.length);
        console.error('[AI Tutor] First 500 chars:', text.substring(0, 500));
        console.error('[AI Tutor] Last 200 chars:', text.substring(Math.max(0, text.length - 200)));
        return res.status(500).json({ 
          error: 'Failed to parse Ollama response',
          details: `Response length: ${text.length}, Parse error: ${parseError.message}`
        });
      }
      
      // Extract response text
      const responseText = data.response || data.text || '';
      
      if (!responseText || responseText.trim().length === 0) {
        console.warn('[AI Tutor] Empty response text from model');
        return res.status(500).json({ error: 'Model returned empty response' });
      }
      
      console.log(`[AI Tutor] Success! Response length: ${responseText.length}`);
      res.json({ response: responseText });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('AI response timeout. Ollama may be overloaded or not responding.');
      }
      
      if (fetchError.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running on port 11434. Run: ollama serve');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error calling AI Tutor:', error);
    
    let errorMessage = error.message;
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Cannot connect')) {
      errorMessage = 'Ollama is not running. Start it with: ollama serve or use START_DEEPSEEK_OLLAMA.bat';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      hint: 'Make sure Ollama is running with: ollama serve'
    });
  }
});

// AI Tutor document analysis endpoint
app.post('/api/ai-tutor/analyze', async (req, res) => {
  try {
    const { fileName, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Document content is required' });
    }

    const analysisPrompt = `Analyze this document and provide:
1. Summary (2-3 sentences)
2. Key Points (3-5 bullet points)
3. Mistakes or Issues (if any)
4. Improvements (suggestions)
5. Related Concepts

Document: ${content.substring(0, 2000)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for analysis

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          prompt: analysisPrompt,
          stream: false,
          temperature: 0.5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json({ analysis: { content: data.response || 'Analysis could not be generated' } });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Analysis timeout. Document may be too large or Ollama is overloaded.');
      }
      
      if (fetchError.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running on port 11434.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error analyzing document:', error);
    
    let errorMessage = error.message;
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Cannot connect')) {
      errorMessage = 'Ollama is not running. Start it with: ollama serve';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      hint: 'Make sure Ollama is running'
    });
  }
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
