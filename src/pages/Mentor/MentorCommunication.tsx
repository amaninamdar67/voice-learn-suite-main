import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, Users } from 'lucide-react';
import { MentorParentChat } from '../../components/MentorParent/MentorParentChat';
import { StudentAnalyticsDashboard } from '../../components/MentorParent/StudentAnalyticsDashboard';
import { useAuth } from '../../contexts/AuthContext';

interface StudentParent {
  student_id: string;
  student_name: string;
  parent_id: string;
  parent_name: string;
}

export const MentorCommunication: React.FC = () => {
  const { user } = useAuth();
  const [studentParents, setStudentParents] = useState<StudentParent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentParent | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics'>('chat');

  useEffect(() => {
    if (user?.id) {
      loadStudentParents();
      loadAlerts();
    }
  }, [user?.id]);

  const loadStudentParents = async () => {
    try {
      const response = await fetch(`/api/mentor-parent/students/${user?.id}`);
      const data = await response.json();
      setStudentParents(data.studentParents || []);
      if (data.studentParents?.length > 0) {
        setSelectedStudent(data.studentParents[0]);
      }
    } catch (error) {
      console.error('Error loading student parents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch(`/api/mentor-parent/alerts/${user?.id}`);
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center text-slate-400 py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Parent Communication</h1>
        <p className="text-slate-300">Manage communications and track student progress with parents</p>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={20} className="text-red-400" />
            <h3 className="font-semibold text-white">Active Alerts ({alerts.length})</h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="text-sm text-slate-300 bg-slate-700/50 p-2 rounded">
                <p className="font-semibold text-white">{alert.alert_title}</p>
                <p>{alert.alert_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={20} />
              Students
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {studentParents.map((sp) => (
                <button
                  key={sp.student_id}
                  onClick={() => setSelectedStudent(sp)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedStudent?.student_id === sp.student_id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <p className="font-semibold">{sp.student_name}</p>
                  <p className="text-xs text-slate-400">Parent: {sp.parent_name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedStudent ? (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-700">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 font-semibold transition ${
                    activeTab === 'chat'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <MessageSquare size={18} className="inline mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 font-semibold transition ${
                    activeTab === 'analytics'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Analytics
                </button>
              </div>

              {/* Content */}
              {activeTab === 'chat' ? (
                <MentorParentChat
                  mentorId={user?.id || ''}
                  parentId={selectedStudent.parent_id}
                  studentId={selectedStudent.student_id}
                  studentName={selectedStudent.student_name}
                  currentUserId={user?.id || ''}
                  currentUserRole="mentor"
                />
              ) : (
                <StudentAnalyticsDashboard
                  studentId={selectedStudent.student_id}
                  mentorId={user?.id || ''}
                  studentName={selectedStudent.student_name}
                />
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <p>No students assigned yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
