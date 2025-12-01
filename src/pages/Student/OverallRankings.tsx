import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trophy, Award, TrendingUp, Star, Medal } from 'lucide-react';

interface StudentRanking {
  student_id: string;
  student_name: string;
  total_points: number;
  quiz_points: number;
  assignment_points: number;
  attendance_points: number;
  participation_points: number;
  rank: number;
  percentile: number;
  grade: string;
  section: string;
}

export default function OverallRankings() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [myRanking, setMyRanking] = useState<StudentRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterSection, setFilterSection] = useState('all');

  useEffect(() => {
    fetchRankings();
  }, [user, filterGrade, filterSection]);

  const fetchRankings = async () => {
    try {
      setLoading(true);

      // Fetch all students
      let query = supabase
        .from('profiles')
        .select('id, full_name, grade, section')
        .eq('role', 'student');

      if (filterGrade !== 'all') {
        query = query.eq('grade', filterGrade);
      }
      if (filterSection !== 'all') {
        query = query.eq('section', filterSection);
      }

      const { data: students, error: studentsError } = await query;
      if (studentsError) throw studentsError;

      // Calculate points for each student
      const studentRankings = await Promise.all(
        students?.map(async (student) => {
          // Quiz points
          const { data: quizData } = await supabase
            .from('quiz_rankings')
            .select('marks_obtained')
            .eq('student_id', student.id);
          const quizPoints = quizData?.reduce((sum, q) => sum + (q.marks_obtained || 0), 0) || 0;

          // Assignment points
          const { data: assignmentData } = await supabase
            .from('assignment_submissions')
            .select('marks_obtained')
            .eq('student_id', student.id)
            .eq('status', 'graded');
          const assignmentPoints = assignmentData?.reduce((sum, a) => sum + (a.marks_obtained || 0), 0) || 0;

          // Video lesson attendance points (completed lessons)
          const { data: videoAttendance } = await supabase
            .from('lesson_attendance')
            .select('is_completed')
            .eq('student_id', student.id)
            .eq('is_completed', true);
          const attendancePoints = (videoAttendance?.length || 0) * 10; // 10 points per completed lesson

          // Live class attendance points
          const { data: liveAttendance } = await supabase
            .from('live_class_attendance')
            .select('attendance_percentage')
            .eq('student_id', student.id);
          const participationPoints = liveAttendance?.reduce((sum, l) => sum + (l.attendance_percentage || 0) / 10, 0) || 0;

          const totalPoints = quizPoints + assignmentPoints + attendancePoints + participationPoints;

          return {
            student_id: student.id,
            student_name: student.full_name,
            total_points: Math.round(totalPoints),
            quiz_points: quizPoints,
            assignment_points: assignmentPoints,
            attendance_points: attendancePoints,
            participation_points: Math.round(participationPoints),
            rank: 0,
            percentile: 0,
            grade: student.grade || '',
            section: student.section || '',
          };
        }) || []
      );

      // Sort by total points and assign ranks
      studentRankings.sort((a, b) => b.total_points - a.total_points);
      
      const rankedStudents = studentRankings.map((student, index) => ({
        ...student,
        rank: index + 1,
        percentile: Math.round(((studentRankings.length - index) / studentRankings.length) * 100),
      }));

      setRankings(rankedStudents);

      // Find current user's ranking
      const myRank = rankedStudents.find(r => r.student_id === user?.id);
      setMyRanking(myRank || null);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={32} />;
    if (rank === 2) return <Medal className="text-gray-400" size={32} />;
    if (rank === 3) return <Medal className="text-orange-600" size={32} />;
    return <Award className="text-gray-400" size={24} />;
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gray-100';
  };

  const grades = ['all', ...new Set(rankings.map(r => r.grade).filter(Boolean))];
  const sections = ['all', ...new Set(rankings.map(r => r.section).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading rankings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={36} className="text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">Overall Rankings</h1>
        </div>
        <p className="text-gray-600">Combined performance across all modules</p>
      </div>

      {/* My Performance Card */}
      {myRanking && (
        <div className={`${getMedalColor(myRanking.rank)} rounded-lg shadow-lg p-6 mb-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {getMedalIcon(myRanking.rank)}
              <div>
                <h2 className="text-2xl font-bold">Your Overall Rank</h2>
                <p className="text-white/90">Out of {rankings.length} students</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">#{myRanking.rank}</div>
              <div className="text-lg">Top {100 - myRanking.percentile}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/80 text-sm">Total Points</p>
              <p className="text-2xl font-bold">{myRanking.total_points}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Quiz Points</p>
              <p className="text-2xl font-bold">{myRanking.quiz_points}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Assignment Points</p>
              <p className="text-2xl font-bold">{myRanking.assignment_points}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Attendance Points</p>
              <p className="text-2xl font-bold">{myRanking.attendance_points}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Participation</p>
              <p className="text-2xl font-bold">{myRanking.participation_points}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Grade</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Grades</option>
              {grades.filter(g => g !== 'all').map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sections</option>
              {sections.filter(s => s !== 'all').map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Points Breakdown Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Points are Calculated:</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-blue-800">
          <div>
            <strong>Quiz Points:</strong> Sum of all quiz marks
          </div>
          <div>
            <strong>Assignment Points:</strong> Sum of all graded assignment marks
          </div>
          <div>
            <strong>Attendance Points:</strong> 10 points per completed video lesson
          </div>
          <div>
            <strong>Participation:</strong> Live class attendance percentage / 10
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          <div className="bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg p-6 text-center transform translate-y-8">
            <Medal className="mx-auto text-gray-600 mb-2" size={48} />
            <div className="text-4xl font-bold text-gray-800 mb-2">#2</div>
            <div className="font-semibold text-gray-900">{rankings[1].student_name}</div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{rankings[1].total_points}</div>
            <div className="text-sm text-gray-700">points</div>
          </div>

          {/* 1st Place */}
          <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg p-6 text-center">
            <Trophy className="mx-auto text-yellow-800 mb-2" size={56} />
            <div className="text-5xl font-bold text-yellow-900 mb-2">#1</div>
            <div className="font-bold text-lg text-yellow-900">{rankings[0].student_name}</div>
            <div className="text-3xl font-bold text-yellow-900 mt-2">{rankings[0].total_points}</div>
            <div className="text-sm text-yellow-800">points</div>
          </div>

          {/* 3rd Place */}
          <div className="bg-gradient-to-br from-orange-300 to-orange-600 rounded-lg p-6 text-center transform translate-y-8">
            <Medal className="mx-auto text-orange-800 mb-2" size={48} />
            <div className="text-4xl font-bold text-orange-900 mb-2">#3</div>
            <div className="font-semibold text-orange-900">{rankings[2].student_name}</div>
            <div className="text-2xl font-bold text-orange-900 mt-2">{rankings[2].total_points}</div>
            <div className="text-sm text-orange-800">points</div>
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Points
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignments
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participation
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentile
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankings.map((student) => (
                <tr
                  key={student.student_id}
                  className={`${
                    student.student_id === user?.id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {student.rank <= 3 ? (
                        getMedalIcon(student.rank)
                      ) : (
                        <span className="text-lg font-bold text-gray-600">#{student.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {student.student_name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.student_name}
                          {student.student_id === user?.id && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.grade && `Grade ${student.grade}`}
                          {student.section && ` - Section ${student.section}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-xl font-bold text-gray-900">{student.total_points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">{student.quiz_points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">{student.assignment_points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">{student.attendance_points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">{student.participation_points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Top {100 - student.percentile}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rankings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Star size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings available</h3>
          <p className="text-gray-600">Complete quizzes and assignments to appear on the leaderboard</p>
        </div>
      )}
    </div>
  );
}
