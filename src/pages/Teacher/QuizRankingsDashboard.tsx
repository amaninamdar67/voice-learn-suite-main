import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trophy, Medal, Award, Download, RefreshCw, TrendingUp, Users } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  grade: string;
  total_marks: number;
}

interface Ranking {
  id: string;
  rank: number;
  score: number;
  percentage: number;
  time_taken_seconds: number;
  submitted_at: string;
  profiles: {
    full_name: string;
    grade: string;
  };
}

export default function QuizRankingsDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    averageScore: 0,
    highestScore: 0,
    averageTime: 0,
  });

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  useEffect(() => {
    if (selectedQuiz) {
      fetchRankings();
    }
  }, [selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, subject, grade, total_marks')
        .eq('teacher_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
      if (data && data.length > 0) {
        setSelectedQuiz('overall'); // Default to overall rankings
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallRankings = async () => {
    try {
      // Get all quiz results for this teacher's quizzes
      const quizIds = quizzes.map(q => q.id);
      
      const { data, error } = await supabase
        .from('quiz_results')
        .select('student_id, score, time_taken_seconds, quiz_id')
        .in('quiz_id', quizIds)
        .eq('is_completed', true);

      if (error) throw error;

      // Group by student and calculate totals
      const studentTotals = new Map();
      data?.forEach(result => {
        const existing = studentTotals.get(result.student_id) || { 
          totalScore: 0, 
          totalTime: 0, 
          quizCount: 0 
        };
        studentTotals.set(result.student_id, {
          totalScore: existing.totalScore + result.score,
          totalTime: existing.totalTime + result.time_taken_seconds,
          quizCount: existing.quizCount + 1
        });
      });

      // Convert to array and sort
      const sortedStudents = Array.from(studentTotals.entries())
        .sort((a, b) => {
          // Sort by total score (descending)
          if (b[1].totalScore !== a[1].totalScore) {
            return b[1].totalScore - a[1].totalScore;
          }
          // If tied, sort by time (ascending - lowest time wins)
          return a[1].totalTime - b[1].totalTime;
        });

      // Fetch student profiles
      const studentIds = sortedStudents.map(([id]) => id);
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, grade')
        .in('id', studentIds);

      const studentMap = new Map(students?.map(s => [s.id, { full_name: s.full_name, grade: s.grade }]) || []);

      // Create rankings
      const overallRankings = sortedStudents.map(([studentId, totals], index) => ({
        id: studentId,
        rank: index + 1,
        student_id: studentId,
        score: totals.totalScore,
        percentage: 0, // Not applicable for overall
        time_taken_seconds: totals.totalTime,
        submitted_at: new Date().toISOString(),
        profiles: studentMap.get(studentId) || { full_name: 'Unknown Student', grade: '' }
      }));

      setRankings(overallRankings);

      // Calculate stats
      if (overallRankings.length > 0) {
        const totalMarks = quizzes.reduce((sum, q) => sum + q.total_marks, 0);
        setStats({
          totalParticipants: overallRankings.length,
          averageScore: overallRankings.reduce((sum, r) => sum + r.score, 0) / overallRankings.length,
          highestScore: overallRankings[0].score,
          averageTime: overallRankings.reduce((sum, r) => sum + r.time_taken_seconds, 0) / overallRankings.length,
        });
      }
    } catch (error) {
      console.error('Error fetching overall rankings:', error);
    } finally {
      setLoadingRankings(false);
    }
  };

  const fetchRankings = async () => {
    if (!selectedQuiz) return;

    setLoadingRankings(true);
    
    // Check if "Overall" is selected
    if (selectedQuiz === 'overall') {
      await fetchOverallRankings();
      return;
    }
    try {
      const { data, error } = await supabase
        .from('quiz_rankings')
        .select('*')
        .eq('quiz_id', selectedQuiz)
        .order('rank', { ascending: true});

      if (error) throw error;

      // Fetch student names separately
      let rankingsWithProfiles = data || [];
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map(r => r.student_id))];
        console.log('Student IDs:', studentIds);
        
        const { data: students, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, grade')
          .in('id', studentIds);
        
        console.log('Fetched students:', students);
        if (profileError) console.error('Profile fetch error:', profileError);
        
        const studentMap = new Map(students?.map(s => [s.id, { full_name: s.full_name, grade: s.grade }]) || []);
        rankingsWithProfiles = data.map(ranking => ({
          ...ranking,
          profiles: studentMap.get(ranking.student_id) || { full_name: 'Unknown Student', grade: '' }
        }));
      }

      setRankings(rankingsWithProfiles);

      // Calculate stats
      if (data && data.length > 0) {
        const totalParticipants = data.length;
        const averageScore = data.reduce((sum, r) => sum + r.percentage, 0) / totalParticipants;
        const highestScore = Math.max(...data.map(r => r.percentage));
        const averageTime = data.reduce((sum, r) => sum + r.time_taken_seconds, 0) / totalParticipants;

        setStats({
          totalParticipants,
          averageScore: Math.round(averageScore * 10) / 10,
          highestScore: Math.round(highestScore * 10) / 10,
          averageTime: Math.round(averageTime),
        });
      } else {
        setStats({
          totalParticipants: 0,
          averageScore: 0,
          highestScore: 0,
          averageTime: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoadingRankings(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Trophy size={24} className="text-yellow-500" fill="currentColor" />;
    } else if (rank === 2) {
      return <Medal size={24} className="text-gray-400" fill="currentColor" />;
    } else if (rank === 3) {
      return <Award size={24} className="text-orange-600" fill="currentColor" />;
    }
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const exportToCSV = () => {
    if (rankings.length === 0) return;

    const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);
    const csvContent = [
      ['Rank', 'Student Name', 'Marks Obtained', 'Total Marks', 'Percentage', 'Time Taken', 'Submitted At'],
      ...rankings.map(r => [
        r.rank,
        r.profiles.full_name,
        r.score,
        selectedQuizData?.total_marks || 0,
        `${r.percentage}%`,
        formatTime(r.time_taken_seconds),
        formatDate(r.submitted_at),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedQuizData?.title || 'quiz'}_rankings.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
          <p className="text-gray-600">Create a quiz first to see rankings</p>
        </div>
      </div>
    );
  }

  const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quiz Rankings</h1>
        <p className="text-gray-600 mt-1">View leaderboards and student performance</p>
      </div>

      {/* Quiz Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Quiz
            </label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="overall">📊 Overall Rankings (All Quizzes)</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title} {quiz.subject && `- ${quiz.subject}`} {quiz.grade && `(Grade ${quiz.grade})`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchRankings}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={rankings.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Highest Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highestScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(stats.averageTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Leaderboard - {selectedQuiz === 'overall' ? 'Overall Rankings' : selectedQuizData?.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedQuiz === 'overall' 
              ? `Combined results from ${quizzes.length} quizzes`
              : `Total Marks: ${selectedQuizData?.total_marks}`
            }
          </p>
        </div>

        {loadingRankings ? (
          <div className="p-12 text-center text-gray-600">Loading rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No submissions yet for this quiz</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.map((ranking) => (
                  <tr
                    key={ranking.id}
                    className={`hover:bg-gray-50 ${
                      ranking.rank <= 3 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankBadge(ranking.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {ranking.profiles.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ranking.score}/{selectedQuizData?.total_marks || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className={`h-2 rounded-full ${
                              ranking.percentage >= 80
                                ? 'bg-green-500'
                                : ranking.percentage >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${ranking.percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {ranking.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTime(ranking.time_taken_seconds)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(ranking.submitted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
