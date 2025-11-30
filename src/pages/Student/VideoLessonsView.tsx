import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CustomVideoPlayer from '../../components/VideoPlayer/CustomVideoPlayer';
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
}

export default function VideoLessonsView() {
  const { user, profile } = useAuth();
  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [attendance, setAttendance] = useState<Record<string, LessonAttendance>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<VideoLesson | null>(null);
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    fetchLessons();
    fetchAttendance();
  }, [user, profile]);

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
        .select('lesson_id, watch_percentage, is_completed, last_watched_at')
        .eq('student_id', user?.id);

      if (error) throw error;

      const attendanceMap: Record<string, LessonAttendance> = {};
      data?.forEach(item => {
        attendanceMap[item.lesson_id] = {
          watch_percentage: item.watch_percentage,
          is_completed: item.is_completed,
          last_watched_at: item.last_watched_at,
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
          watch_percentage: percentage,
          is_completed: percentage >= 80,
          last_watched_at: new Date().toISOString(),
        }
      }));
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  };

  const subjects = ['all', ...new Set(lessons.map(l => l.subject).filter(Boolean))];
  const filteredLessons = filterSubject === 'all' 
    ? lessons 
    : lessons.filter(l => l.subject === filterSubject);

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
        <h1 className="text-3xl font-bold text-gray-900">Video Lessons</h1>
        <p className="text-gray-600 mt-1">Watch curriculum lessons and track your progress</p>
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

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject === 'all' ? 'All Subjects' : subject}
            </option>
          ))}
        </select>
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

              <div className="flex flex-wrap gap-2">
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

              <div className="mt-3 text-sm text-gray-600">
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
