import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface Analytics {
  average_quiz_score?: number;
  total_quizzes_taken?: number;
  average_assignment_score?: number;
  total_assignments_completed?: number;
  total_lessons_viewed?: number;
  total_videos_watched?: number;
  average_attendance_percentage?: number;
  improvement_trend?: 'improving' | 'stable' | 'declining';
  last_activity_date?: string;
}

interface StudentAnalyticsDashboardProps {
  studentId: string;
  mentorId: string;
  studentName: string;
}

export const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({
  studentId,
  mentorId,
  studentName
}) => {
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [studentId, mentorId]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/mentor-parent/analytics/student/${studentId}/${mentorId}`);
      const data = await response.json();
      setAnalytics(data.analytics || {});
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'improving') return <TrendingUp className="text-green-400" size={20} />;
    if (trend === 'declining') return <TrendingDown className="text-red-400" size={20} />;
    return <TrendingUp className="text-yellow-400" size={20} />;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const StatCard = ({ label, value, unit = '', icon: Icon }: any) => (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon && <Icon size={18} className="text-blue-400" />}
      </div>
      <p className={`text-2xl font-bold ${getScoreColor(value)}`}>
        {value ?? 'N/A'}{unit}
      </p>
    </div>
  );

  if (isLoading) {
    return <div className="text-center text-slate-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-white mb-1">{studentName}'s Performance</h2>
        <p className="text-sm text-slate-400">
          Last activity: {analytics.last_activity_date 
            ? new Date(analytics.last_activity_date).toLocaleDateString() 
            : 'No activity'}
        </p>
      </div>

      {/* Trend Indicator */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-slate-400 mb-1">Overall Trend</p>
          <p className="text-lg font-semibold text-white capitalize">
            {analytics.improvement_trend || 'Stable'}
          </p>
        </div>
        <div className="text-4xl">
          {getTrendIcon(analytics.improvement_trend)}
        </div>
      </div>

      {/* Academic Performance */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Academic Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Average Quiz Score"
            value={analytics.average_quiz_score?.toFixed(1)}
            unit="%"
            icon={CheckCircle}
          />
          <StatCard
            label="Quizzes Taken"
            value={analytics.total_quizzes_taken}
            icon={CheckCircle}
          />
          <StatCard
            label="Average Assignment Score"
            value={analytics.average_assignment_score?.toFixed(1)}
            unit="%"
            icon={CheckCircle}
          />
          <StatCard
            label="Assignments Completed"
            value={analytics.total_assignments_completed}
            icon={CheckCircle}
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Engagement</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Lessons Viewed"
            value={analytics.total_lessons_viewed}
            icon={CheckCircle}
          />
          <StatCard
            label="Videos Watched"
            value={analytics.total_videos_watched}
            icon={CheckCircle}
          />
          <StatCard
            label="Attendance Rate"
            value={analytics.average_attendance_percentage?.toFixed(1)}
            unit="%"
            icon={CheckCircle}
          />
        </div>
      </div>

      {/* Performance Alerts */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={20} className="text-yellow-400" />
          <h3 className="font-semibold text-white">Performance Insights</h3>
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          {analytics.average_quiz_score && analytics.average_quiz_score < 60 && (
            <li>⚠️ Quiz scores are below average. Consider additional support.</li>
          )}
          {analytics.average_attendance_percentage && analytics.average_attendance_percentage < 80 && (
            <li>⚠️ Attendance is below 80%. Encourage regular participation.</li>
          )}
          {analytics.improvement_trend === 'improving' && (
            <li>✓ Great progress! Student is showing improvement.</li>
          )}
          {analytics.improvement_trend === 'declining' && (
            <li>⚠️ Performance is declining. Intervention may be needed.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
