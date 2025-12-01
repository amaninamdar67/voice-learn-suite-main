import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Video, FileText, Trophy, Clock, CheckCircle, 
  TrendingUp, Award, Target 
} from 'lucide-react';

interface DashboardStats {
  videosWatched: number;
  quizzesTaken: number;
  assignmentsSubmitted: number;
  overallProgress: number;
  completedVideos: number;
  totalVideos: number;
  thisWeekLessons: number;
  thisWeekQuizzes: number;
  averageQuizScore: number;
}

interface RecentActivity {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'assignment';
  completed: boolean;
  date: string;
  score?: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    videosWatched: 0,
    quizzesTaken: 0,
    assignmentsSubmitted: 0,
    overallProgress: 0,
    completedVideos: 0,
    totalVideos: 0,
    thisWeekLessons: 0,
    thisWeekQuizzes: 0,
    averageQuizScore: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch video watch history
      const { data: videoHistory, count: videosWatchedCount } = await supabase
        .from('video_watch_history')
        .select('*, video_lessons(title)', { count: 'exact' })
        .eq('student_id', user?.id)
        .order('last_watched_at', { ascending: false })
        .limit(5);

      // Count completed videos
      const { count: completedCount } = await supabase
        .from('video_watch_history')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user?.id)
        .eq('is_completed', true);

      // Get total available videos
      const { count: totalVideosCount } = await supabase
        .from('video_lessons')
        .select('*', { count: 'exact', head: true });

      // Fetch quiz attempts
      const { data: quizAttempts, count: quizCount } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, total_marks)', { count: 'exact' })
        .eq('student_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(5);

      // Fetch assignment submissions
      const { count: assignmentCount } = await supabase
        .from('assignment_submissions')
        .select('*, assignments(title)', { count: 'exact' })
        .eq('student_id', user?.id);

      // Calculate this week's activity
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count: thisWeekVideos } = await supabase
        .from('video_watch_history')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user?.id)
        .gte('last_watched_at', oneWeekAgo.toISOString());

      const { data: thisWeekQuizData } = await supabase
        .from('quiz_attempts')
        .select('score, total_marks')
        .eq('student_id', user?.id)
        .gte('submitted_at', oneWeekAgo.toISOString());

      // Calculate average quiz score
      const avgScore = quizAttempts && quizAttempts.length > 0
        ? quizAttempts.reduce((sum, attempt) => {
            const percentage = (attempt.score / attempt.total_marks) * 100;
            return sum + percentage;
          }, 0) / quizAttempts.length
        : 0;

      // Calculate overall progress
      const progress = totalVideosCount && totalVideosCount > 0
        ? ((completedCount || 0) / totalVideosCount) * 100
        : 0;

      // Format recent activity
      const activities: RecentActivity[] = [];
      
      videoHistory?.slice(0, 3).forEach(vh => {
        activities.push({
          id: vh.id,
          title: vh.video_lessons?.title || 'Video Lesson',
          type: 'video',
          completed: vh.is_completed,
          date: vh.last_watched_at,
        });
      });

      quizAttempts?.slice(0, 2).forEach(qa => {
        activities.push({
          id: qa.id,
          title: qa.quizzes?.title || 'Quiz',
          type: 'quiz',
          completed: true,
          date: qa.submitted_at,
          score: Math.round((qa.score / qa.total_marks) * 100),
        });
      });

      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setStats({
        videosWatched: videosWatchedCount || 0,
        quizzesTaken: quizCount || 0,
        assignmentsSubmitted: assignmentCount || 0,
        overallProgress: Math.round(progress),
        completedVideos: completedCount || 0,
        totalVideos: totalVideosCount || 0,
        thisWeekLessons: thisWeekVideos || 0,
        thisWeekQuizzes: thisWeekQuizData?.length || 0,
        averageQuizScore: Math.round(avgScore),
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your progress and continue learning</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/student/video-lessons')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Video size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{stats.videosWatched}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{stats.completedVideos}/{stats.totalVideos}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/student/quizzes')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.quizzesTaken}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Avg Score</span>
              <span>{stats.averageQuizScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  stats.averageQuizScore >= 80 ? 'bg-green-600' :
                  stats.averageQuizScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${stats.averageQuizScore}%` }}
              />
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/projects')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BookOpen size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assignmentsSubmitted}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">Submitted</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm opacity-90">Overall Progress</p>
              <p className="text-3xl font-bold">{stats.overallProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Learning</h2>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500 mt-1">Start learning to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {activity.type === 'video' && <Video size={20} className="text-blue-600" />}
                    {activity.type === 'quiz' && <FileText size={20} className="text-green-600" />}
                    {activity.type === 'assignment' && <BookOpen size={20} className="text-orange-600" />}
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    {activity.completed ? (
                      activity.score !== undefined ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                          {activity.score}%
                        </span>
                      ) : (
                        <CheckCircle size={20} className="text-green-600" />
                      )
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Your Progress</h2>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${stats.overallProgress}%` }}
                />
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overallProgress}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">This Week</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lessons completed</span>
                  <span className="font-semibold text-gray-900">{stats.thisWeekLessons}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Quizzes passed</span>
                  <span className="font-semibold text-gray-900">{stats.thisWeekQuizzes}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => navigate('/leaderboard')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <Award size={20} />
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
