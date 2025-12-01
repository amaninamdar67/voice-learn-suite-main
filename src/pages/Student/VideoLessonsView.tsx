import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CustomVideoPlayer from '../../components/VideoPlayer/CustomVideoPlayer';
import PageCommentBox from '../../components/CommentBox/PageCommentBox';
import { BookOpen, Play, CheckCircle, X, Award } from 'lucide-react';

interface VideoLesson {
  id: string;
  title: string;
  description: string;
  youtube_video_id: string;
  subject: string;
  grade: string;
  section: string;
  profiles: {
    full_name: string;
  };
}

interface LessonAttendance {
  watch_percentage: number;
  is_completed: boolean;
  last_watched_at: string;
  manual_status?: 'todo' | 'in-progress' | 'completed' | null;
}

export default function VideoLessonsView() {
  const { user, profile } = useAuth();
  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [attendance, setAttendance] = useState<Record<string, LessonAttendance>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<VideoLesson | null>(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterProgress, setFilterProgress] = useState('all');

  useEffect(() => {
    fetchLessons();
    fetchAttendance();
  }, [user]);

  const fetchLessons = async () => {
    try {
      console.log('Fetching video lessons for student...');
      console.log('User ID:', user?.id);
      console.log('Profile:', profile);
      
      const { data, error } = await supabase
        .from('video_lessons')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Video lessons response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Fetch teacher names separately
      if (data && data.length > 0) {
        const teacherIds = [...new Set(data.map(l => l.teacher_id))];
        const { data: teachers } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', teacherIds);
        
        const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]) || []);
        const lessonsWithTeachers = data.map(lesson => ({
          ...lesson,
          profiles: { full_name: teacherMap.get(lesson.teacher_id) || 'Unknown' }
        }));
        
        console.log('Setting lessons:', lessonsWithTeachers);
        setLessons(lessonsWithTeachers);
      } else {
        setLessons([]);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_attendance')
        .select('lesson_id, watch_percentage, is_completed, last_watched_at, manual_status')
        .eq('student_id', user?.id);

      if (error) throw error;

      const attendanceMap: Record<string, LessonAttendance> = {};
      data?.forEach(item => {
        attendanceMap[item.lesson_id] = {
          watch_percentage: item.watch_percentage,
          is_completed: item.is_completed,
          last_watched_at: item.last_watched_at,
          manual_status: item.manual_status,
        };
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleProgress = async (lessonId: string, seconds: number, percentage: number) => {
    try {
      await supabase
        .from('lesson_attendance')
        .upsert({
          student_id: user?.id,
          lesson_id: lessonId,
          watch_duration_seconds: Math.floor(seconds),
          watch_percentage: percentage,
          is_completed: percentage >= 80,
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,lesson_id'
        });

      // Update local state
      setAttendance(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          watch_percentage: percentage,
          is_completed: percentage >= 80,
          last_watched_at: new Date().toISOString(),
        }
      }));
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  };

  const handleManualStatusChange = async (lessonId: string, status: 'todo' | 'in-progress' | 'completed') => {
    try {
      // Upsert the manual status
      await supabase
        .from('lesson_attendance')
        .upsert({
          student_id: user?.id,
          lesson_id: lessonId,
          manual_status: status,
          watch_percentage: attendance[lessonId]?.watch_percentage || 0,
          watch_duration_seconds: 0,
          is_completed: status === 'completed',
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,lesson_id'
        });

      // Update local state
      setAttendance(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          manual_status: status,
          is_completed: status === 'completed',
          watch_percentage: prev[lessonId]?.watch_percentage || 0,
          last_watched_at: new Date().toISOString(),
        }
      }));
    } catch (error) {
      console.error('Error updating manual status:', error);
    }
  };

  const subjects = ['all', ...new Set(lessons.map(l => l.subject).filter(Boolean))];
  
  const getProgressStatus = (lessonId: string): 'todo' | 'in-progress' | 'completed' => {
    const progress = attendance[lessonId];
    
    // Use manual status if set
    if (progress?.manual_status) {
      return progress.manual_status;
    }
    
    // Otherwise use automatic tracking
    if (progress?.is_completed) return 'completed';
    if (progress?.watch_percentage > 0) return 'in-progress';
    return 'todo';
  };

  const filteredLessons = lessons.filter(lesson => {
    // Filter by subject
    if (filterSubject !== 'all' && lesson.subject !== filterSubject) return false;
    
    // Filter by progress
    if (filterProgress !== 'all') {
      const status = getProgressStatus(lesson.id);
      if (filterProgress !== status) return false;
    }
    
    return true;
  });

  const completedCount = Object.values(attendance).filter(a => a.is_completed).length;
  const inProgressCount = Object.values(attendance).filter(a => !a.is_completed && a.watch_percentage > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Library</h1>
            <p className="text-gray-600 mt-1">Browse curriculum courses and track your progress</p>
          </div>
          <PageCommentBox pageName="Course Library" category="courses" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Play size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Courses' : subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
            <select
              value={filterProgress}
              onChange={(e) => setFilterProgress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="todo">📋 To-Do</option>
              <option value="in-progress">⏳ In-Progress</option>
              <option value="completed">✓ Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => setSelectedLesson(lesson)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-video bg-gray-900">
              <img
                src={`https://img.youtube.com/vi/${lesson.youtube_video_id}/mqdefault.jpg`}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <Play size={32} className="text-blue-600 ml-1" fill="currentColor" />
                </div>
              </div>
              {attendance[lesson.id]?.is_completed && (
                <div className="absolute top-2 left-2">
                  <div className="px-3 py-1 bg-green-500 text-white text-sm rounded-full flex items-center gap-1 font-medium">
                    <CheckCircle size={14} />
                    Completed
                  </div>
                </div>
              )}
              {attendance[lesson.id] && !attendance[lesson.id].is_completed && attendance[lesson.id].watch_percentage > 0 && (
                <div className="absolute top-2 left-2">
                  <div className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full font-medium">
                    {Math.round(attendance[lesson.id].watch_percentage)}% watched
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{lesson.title}</h3>
              {lesson.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
              )}

              {attendance[lesson.id] && attendance[lesson.id].watch_percentage > 0 && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        attendance[lesson.id].is_completed ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${attendance[lesson.id].watch_percentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {lesson.subject && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {lesson.subject}
                  </span>
                )}
                {lesson.grade && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Grade {lesson.grade}
                  </span>
                )}
                {lesson.section && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    Section {lesson.section}
                  </span>
                )}
              </div>

              {/* Progress Dropdown */}
              <div className="mb-3">
                <select
                  value={getProgressStatus(lesson.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleManualStatusChange(lesson.id, e.target.value as 'todo' | 'in-progress' | 'completed');
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-2 cursor-pointer transition-all ${
                    getProgressStatus(lesson.id) === 'completed'
                      ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                      : getProgressStatus(lesson.id) === 'in-progress'
                      ? 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <option value="todo">📋 To-Do</option>
                  <option value="in-progress">⏳ In Progress</option>
                  <option value="completed">✓ Completed</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                By {lesson.profiles.full_name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons available</h3>
          <p className="text-gray-600">Check back later for new content</p>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 pt-16">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                <p className="text-gray-600 mt-1">By {selectedLesson.profiles.full_name}</p>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <CustomVideoPlayer
                videoId={selectedLesson.youtube_video_id}
                title={selectedLesson.title}
                onProgress={(seconds, percentage) => handleProgress(selectedLesson.id, seconds, percentage)}
                onComplete={() => handleProgress(selectedLesson.id, 0, 100)}
                isLive={false}
              />

              {/* Progress Tracker */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Attendance Progress</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {attendance[selectedLesson.id] ? Math.round(attendance[selectedLesson.id].watch_percentage) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      attendance[selectedLesson.id]?.is_completed ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ 
                      width: `${attendance[selectedLesson.id]?.watch_percentage || 0}%` 
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-600">
                    Watch at least 80% to mark attendance
                  </p>
                  {attendance[selectedLesson.id]?.is_completed && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <Award size={16} />
                      Attendance Marked!
                    </div>
                  )}
                </div>
              </div>

              {selectedLesson.description && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">About this lesson</h3>
                  <p className="text-gray-600">{selectedLesson.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {selectedLesson.subject && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {selectedLesson.subject}
                  </span>
                )}
                {selectedLesson.grade && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    Grade {selectedLesson.grade}
                  </span>
                )}
                {selectedLesson.section && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    Section {selectedLesson.section}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
