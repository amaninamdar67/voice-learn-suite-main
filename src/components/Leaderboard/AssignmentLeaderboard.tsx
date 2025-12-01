import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  student_id: string;
  student_name: string;
  total_submissions: number;
  graded_submissions: number;
  total_marks_obtained: number;
  total_marks_possible: number;
  average_percentage: number;
  rank: number;
}

interface AssignmentLeaderboardProps {
  isTeacherView?: boolean;
}

export default function AssignmentLeaderboard({ isTeacherView = false }: AssignmentLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Fetch all graded submissions with student info
      const { data: submissions, error } = await supabase
        .from('assignment_submissions')
        .select(`
          student_id,
          marks_obtained,
          assignment_id
        `)
        .eq('status', 'graded')
        .not('marks_obtained', 'is', null);

      if (error) throw error;

      // Fetch assignment details
      const assignmentIds = [...new Set(submissions?.map(s => s.assignment_id) || [])];
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, total_marks')
        .in('id', assignmentIds);

      const assignmentMap = new Map(assignments?.map(a => [a.id, a.total_marks]) || []);

      // Fetch student names
      const studentIds = [...new Set(submissions?.map(s => s.student_id) || [])];
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const studentMap = new Map(students?.map(s => [s.id, s.full_name]) || []);

      // Calculate stats per student
      const statsMap = new Map<string, {
        total_submissions: number;
        graded_submissions: number;
        total_marks_obtained: number;
        total_marks_possible: number;
      }>();

      submissions?.forEach(sub => {
        const current = statsMap.get(sub.student_id) || {
          total_submissions: 0,
          graded_submissions: 0,
          total_marks_obtained: 0,
          total_marks_possible: 0,
        };

        current.graded_submissions += 1;
        current.total_marks_obtained += sub.marks_obtained || 0;
        current.total_marks_possible += assignmentMap.get(sub.assignment_id) || 0;

        statsMap.set(sub.student_id, current);
      });

      // Format leaderboard entries
      const entries: LeaderboardEntry[] = Array.from(statsMap.entries())
        .map(([student_id, stats]) => ({
          student_id,
          student_name: studentMap.get(student_id) || 'Unknown',
          ...stats,
          total_submissions: stats.graded_submissions,
          average_percentage: stats.total_marks_possible > 0
            ? (stats.total_marks_obtained / stats.total_marks_possible) * 100
            : 0,
          rank: 0,
        }))
        .sort((a, b) => b.average_percentage - a.average_percentage)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboard(entries);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-amber-600" size={24} />;
      default:
        return <Award className="text-blue-500" size={20} />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    return 'bg-white';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Assignment Leaderboard</h2>
        </div>
        <div className="text-center py-8">
          <Trophy size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No graded assignments yet</p>
          <p className="text-sm text-gray-500 mt-1">
            {isTeacherView 
              ? 'Grade some assignments to see the leaderboard' 
              : 'Complete and get graded on assignments to appear here'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">Assignment Leaderboard</h2>
        <span className="ml-auto text-sm text-gray-600">
          Top {Math.min(10, leaderboard.length)} Students
        </span>
      </div>

      <div className="space-y-3">
        {leaderboard.slice(0, 10).map((entry) => (
          <div
            key={entry.student_id}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              getRankBadge(entry.rank)
            } ${entry.rank <= 3 ? 'border-transparent' : 'border-gray-200'}`}
          >
            {/* Rank Icon */}
            <div className="flex-shrink-0 w-12 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-semibold truncate ${
                  entry.rank <= 3 ? 'text-white' : 'text-gray-900'
                }`}>
                  {entry.student_name}
                </p>
                {entry.rank <= 3 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                    #{entry.rank}
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                entry.rank <= 3 ? 'text-white/90' : 'text-gray-600'
              }`}>
                {entry.graded_submissions} assignment{entry.graded_submissions !== 1 ? 's' : ''} graded
              </p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                entry.rank <= 3 ? 'text-white' : 'text-gray-900'
              }`}>
                {entry.average_percentage.toFixed(1)}%
              </p>
              <p className={`text-xs ${
                entry.rank <= 3 ? 'text-white/80' : 'text-gray-500'
              }`}>
                {entry.total_marks_obtained}/{entry.total_marks_possible} marks
              </p>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length > 10 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing top 10 of {leaderboard.length} students
        </div>
      )}
    </div>
  );
}
