import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trophy, Medal, Award, TrendingUp, Users, Clock } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  total_marks: number;
}

interface Ranking {
  rank: number;
  score: number;
  percentage: number;
  time_taken_seconds: number;
  submitted_at: string;
  profiles: {
    full_name: string;
  };
}

interface MyRank {
  rank: number | null;
  score: number;
  percentage: number;
  time_taken_seconds: number;
  totalParticipants: number;
  percentile: number | null;
}

export default function QuizRankingsView() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [topRankings, setTopRankings] = useState<Ranking[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);

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
      // Get quizzes that the student has attempted
      const { data: results, error: resultsError } = await supabase
        .from('quiz_results')
        .select('quiz_id')
        .eq('student_id', user?.id)
        .eq('is_completed', true);

      if (resultsError) throw resultsError;

      const quizIds = results?.map(r => r.quiz_id) || [];

      if (quizIds.length > 0) {
        const { data: quizzes, error: quizzesError } = await supabase
          .from('quizzes')
          .select('id, title, subject, total_marks')
          .in('id', quizIds);

        if (quizzesError) throw quizzesError;

        setQuizzes(quizzes || []);
        if (quizzes && quizzes.length > 0) {
          setSelectedQuiz(quizzes[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    if (!selectedQuiz) return;

    try {
      // Fetch top 10 rankings
      const { data: rankings, error: rankingsError } = await supabase
        .from('quiz_rankings')
        .select('*')
        .eq('quiz_id', selectedQuiz)
        .order('rank', { ascending: true })
        .limit(10);

      if (rankingsError) {
        console.error('Error fetching rankings:', rankingsError);
        throw rankingsError;
      }
      
      console.log('Rankings data:', rankings);
      
      // Fetch student names separately
      if (rankings && rankings.length > 0) {
        const studentIds = [...new Set(rankings.map(r => r.student_id))];
        const { data: students } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', studentIds);
        
        const studentMap = new Map(students?.map(s => [s.id, s.full_name]) || []);
        const rankingsWithStudents = rankings.map(ranking => ({
          ...ranking,
          profiles: { full_name: studentMap.get(ranking.student_id) || 'Unknown' }
        }));
        
        setTopRankings(rankingsWithStudents);
      } else {
        setTopRankings([]);
      }

      // Fetch my rank
      const { data: myRanking, error: myRankError } = await supabase
        .from('quiz_rankings')
        .select('*')
        .eq('quiz_id', selectedQuiz)
        .eq('student_id', user?.id)
        .single();

      if (myRankError && myRankError.code !== 'PGRST116') throw myRankError;

      // Get total participants
      const { count, error: countError } = await supabase
        .from('quiz_rankings')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', selectedQuiz);

      if (countError) throw countError;

      if (myRanking) {
        const percentile = count ? ((count - myRanking.rank + 1) / count) * 100 : null;
        setMyRank({
          rank: myRanking.rank,
          score: myRanking.score,
          percentage: myRanking.percentage,
          time_taken_seconds: myRanking.time_taken_seconds,
          totalParticipants: count || 0,
          percentile,
        });
      } else {
        setMyRank(null);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Trophy size={32} className="text-yellow-500" fill="currentColor" />;
    } else if (rank === 2) {
      return <Medal size={32} className="text-gray-400" fill="currentColor" />;
    } else if (rank === 3) {
      return <Award size={32} className="text-orange-600" fill="currentColor" />;
    }
    return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600';
    if (percentile >= 75) return 'text-blue-600';
    if (percentile >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading rankings...</div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz rankings yet</h3>
          <p className="text-gray-600">Complete a quiz to see your ranking</p>
        </div>
      </div>
    );
  }

  const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quiz Rankings</h1>
        <p className="text-gray-600 mt-1">See how you rank against your classmates</p>
      </div>

      {/* Quiz Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Quiz</label>
        <select
          value={selectedQuiz}
          onChange={(e) => setSelectedQuiz(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {quizzes.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title} {quiz.subject && `- ${quiz.subject}`}
            </option>
          ))}
        </select>
      </div>

      {/* My Rank Card */}
      {myRank && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Your Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Your Rank</p>
              <p className="text-3xl font-bold">#{myRank.rank}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Score</p>
              <p className="text-3xl font-bold">
                {myRank.score}/{selectedQuizData?.total_marks}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Percentage</p>
              <p className="text-3xl font-bold">{Math.round(myRank.percentage)}%</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Percentile</p>
              <p className="text-3xl font-bold">
                {myRank.percentile ? `Top ${Math.round(100 - myRank.percentile)}%` : 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock size={16} />
              Time: {formatTime(myRank.time_taken_seconds)}
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} />
              {myRank.totalParticipants} participants
            </span>
          </div>
        </div>
      )}

      {/* Top 10 Leaderboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-yellow-50 to-orange-50">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy size={28} className="text-yellow-600" />
            Top 10 Leaderboard
          </h2>
          <p className="text-gray-600 mt-1">{selectedQuizData?.title}</p>
        </div>

        <div className="divide-y">
          {topRankings.map((ranking, index) => {
            const isMe = ranking.profiles.full_name === user?.email; // You might want to match by ID
            const isTopThree = ranking.rank <= 3;

            return (
              <div
                key={index}
                className={`p-6 flex items-center gap-4 ${
                  isTopThree ? 'bg-yellow-50' : ''
                } ${isMe ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
              >
                <div className="w-16 flex justify-center">
                  {getRankBadge(ranking.rank)}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {ranking.profiles?.full_name || 'Unknown Student'}
                    {isMe && (
                      <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        You
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>
                      Score: {ranking.score}/{selectedQuizData?.total_marks}
                    </span>
                    <span>•</span>
                    <span>{Math.round(ranking.percentage)}%</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(ranking.time_taken_seconds)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-24 bg-gray-200 rounded-full h-3 mb-1">
                    <div
                      className={`h-3 rounded-full ${
                        ranking.percentage >= 90
                          ? 'bg-green-500'
                          : ranking.percentage >= 75
                          ? 'bg-blue-500'
                          : ranking.percentage >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${ranking.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(ranking.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {topRankings.length === 0 && (
          <div className="p-12 text-center text-gray-600">
            <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
            <p>No rankings available yet</p>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {myRank && myRank.rank && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Performance Insights
          </h3>
          <div className="space-y-3 text-sm">
            {myRank.rank === 1 && (
              <p className="text-green-600 font-medium">
                🎉 Congratulations! You're ranked #1 in this quiz!
              </p>
            )}
            {myRank.rank <= 3 && myRank.rank > 1 && (
              <p className="text-blue-600 font-medium">
                🏆 Great job! You're in the top 3!
              </p>
            )}
            {myRank.percentile && myRank.percentile >= 90 && (
              <p className="text-green-600">
                ✨ You're in the top 10% of all participants!
              </p>
            )}
            {myRank.percentile && myRank.percentile >= 75 && myRank.percentile < 90 && (
              <p className="text-blue-600">
                👍 You're performing better than 75% of participants!
              </p>
            )}
            {myRank.percentage >= 90 && (
              <p className="text-green-600">
                💯 Excellent score! You've mastered this topic!
              </p>
            )}
            {myRank.percentage < 60 && (
              <p className="text-orange-600">
                📚 Keep practicing! Review the material and try again.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
