import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, Users } from 'lucide-react';
import { MentorParentChat } from '../../components/MentorParent/MentorParentChat';
import { StudentAnalyticsDashboard } from '../../components/MentorParent/StudentAnalyticsDashboard';
import { useAuth } from '../../contexts/AuthContext';

interface StudentMentor {
  student_id: string;
  student_name: string;
  mentor_id: string;
  mentor_name: string;
}

export const ParentMentorCommunication: React.FC = () => {
  const { user } = useAuth();
  const [studentMentors, setStudentMentors] = useState<StudentMentor[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentMentor | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics'>('chat');

  useEffect(() => {
    if (user?.id) {
      loadStudentMentors();
      loadAlerts();
    }
  }, [user?.id]);

  const loadStudentMentors = async () => {
    try {
      const response = await fetch(`/api/mentor-parent/mentors/${user?.id}`);
      const data = await response.json();
      setStudentMentors(data.studentMentors || []);
      if (data.studentMentors?.length > 0) {
        setSelectedStudent(data.studentMentors[0]);
      }
    } catch (error) {
      console.error('Error loading student mentors:', error);
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
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Mentor Communication</h1>
        <p className="text-slate-300">Connect with mentors and track your child's progress</p>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={20} className="text-yellow-400" />
            <h3 className="font-semibold text-white">Updates ({alerts.length})</h3>
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
        {/* Children List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={20} />
              My Children
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {studentMentors.map((sm) => (
                <button
                  key={sm.student_id}
                  onClick={() => setSelectedStudent(sm)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedStudent?.student_id === sm.student_id
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <p className="font-semibold">{sm.student_name}</p>
                  <p className="text-xs text-slate-400">Mentor: {sm.mentor_name}</p>
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
                      ? 'text-green-400 border-b-2 border-green-400'
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
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Progress
                </button>
              </div>

              {/* Content */}
              {activeTab === 'chat' ? (
                <MentorParentChat
                  mentorId={selectedStudent.mentor_id}
                  parentId={user?.id || ''}
                  studentId={selectedStudent.student_id}
                  studentName={selectedStudent.student_name}
                  currentUserId={user?.id || ''}
                  currentUserRole="parent"
                />
              ) : (
                <StudentAnalyticsDashboard
                  studentId={selectedStudent.student_id}
                  mentorId={selectedStudent.mentor_id}
                  studentName={selectedStudent.student_name}
                />
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <p>No mentors assigned yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
