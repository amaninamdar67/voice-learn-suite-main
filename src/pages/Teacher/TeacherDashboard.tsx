import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Video, FileText, BookOpen, Clock, CheckCircle, 
  TrendingUp, AlertCircle, Award 
} from 'lucide-react';

interface TeacherStats {
  totalVideos: number;
  totalQuizzes: number;
  totalAssignments: number;
  pendingSubmissions: number;
  recentSubmissions: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TeacherStats>({
    totalVideos: 0,
    totalQuizzes: 0,
    totalAssignments: 0,
    pendingSubmissions: 0,
    recentSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Count uploaded videos
      const { count: videosCount } = await supabase
        .from('recorded_videos')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user?.id);

      // Count created quizzes
      const { count: quizzesCount } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user?.id);

      // Count assignments
      const { count: assignmentsCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user?.id);

      // Count pending submissions (not graded)
      const { data: assignmentIds } = await supabase
        .from('assignments')
        .select('id')
        .eq('teacher_id', user?.id);

      const ids = assignmentIds?.map(a => a.id) || [];
      
      let pendingCount = 0;
      let recentCount = 0;

      // Only query if there are assignments
      if (ids.length > 0) {
        const { count: pendingResult } = await supabase
          .from('assignment_submissions')
          .select('*', { count: 'exact', head: true })
          .in('assignment_id', ids)
          .neq('status', 'graded');
        
        pendingCount = pendingResult || 0;

        // Recent submissions (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count: recentResult } = await supabase
          .from('assignment_submissions')
          .select('*', { count: 'exact', head: true })
          .in('assignment_id', ids)
          .gte('submitted_at', oneWeekAgo.toISOString());
        
        recentCount = recentResult || 0;
      }

      // Get quiz submissions for this teacher (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: quizIds } = await supabase
        .from('quizzes')
        .select('id')
        .eq('teacher_id', user?.id);

      const quizIdList = quizIds?.map(q => q.id) || [];

      if (quizIdList.length > 0) {
        const { count: quizRecentResult } = await supabase
          .from('quiz_results')
          .select('*', { count: 'exact', head: true })
          .in('quiz_id', quizIdList)
          .gte('completed_at', oneWeekAgo.toISOString());
        
        recentCount = (recentCount || 0) + (quizRecentResult || 0);
      }

      setStats({
        totalVideos: videosCount || 0,
        totalQuizzes: quizzesCount || 0,
        totalAssignments: assignmentsCount || 0,
        pendingSubmissions: pendingCount,
        recentSubmissions: recentCount,
      });
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
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your content and track student progress</p>
        </div>
        <button
          onClick={() => navigate('/leaderboard')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
        >
          <Award size={20} />
          View Leaderboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/teacher/recorded-videos')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Video size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Videos Uploaded</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVideos}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/teacher/quiz-creator')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quizzes Created</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Actions</h2>
          
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => navigate('/projects')}
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">Submissions to Grade</p>
                  <p className="text-sm text-gray-600">Review and provide feedback</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-orange-600 text-white rounded-full font-bold">
                {stats.pendingSubmissions}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Recent Submissions</p>
                  <p className="text-sm text-gray-600">Last 7 days</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold">
                {stats.recentSubmissions}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/teacher/recorded-videos')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left flex items-center gap-3"
            >
              <Video size={20} />
              Upload Video
            </button>

            <button
              onClick={() => navigate('/teacher/quiz-creator')}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left flex items-center gap-3"
            >
              <FileText size={20} />
              Create Quiz
            </button>

            <button
              onClick={() => navigate('/projects')}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-left flex items-center gap-3"
            >
              <BookOpen size={20} />
              Create Assignment
            </button>

            <button
              onClick={() => navigate('/teacher/quiz-rankings')}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left flex items-center gap-3"
            >
              <Award size={20} />
              View Rankings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
