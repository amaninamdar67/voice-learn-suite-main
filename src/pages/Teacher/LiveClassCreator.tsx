import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Video, Plus, Trash2, Edit2, X, Bell, Radio } from 'lucide-react';

interface LiveClass {
  id: string;
  session_title: string;
  description: string;
  stream_url: string;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'live' | 'ended';
  subject: string;
  grade: string;
  section: string;
  created_at: string;
}

export default function LiveClassCreator() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  
  const [formData, setFormData] = useState({
    sessionTitle: '',
    description: '',
    streamUrl: '',
    startTime: '',
    endTime: '',
    subject: '',
    grade: '',
    section: '',
  });

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClass) {
        // Update existing class
        const { error } = await supabase
          .from('live_classes')
          .update({
            session_title: formData.sessionTitle,
            description: formData.description,
            stream_url: formData.streamUrl,
            start_time: formData.startTime,
            end_time: formData.endTime,
            subject: formData.subject,
            grade: formData.grade,
            section: formData.section,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingClass.id);

        if (error) throw error;
        alert('Live class updated successfully!');
      } else {
        // Create new class
        const { error } = await supabase
          .from('live_classes')
          .insert([{
            teacher_id: user?.id,
            session_title: formData.sessionTitle,
            description: formData.description,
            stream_url: formData.streamUrl,
            start_time: formData.startTime,
            end_time: formData.endTime,
            subject: formData.subject,
            grade: formData.grade,
            section: formData.section,
            status: 'upcoming',
          }]);

        if (error) throw error;
        alert('Live class created successfully!');
      }

      // Reset form
      setFormData({
        sessionTitle: '',
        description: '',
        streamUrl: '',
        startTime: '',
        endTime: '',
        subject: '',
        grade: '',
        section: '',
      });
      setShowForm(false);
      setEditingClass(null);
      fetchClasses();
    } catch (error: any) {
      console.error('Error saving class:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (liveClass: LiveClass) => {
    setEditingClass(liveClass);
    setFormData({
      sessionTitle: liveClass.session_title,
      description: liveClass.description || '',
      streamUrl: liveClass.stream_url,
      startTime: liveClass.start_time,
      endTime: liveClass.end_time,
      subject: liveClass.subject || '',
      grade: liveClass.grade || '',
      section: liveClass.section || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this live class?')) return;

    try {
      const { error } = await supabase
        .from('live_classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Live class deleted successfully!');
      fetchClasses();
    } catch (error: any) {
      console.error('Error deleting class:', error);
      alert('Error: ' + error.message);
    }
  };

  const updateStatus = async (id: string, status: 'upcoming' | 'live' | 'ended') => {
    try {
      const { error } = await supabase
        .from('live_classes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchClasses();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Error: ' + error.message);
    }
  };

  const sendAttendancePing = async (classId: string) => {
    if (!confirm('Send attendance check to all students? They will have 60 seconds to respond.')) return;

    try {
      const { error } = await supabase
        .from('live_attendance_pings')
        .insert([{
          live_class_id: classId,
          teacher_id: user?.id,
          ping_sent_at: new Date().toISOString(),
          ping_expires_at: new Date(Date.now() + 60000).toISOString(),
        }]);

      if (error) throw error;
      alert('Attendance check sent! Students have 60 seconds to respond.');
    } catch (error: any) {
      console.error('Error sending ping:', error);
      alert('Error: ' + error.message);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingClass(null);
    setFormData({
      sessionTitle: '',
      description: '',
      streamUrl: '',
      startTime: '',
      endTime: '',
      subject: '',
      grade: '',
      section: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full animate-pulse">
            <Radio size={14} />
            LIVE NOW
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            UPCOMING
          </span>
        );
      case 'ended':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
            ENDED
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Live Class
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingClass ? 'Edit Live Class' : 'Create New Live Class'}
            </h2>
            <button onClick={cancelForm} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Title *
              </label>
              <input
                type="text"
                required
                value={formData.sessionTitle}
                onChange={(e) => setFormData({ ...formData, sessionTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter session title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter session description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Live Stream URL *
              </label>
              <input
                type="text"
                required
                value={formData.streamUrl}
                onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="YouTube Live URL or RTMP stream URL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingClass ? 'Update Class' : 'Create Class'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((liveClass) => (
          <div key={liveClass.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg line-clamp-2 flex-1">{liveClass.session_title}</h3>
                {getStatusBadge(liveClass.status)}
              </div>

              {liveClass.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{liveClass.description}</p>
              )}

              <div className="space-y-2 mb-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Start:</span>{' '}
                  {new Date(liveClass.start_time).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">End:</span>{' '}
                  {new Date(liveClass.end_time).toLocaleString()}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {liveClass.subject && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {liveClass.subject}
                  </span>
                )}
                {liveClass.grade && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Grade {liveClass.grade}
                  </span>
                )}
                {liveClass.section && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    Section {liveClass.section}
                  </span>
                )}
              </div>

              {liveClass.status === 'live' && (
                <button
                  onClick={() => sendAttendancePing(liveClass.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 font-medium"
                >
                  <Bell size={16} />
                  Send Attendance Check
                </button>
              )}

              <div className="flex gap-2 mb-2">
                {liveClass.status === 'upcoming' && (
                  <button
                    onClick={() => updateStatus(liveClass.id, 'live')}
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                  >
                    Start Live
                  </button>
                )}
                {liveClass.status === 'live' && (
                  <button
                    onClick={() => updateStatus(liveClass.id, 'ended')}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                  >
                    End Class
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(liveClass)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(liveClass.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Video size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No live classes yet</h3>
          <p className="text-gray-600 mb-4">Create your first live class to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Live Class
          </button>
        </div>
      )}
    </div>
  );
}
