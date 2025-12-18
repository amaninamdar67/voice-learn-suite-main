// =====================================================
// PARENT & MENTOR API ROUTES
// Real-time data for parent and mentor modules
// =====================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// PARENT ROUTES
// =====================================================

// Get all children for a parent
async function getParentChildren(req, res) {
  try {
    const { parentUserId } = req.params;

    // Get all children linked to this parent (using profiles table)
    const { data: children, error } = await supabase
      .from('parent_children')
      .select(`
        id,
        relationship_type,
        is_primary_contact,
        linked_at,
        child:child_id (
          id,
          full_name,
          email,
          grade,
          section,
          avatar_url
        )
      `)
      .eq('parent_id', parentUserId)
      .order('is_primary_contact', { ascending: false });

    if (error) throw error;

    res.json({ success: true, children });
  } catch (error) {
    console.error('Error fetching parent children:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get comprehensive data for a specific child
async function getChildData(req, res) {
  try {
    const { studentId } = req.params;

    // Get student basic info from profiles table
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name, email, grade, section, avatar_url')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (studentError) throw studentError;

    // Get quiz results
    const { data: quizResults } = await supabase
      .from('lms_quiz_attempts')
      .select(`
        id,
        score,
        total_marks,
        percentage,
        time_taken_seconds,
        completed_at,
        lms_quizzes (title, subject)
      `)
      .eq('student_id', studentId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(20);

    // Get video lesson progress
    const { data: videoLessons } = await supabase
      .from('lms_video_tracking')
      .select(`
        id,
        watch_percentage,
        is_completed,
        last_watched_at,
        lms_video_lessons (title, subject, duration_minutes)
      `)
      .eq('student_id', studentId)
      .order('last_watched_at', { ascending: false })
      .limit(20);

    // Get live class attendance
    const { data: liveClasses } = await supabase
      .from('lms_live_attendance')
      .select(`
        id,
        joined_at,
        left_at,
        duration_seconds,
        lms_live_classes (title, subject, duration_minutes)
      `)
      .eq('student_id', studentId)
      .order('joined_at', { ascending: false })
      .limit(20);

    // Get assignment submissions
    const { data: assignments } = await supabase
      .from('assignment_submissions')
      .select(`
        id,
        status,
        marks_obtained,
        submitted_at,
        graded_at,
        assignments (title, subject, total_marks, due_date)
      `)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false })
      .limit(20);

    // Get quiz rankings
    const { data: rankings } = await supabase
      .from('lms_quiz_rankings')
      .select(`
        rank,
        score,
        percentage,
        lms_quizzes (title)
      `)
      .eq('student_id', studentId)
      .order('rank', { ascending: true })
      .limit(10);

    // Calculate statistics
    const quizAverage = quizResults && quizResults.length > 0
      ? quizResults.reduce((sum, q) => sum + q.percentage, 0) / quizResults.length
      : 0;

    const videoCompletionRate = videoLessons && videoLessons.length > 0
      ? (videoLessons.filter(v => v.is_completed).length / videoLessons.length) * 100
      : 0;

    const liveClassAttendance = liveClasses && liveClasses.length > 0
      ? liveClasses.length
      : 0;

    const assignmentsCompleted = assignments && assignments.length > 0
      ? assignments.filter(a => a.status === 'graded').length
      : 0;

    const totalPoints = (quizResults?.reduce((sum, q) => sum + q.score, 0) || 0) +
      (assignments?.reduce((sum, a) => sum + (a.marks_obtained || 0), 0) || 0);

    const stats = {
      quizAverage: Math.round(quizAverage),
      videoCompletionRate: Math.round(videoCompletionRate),
      liveClassAttendance,
      assignmentsCompleted,
      totalAssignments: assignments?.length || 0,
      totalPoints,
      totalQuizzes: quizResults?.length || 0,
      totalVideos: videoLessons?.length || 0,
    };

    res.json({
      success: true,
      student,
      quizResults: quizResults || [],
      videoLessons: videoLessons || [],
      liveClasses: liveClasses || [],
      assignments: assignments || [],
      rankings: rankings || [],
      stats,
    });
  } catch (error) {
    console.error('Error fetching child data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Link parent to student
async function linkParentToStudent(req, res) {
  try {
    const { parentId, studentId, relationshipType, isPrimaryContact } = req.body;

    const { data, error } = await supabase
      .from('parent_children')
      .insert({
        parent_id: parentId,
        child_id: studentId,
        relationship_type: relationshipType || 'parent',
        is_primary_contact: isPrimaryContact !== undefined ? isPrimaryContact : true,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error linking parent to student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Unlink parent from student
async function unlinkParentFromStudent(req, res) {
  try {
    const { linkId } = req.params;

    const { error } = await supabase
      .from('parent_children')
      .delete()
      .eq('id', linkId);

    if (error) throw error;

    res.json({ success: true, message: 'Parent-student link removed' });
  } catch (error) {
    console.error('Error unlinking parent from student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get parent notifications
async function getParentNotifications(req, res) {
  try {
    const { parentUserId } = req.params;

    const { data: notifications, error } = await supabase
      .from('parent_notifications')
      .select(`
        *,
        student:student_id (full_name)
      `)
      .eq('parent_id', parentUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching parent notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Mark notification as read
async function markNotificationRead(req, res) {
  try {
    const { notificationId } = req.params;

    const { error } = await supabase
      .from('parent_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// =====================================================
// MENTOR ROUTES
// =====================================================

// Get all students for a mentor
async function getMentorStudents(req, res) {
  try {
    const { mentorUserId } = req.params;

    // Get all students assigned to this mentor (using profiles table)
    const { data: students, error } = await supabase
      .from('mentor_students')
      .select(`
        id,
        assigned_at,
        is_active,
        mentoring_focus,
        meeting_frequency,
        student:mentee_id (
          id,
          full_name,
          email,
          grade,
          section,
          avatar_url
        )
      `)
      .eq('mentor_id', mentorUserId)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get comprehensive data for a mentee (same as getChildData but for mentors)
async function getMenteeData(req, res) {
  // Reuse the same logic as getChildData
  return getChildData(req, res);
}

// Link mentor to student
async function linkMentorToStudent(req, res) {
  try {
    const { mentorId, studentId, mentoringFocus, meetingFrequency } = req.body;

    const { data, error } = await supabase
      .from('mentor_students')
      .insert({
        mentor_id: mentorId,
        mentee_id: studentId,
        mentoring_focus: mentoringFocus,
        meeting_frequency: meetingFrequency,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error linking mentor to student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Unlink mentor from student
async function unlinkMentorFromStudent(req, res) {
  try {
    const { linkId } = req.params;

    const { error } = await supabase
      .from('mentor_students')
      .update({ is_active: false })
      .eq('id', linkId);

    if (error) throw error;

    res.json({ success: true, message: 'Mentor-student link deactivated' });
  } catch (error) {
    console.error('Error unlinking mentor from student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Add mentoring note
async function addMentoringNote(req, res) {
  try {
    const {
      mentorStudentId,
      mentorId,
      studentId,
      meetingDate,
      durationMinutes,
      topicsDiscussed,
      studentMood,
      progressNotes,
      actionItems,
      followUpRequired,
      followUpDate,
    } = req.body;

    const { data, error } = await supabase
      .from('mentoring_notes')
      .insert({
        mentor_student_id: mentorStudentId,
        mentor_id: mentorId,
        student_id: studentId,
        meeting_date: meetingDate,
        duration_minutes: durationMinutes,
        topics_discussed: topicsDiscussed,
        student_mood: studentMood,
        progress_notes: progressNotes,
        action_items: actionItems,
        follow_up_required: followUpRequired,
        follow_up_date: followUpDate,
      })
      .select()
      .single();

    if (error) throw error;

    // Update last meeting date in mentor_students
    await supabase
      .from('mentor_students')
      .update({ last_meeting_date: meetingDate })
      .eq('id', mentorStudentId);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error adding mentoring note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get mentoring notes for a student
async function getMentoringNotes(req, res) {
  try {
    const { studentId } = req.params;

    const { data: notes, error } = await supabase
      .from('mentoring_notes')
      .select(`
        *,
        mentors (full_name)
      `)
      .eq('student_id', studentId)
      .order('meeting_date', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, notes });
  } catch (error) {
    console.error('Error fetching mentoring notes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// =====================================================
// PARENT COMMUNITY ROUTES
// =====================================================

// Get child community posts and comments
async function getParentChildCommunity(req, res) {
  try {
    const { parentUserId } = req.params;

    // Get parent's children
    const { data: childLinks, error: linksError } = await supabase
      .from('parent_children')
      .select('child_id')
      .eq('parent_id', parentUserId);

    if (linksError) throw linksError;

    const childIds = childLinks?.map(link => link.child_id) || [];

    if (childIds.length === 0) {
      return res.json({ posts: [], comments: [] });
    }

    // Get posts from parent's children
    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select('id, user_id, title, content, subject, likes_count, replies_count, created_at')
      .in('user_id', childIds)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    // Get comments from parent's children
    const { data: comments, error: commentsError } = await supabase
      .from('community_replies')
      .select('id, user_id, post_id, content, likes_count, created_at')
      .in('user_id', childIds)
      .order('created_at', { ascending: false });

    if (commentsError) throw commentsError;

    // Get child names
    const { data: children, error: childrenError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', childIds);

    if (childrenError) throw childrenError;

    const childMap = new Map(children?.map(c => [c.id, c.full_name]) || []);

    // Get post titles for comments
    const postIds = comments?.map(c => c.post_id) || [];
    const { data: postTitles, error: postTitlesError } = await supabase
      .from('community_posts')
      .select('id, title, subject')
      .in('id', postIds);

    if (postTitlesError) throw postTitlesError;

    const postMap = new Map(postTitles?.map(p => [p.id, { title: p.title, subject: p.subject }]) || []);

    // Format posts
    const formattedPosts = posts?.map(post => ({
      ...post,
      child_name: childMap.get(post.user_id) || 'Unknown',
      child_id: post.user_id
    })) || [];

    // Format comments
    const formattedComments = comments?.map(comment => ({
      ...comment,
      child_name: childMap.get(comment.user_id) || 'Unknown',
      child_id: comment.user_id,
      post_title: postMap.get(comment.post_id)?.title || 'Unknown Post',
      post_subject: postMap.get(comment.post_id)?.subject || ''
    })) || [];

    res.json({ posts: formattedPosts, comments: formattedComments });
  } catch (error) {
    console.error('Error fetching child community data:', error);
    res.status(400).json({ error: error.message });
  }
}

// Like a post (parent)
async function likeParentPost(req, res) {
  try {
    const { postId } = req.params;
    const { userId, unlike } = req.body;

    if (unlike) {
      await supabase
        .from('community_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('community_likes')
        .insert({ post_id: postId, user_id: userId });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(400).json({ error: error.message });
  }
}

// Like a comment (parent)
async function likeParentComment(req, res) {
  try {
    const { commentId } = req.params;
    const { userId, unlike } = req.body;

    if (unlike) {
      await supabase
        .from('community_likes')
        .delete()
        .eq('reply_id', commentId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('community_likes')
        .insert({ reply_id: commentId, user_id: userId });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(400).json({ error: error.message });
  }
}

// Reply to a post (parent)
async function replyParentPost(req, res) {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data: reply, error } = await supabase
      .from('community_replies')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        is_anonymous: false
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, reply });
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(400).json({ error: error.message });
  }
}

// =====================================================
// EXPORT ROUTES
// =====================================================

export {
  // Parent routes
  getParentChildren,
  getChildData,
  linkParentToStudent,
  unlinkParentFromStudent,
  getParentNotifications,
  markNotificationRead,
  getParentChildCommunity,
  likeParentPost,
  likeParentComment,
  replyParentPost,
  
  // Mentor routes
  getMentorStudents,
  getMenteeData,
  linkMentorToStudent,
  unlinkMentorFromStudent,
  addMentoringNote,
  getMentoringNotes,
};
