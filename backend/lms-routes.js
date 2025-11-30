// ============================================
// LMS API Routes - Video Lessons, Live Classes, Quizzes
// ============================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (will be passed from server.js)
let supabase;

export const initializeLMSRoutes = (supabaseClient) => {
  supabase = supabaseClient;
};

// ==================== VIDEO LESSONS ENDPOINTS ====================

// Get all video lessons (filtered by role)
export const getVideoLessons = async (req, res) => {
  try {
    const { grade, subject, teacherId } = req.query;
    
    let query = supabase
      .from('video_lessons')
      .select('*, profiles!video_lessons_teacher_id_fkey(full_name)');
    
    if (grade) query = query.eq('grade', grade);
    if (subject) query = query.eq('subject', subject);
    if (teacherId) query = query.eq('teacher_id', teacherId);
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ lessons: data });
  } catch (error) {
    console.error('Error fetching video lessons:', error);
    res.status(400).json({ error: error.message });
  }
};

// Create video lesson
export const createVideoLesson = async (req, res) => {
  try {
    const { 
      title, description, teacherId, youtubeUrl, 
      subject, grade, section, durationSeconds 
    } = req.body;
    
    // Extract YouTube video ID from URL
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    const { data, error } = await supabase
      .from('video_lessons')
      .insert([{
        title,
        description,
        teacher_id: teacherId,
        youtube_url: youtubeUrl,
        youtube_video_id: videoId,
        subject,
        grade,
        section,
        duration_seconds: durationSeconds,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, lesson: data });
  } catch (error) {
    console.error('Error creating video lesson:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update video lesson
export const updateVideoLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, youtubeUrl, subject, grade, section } = req.body;
    
    const updateData = {
      title,
      description,
      subject,
      grade,
      section,
      updated_at: new Date().toISOString(),
    };
    
    // If YouTube URL changed, extract new video ID
    if (youtubeUrl) {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      updateData.youtube_url = youtubeUrl;
      updateData.youtube_video_id = videoId;
    }
    
    const { data, error } = await supabase
      .from('video_lessons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, lesson: data });
  } catch (error) {
    console.error('Error updating video lesson:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete video lesson
export const deleteVideoLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('video_lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Video lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting video lesson:', error);
    res.status(400).json({ error: error.message });
  }
};

// ==================== LIVE CLASSES ENDPOINTS ====================

// Get all live classes
export const getLiveClasses = async (req, res) => {
  try {
    const { grade, subject, teacherId, status } = req.query;
    
    let query = supabase
      .from('live_classes')
      .select('*, profiles!live_classes_teacher_id_fkey(full_name)');
    
    if (grade) query = query.eq('grade', grade);
    if (subject) query = query.eq('subject', subject);
    if (teacherId) query = query.eq('teacher_id', teacherId);
    if (status) query = query.eq('status', status);
    
    query = query.order('start_time', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ liveClasses: data });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(400).json({ error: error.message });
  }
};

// Create live class
export const createLiveClass = async (req, res) => {
  try {
    const { 
      sessionTitle, description, teacherId, streamUrl,
      startTime, endTime, subject, grade, section 
    } = req.body;
    
    const { data, error } = await supabase
      .from('live_classes')
      .insert([{
        session_title: sessionTitle,
        description,
        teacher_id: teacherId,
        stream_url: streamUrl,
        start_time: startTime,
        end_time: endTime,
        subject,
        grade,
        section,
        status: 'upcoming',
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, liveClass: data });
  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update live class status
export const updateLiveClassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('live_classes')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, liveClass: data });
  } catch (error) {
    console.error('Error updating live class status:', error);
    res.status(400).json({ error: error.message });
  }
};

// Send attendance ping
export const sendAttendancePing = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;
    
    const pingSentAt = new Date();
    const pingExpiresAt = new Date(pingSentAt.getTime() + 60000); // 60 seconds
    
    const { data, error } = await supabase
      .from('live_attendance_pings')
      .insert([{
        live_class_id: id,
        teacher_id: teacherId,
        ping_sent_at: pingSentAt.toISOString(),
        ping_expires_at: pingExpiresAt.toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // In production, broadcast this ping via WebSocket/SSE to all connected students
    
    res.json({ success: true, ping: data });
  } catch (error) {
    console.error('Error sending attendance ping:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete live class
export const deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('live_classes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Live class deleted successfully' });
  } catch (error) {
    console.error('Error deleting live class:', error);
    res.status(400).json({ error: error.message });
  }
};

// ==================== QUIZZES ENDPOINTS ====================

// Get all quizzes
export const getQuizzes = async (req, res) => {
  try {
    const { grade, subject, teacherId, isActive } = req.query;
    
    let query = supabase
      .from('quizzes')
      .select('*, profiles!quizzes_teacher_id_fkey(full_name)');
    
    if (grade) query = query.eq('grade', grade);
    if (subject) query = query.eq('subject', subject);
    if (teacherId) query = query.eq('teacher_id', teacherId);
    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ quizzes: data });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get quiz with questions
export const getQuizWithQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*, profiles!quizzes_teacher_id_fkey(full_name)')
      .eq('id', id)
      .single();
    
    if (quizError) throw quizError;
    
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', id)
      .order('question_order', { ascending: true });
    
    if (questionsError) throw questionsError;
    
    res.json({ quiz: { ...quiz, questions } });
  } catch (error) {
    console.error('Error fetching quiz with questions:', error);
    res.status(400).json({ error: error.message });
  }
};

// Create quiz with questions
export const createQuiz = async (req, res) => {
  try {
    const { 
      title, description, teacherId, subject, grade, section,
      durationMinutes, questions 
    } = req.body;
    
    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    
    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        title,
        description,
        teacher_id: teacherId,
        subject,
        grade,
        section,
        total_marks: totalMarks,
        duration_minutes: durationMinutes,
        is_active: true,
      }])
      .select()
      .single();
    
    if (quizError) throw quizError;
    
    // Create questions
    const questionsWithQuizId = questions.map((q, index) => ({
      quiz_id: quiz.id,
      question_text: q.questionText,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_answer: q.correctAnswer,
      marks: q.marks || 1,
      question_order: index + 1,
    }));
    
    const { data: createdQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsWithQuizId)
      .select();
    
    if (questionsError) throw questionsError;
    
    res.json({ 
      success: true, 
      quiz: { ...quiz, questions: createdQuestions } 
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, grade, section, isActive } = req.body;
    
    const { data, error } = await supabase
      .from('quizzes')
      .update({
        title,
        description,
        subject,
        grade,
        section,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, quiz: data });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Questions will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(400).json({ error: error.message });
  }
};

// ==================== STUDENT TRACKING ENDPOINTS ====================

// Track lesson watch progress
export const trackLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { studentId, watchDuration, watchPercentage } = req.body;
    
    const isCompleted = watchPercentage >= 80;
    
    const { data, error } = await supabase
      .from('lesson_attendance')
      .upsert({
        student_id: studentId,
        lesson_id: lessonId,
        watch_duration_seconds: watchDuration,
        watch_percentage: watchPercentage,
        is_completed: isCompleted,
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'student_id,lesson_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, attendance: data });
  } catch (error) {
    console.error('Error tracking lesson progress:', error);
    res.status(400).json({ error: error.message });
  }
};

// Join live class
export const joinLiveClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    
    const { data, error } = await supabase
      .from('live_attendance')
      .insert([{
        student_id: studentId,
        live_class_id: classId,
        joined_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, attendance: data });
  } catch (error) {
    console.error('Error joining live class:', error);
    res.status(400).json({ error: error.message });
  }
};

// Leave live class
export const leaveLiveClass = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    
    // Get the attendance record to calculate duration
    const { data: attendance, error: fetchError } = await supabase
      .from('live_attendance')
      .select('joined_at')
      .eq('id', attendanceId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const leftAt = new Date();
    const joinedAt = new Date(attendance.joined_at);
    const durationSeconds = Math.floor((leftAt - joinedAt) / 1000);
    
    const { data, error } = await supabase
      .from('live_attendance')
      .update({
        left_at: leftAt.toISOString(),
        duration_seconds: durationSeconds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attendanceId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, attendance: data });
  } catch (error) {
    console.error('Error leaving live class:', error);
    res.status(400).json({ error: error.message });
  }
};

// Respond to attendance ping
export const respondToPing = async (req, res) => {
  try {
    const { pingId } = req.params;
    const { studentId, deviceInfo } = req.body;
    
    const respondedAt = new Date();
    
    // Get ping to check if it's expired
    const { data: ping, error: pingError } = await supabase
      .from('live_attendance_pings')
      .select('ping_sent_at, ping_expires_at')
      .eq('id', pingId)
      .single();
    
    if (pingError) throw pingError;
    
    const pingSentAt = new Date(ping.ping_sent_at);
    const pingExpiresAt = new Date(ping.ping_expires_at);
    const responseTimeSeconds = Math.floor((respondedAt - pingSentAt) / 1000);
    const isPresent = respondedAt <= pingExpiresAt;
    
    const { data, error } = await supabase
      .from('live_ping_responses')
      .upsert({
        ping_id: pingId,
        student_id: studentId,
        responded_at: respondedAt.toISOString(),
        response_time_seconds: responseTimeSeconds,
        is_present: isPresent,
        device_info: deviceInfo,
      }, {
        onConflict: 'ping_id,student_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, response: data, isPresent });
  } catch (error) {
    console.error('Error responding to ping:', error);
    res.status(400).json({ error: error.message });
  }
};

// Submit quiz
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { studentId, answers, timeTaken } = req.body;
    
    // Get quiz and questions
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('total_marks')
      .eq('id', quizId)
      .single();
    
    if (quizError) throw quizError;
    
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId);
    
    if (questionsError) throw questionsError;
    
    // Calculate score
    let score = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        score += question.marks;
      }
    });
    
    const percentage = (score / quiz.total_marks) * 100;
    
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([{
        student_id: studentId,
        quiz_id: quizId,
        score,
        total_marks: quiz.total_marks,
        percentage,
        time_taken_seconds: timeTaken,
        answers,
        is_completed: true,
        completed_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, result: data });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(400).json({ error: error.message });
  }
};

// ==================== ANALYTICS ENDPOINTS ====================

// Get student analytics (for parents/mentors)
export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Lesson analytics
    const { data: lessonAttendance } = await supabase
      .from('lesson_attendance')
      .select('*, video_lessons(title, subject)')
      .eq('student_id', studentId);
    
    // Live class analytics
    const { data: liveAttendance } = await supabase
      .from('live_attendance')
      .select('*, live_classes(session_title, subject)')
      .eq('student_id', studentId);
    
    // Ping responses
    const { data: pingResponses } = await supabase
      .from('live_ping_responses')
      .select('*, live_attendance_pings(live_class_id)')
      .eq('student_id', studentId);
    
    // Quiz results
    const { data: quizResults } = await supabase
      .from('quiz_results')
      .select('*, quizzes(title, subject)')
      .eq('student_id', studentId)
      .eq('is_completed', true);
    
    // Calculate metrics
    const totalLessons = lessonAttendance?.length || 0;
    const completedLessons = lessonAttendance?.filter(l => l.is_completed).length || 0;
    const avgWatchPercentage = totalLessons > 0 
      ? lessonAttendance.reduce((sum, l) => sum + parseFloat(l.watch_percentage), 0) / totalLessons 
      : 0;
    
    const totalPings = pingResponses?.length || 0;
    const presentPings = pingResponses?.filter(p => p.is_present).length || 0;
    const focusScore = totalPings > 0 ? (presentPings / totalPings) * 100 : 0;
    
    const avgQuizScore = quizResults?.length > 0
      ? quizResults.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / quizResults.length
      : 0;
    
    res.json({
      lessonAnalytics: {
        total: totalLessons,
        completed: completedLessons,
        avgWatchPercentage: avgWatchPercentage.toFixed(2),
        details: lessonAttendance,
      },
      liveClassAnalytics: {
        total: liveAttendance?.length || 0,
        totalPings,
        presentPings,
        focusScore: focusScore.toFixed(2),
        details: liveAttendance,
      },
      quizAnalytics: {
        total: quizResults?.length || 0,
        avgScore: avgQuizScore.toFixed(2),
        details: quizResults,
      },
    });
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get teacher analytics (for admin)
export const getTeacherAnalytics = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const { data: videoLessons } = await supabase
      .from('video_lessons')
      .select('*')
      .eq('teacher_id', teacherId);
    
    const { data: liveClasses } = await supabase
      .from('live_classes')
      .select('*')
      .eq('teacher_id', teacherId);
    
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('*')
      .eq('teacher_id', teacherId);
    
    res.json({
      videoLessons: videoLessons?.length || 0,
      liveClasses: liveClasses?.length || 0,
      quizzes: quizzes?.length || 0,
      details: {
        videoLessons,
        liveClasses,
        quizzes,
      },
    });
  } catch (error) {
    console.error('Error fetching teacher analytics:', error);
    res.status(400).json({ error: error.message });
  }
};

// ==================== RECORDED VIDEOS ENDPOINTS ====================

// Get all recorded videos
export const getRecordedVideos = async (req, res) => {
  try {
    const { category, subject, grade, difficulty, teacherId, featured } = req.query;
    
    let query = supabase
      .from('recorded_videos')
      .select('*, profiles!recorded_videos_teacher_id_fkey(full_name)');
    
    if (category) query = query.eq('category', category);
    if (subject) query = query.eq('subject', subject);
    if (grade) query = query.eq('grade', grade);
    if (difficulty) query = query.eq('difficulty_level', difficulty);
    if (teacherId) query = query.eq('teacher_id', teacherId);
    if (featured === 'true') query = query.eq('is_featured', true);
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ videos: data });
  } catch (error) {
    console.error('Error fetching recorded videos:', error);
    res.status(400).json({ error: error.message });
  }
};

// Create recorded video
export const createRecordedVideo = async (req, res) => {
  try {
    const { 
      title, description, teacherId, youtubeUrl, category,
      subject, topic, difficultyLevel, grade, durationSeconds, isFeatured
    } = req.body;
    
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    const { data, error } = await supabase
      .from('recorded_videos')
      .insert([{
        title,
        description,
        teacher_id: teacherId,
        youtube_url: youtubeUrl,
        youtube_video_id: videoId,
        category,
        subject,
        topic,
        difficulty_level: difficultyLevel,
        grade,
        duration_seconds: durationSeconds,
        is_featured: isFeatured || false,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, video: data });
  } catch (error) {
    console.error('Error creating recorded video:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update recorded video
export const updateRecordedVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, youtubeUrl, category, subject, 
      topic, difficultyLevel, grade, isFeatured 
    } = req.body;
    
    const updateData = {
      title,
      description,
      category,
      subject,
      topic,
      difficulty_level: difficultyLevel,
      grade,
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    };
    
    if (youtubeUrl) {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      updateData.youtube_url = youtubeUrl;
      updateData.youtube_video_id = videoId;
    }
    
    const { data, error } = await supabase
      .from('recorded_videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, video: data });
  } catch (error) {
    console.error('Error updating recorded video:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete recorded video
export const deleteRecordedVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('recorded_videos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Recorded video deleted successfully' });
  } catch (error) {
    console.error('Error deleting recorded video:', error);
    res.status(400).json({ error: error.message });
  }
};

// Track video watch progress
export const trackVideoProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { studentId, watchDuration, watchPercentage } = req.body;
    
    const isCompleted = watchPercentage >= 80;
    
    const { data, error } = await supabase
      .from('video_watch_history')
      .upsert({
        student_id: studentId,
        video_id: videoId,
        watch_duration_seconds: watchDuration,
        watch_percentage: watchPercentage,
        is_completed: isCompleted,
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'student_id,video_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, watchHistory: data });
  } catch (error) {
    console.error('Error tracking video progress:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get student's watch history
export const getWatchHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const { data, error } = await supabase
      .from('video_watch_history')
      .select('*, recorded_videos(title, subject, category)')
      .eq('student_id', studentId)
      .order('last_watched_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ watchHistory: data });
  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.status(400).json({ error: error.message });
  }
};

// ==================== QUIZ RANKINGS ENDPOINTS ====================

// Get quiz rankings
export const getQuizRankings = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { limit } = req.query;
    
    let query = supabase
      .from('quiz_rankings')
      .select('*, profiles!quiz_rankings_student_id_fkey(full_name, grade)')
      .eq('quiz_id', quizId)
      .order('rank', { ascending: true });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ rankings: data });
  } catch (error) {
    console.error('Error fetching quiz rankings:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get student's rank for a quiz
export const getStudentRank = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;
    
    const { data: rank, error: rankError } = await supabase
      .from('quiz_rankings')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('student_id', studentId)
      .single();
    
    if (rankError && rankError.code !== 'PGRST116') throw rankError;
    
    // Get total participants
    const { count, error: countError } = await supabase
      .from('quiz_rankings')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);
    
    if (countError) throw countError;
    
    const percentile = rank && count ? ((count - rank.rank + 1) / count) * 100 : null;
    
    res.json({ 
      rank: rank || null, 
      totalParticipants: count || 0,
      percentile: percentile ? percentile.toFixed(1) : null
    });
  } catch (error) {
    console.error('Error fetching student rank:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get top performers across all quizzes
export const getTopPerformers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const { data, error } = await supabase
      .from('top_quiz_performers')
      .select('*')
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json({ topPerformers: data });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get student's ranking history
export const getStudentRankingHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const { data, error } = await supabase
      .from('quiz_rankings')
      .select('*, quizzes(title, subject)')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ rankingHistory: data });
  } catch (error) {
    console.error('Error fetching ranking history:', error);
    res.status(400).json({ error: error.message });
  }
};

// Manually recalculate rankings for a quiz (admin/teacher)
export const recalculateRankings = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const { error } = await supabase.rpc('update_quiz_rankings', {
      p_quiz_id: quizId
    });
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Rankings recalculated successfully' });
  } catch (error) {
    console.error('Error recalculating rankings:', error);
    res.status(400).json({ error: error.message });
  }
};

// ==================== HELPER FUNCTIONS ====================

function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}
