import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trophy, Award, TrendingUp, Star, Medal, Download, Filter } from 'lucide-react';

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

export default function OverallRankingsDashboard() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [showTopOnly, setShowTopOnly] = useState(false);

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

          // Video lesson attendance points
          const { data: videoAttendance } = await supabase
            .from('lesson_attendance')
            .select('is_completed')
            .eq('student_id', student.id)
            .eq('is_completed', true);
          const attendancePoints = (videoAttendance?.length || 0) * 10;

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

      // Sort and rank
      studentRankings.sort((a, b) => b.total_points - a.total_points);
      
      const rankedStudents = studentRankings.map((student, index) => ({
        ...student,
        rank: index + 1,
        percentile: Math.round(((studentRankings.length - index) / studentRankings.length) * 100),
      }));

      setRankings(rankedStudents);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Rank', 'Student Name', 'Grade', 'Section', 'Total Points', 'Quiz Points', 'Assignment Points', 'Attendance Points', 'Participation Points', 'Percentile'];
    const csvData = rankings.map(r => [
      r.rank,
      r.student_name,
      r.grade,
      r.section,
      r.total_points,
      r.quiz_points,
      r.assignment_points,
      r.attendance_points,
      r.participation_points,
      `Top ${100 - r.percentile}%`
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overall-rankings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={28} />;
    if (rank === 2) return <Medal className="text-gray-400" size={28} />;
    if (rank === 3) return <Medal className="text-orange-600" size={28} />;
    return null;
  };

  const grades = ['all', ...new Set(rankings.map(r => r.grade).filter(Boolean))];
  const sections = ['all', ...new Set(rankings.map(r => r.section).filter(Boolean))];

  const displayedRankings = showTopOnly ? rankings.slice(0, 10) : rankings;

  const avgTotalPoints = rankings.length > 0 
    ? Math.round(rankings.reduce((sum, r) => sum + r.total_points, 0) / rankings.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading rankings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={36} className="text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Overall Rankings Dashboard</h1>
          </div>
          <p className="text-gray-600">Monitor student performance across all modules</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Star size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{rankings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Points</p>
              <p className="text-2xl font-bold text-gray-900">{avgTotalPoints}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {rankings[0]?.total_points || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-bold text-gray-900 truncate">
                {rankings[0]?.student_name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
            <select
              value={showTopOnly ? 'top10' : 'all'}
              onChange={(e) => setShowTopOnly(e.target.value === 'top10')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="top10">Top 10 Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Points Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Points Calculation:</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-blue-800">
          <div><strong>Quiz:</strong> Sum of all quiz marks</div>
          <div><strong>Assignments:</strong> Sum of graded assignment marks</div>
          <div><strong>Attendance:</strong> 10 points per completed video lesson</div>
          <div><strong>Participation:</strong> Live class attendance % / 10</div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quiz</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assignments</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Participation</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Percentile</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedRankings.map((student) => (
                <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getMedalIcon(student.rank) || (
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
                        <div className="font-medium text-gray-900">{student.student_name}</div>
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
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Top {100 - student.percentile}%
                    </span>
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
          <p className="text-gray-600">Students need to complete activities to appear on the leaderboard</p>
        </div>
      )}
    </div>
  );
}
