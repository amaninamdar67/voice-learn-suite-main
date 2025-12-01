import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  FileText, Plus, Edit, Trash2, Users, CheckCircle, Clock, X 
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  total_marks: number;
  attachment_url: string;
  attachment_name: string;
  created_at: string;
  submissions_count?: number;
  graded_count?: number;
}

export default function AssignmentCreator() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    due_date: '',
    total_marks: 100,
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch submission counts
      const assignmentIds = assignmentsData?.map(a => a.id) || [];
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('assignment_id, status')
        .in('assignment_id', assignmentIds);

      const submissionCounts = new Map();
      const gradedCounts = new Map();

      submissions?.forEach(sub => {
        submissionCounts.set(sub.assignment_id, (submissionCounts.get(sub.assignment_id) || 0) + 1);
        if (sub.status === 'graded') {
          gradedCounts.set(sub.assignment_id, (gradedCounts.get(sub.assignment_id) || 0) + 1);
        }
      });

      const formattedAssignments = assignmentsData?.map(assignment => ({
        ...assignment,
        submissions_count: submissionCounts.get(assignment.id) || 0,
        graded_count: gradedCounts.get(assignment.id) || 0,
      })) || [];

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.due_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      let fileUrl = '';
      let fileName = '';

      // Upload attachment if provided
      if (attachmentFile) {
        const fileExt = attachmentFile.name.split('.').pop();
        const filePath = `${user?.id}/${Date.now()}_${attachmentFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('assignment-files')
          .upload(filePath, attachmentFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('assignment-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = attachmentFile.name;
      }

      // Create assignment
      const { error } = await supabase
        .from('assignments')
        .insert({
          ...formData,
          teacher_id: user?.id,
          attachment_url: fileUrl,
          attachment_name: fileName,
        });

      if (error) throw error;

      alert('Assignment created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        subject: '',
        due_date: '',
        total_marks: 100,
      });
      setAttachmentFile(null);
      fetchAssignments();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Assignment deleted successfully!');
      fetchAssignments();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600 mt-1">Create and manage student assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Assignment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => new Date(a.due_date) > new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.reduce((sum, a) => sum + (a.submissions_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const dueDate = new Date(assignment.due_date);
          const isOverdue = new Date() > dueDate;

          return (
            <div
              key={assignment.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{assignment.title}</h3>
                    {isOverdue ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                        Closed
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {assignment.subject}
                    </span>
                    <span>Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}</span>
                    <span>Total Marks: {assignment.total_marks}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={20} />
                  <span className="font-medium">{assignment.submissions_count || 0}</span>
                  <span className="text-sm">Submissions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle size={20} />
                  <span className="font-medium">{assignment.graded_count || 0}</span>
                  <span className="text-sm">Graded</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAssignment(assignment.id)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Submissions
              </button>
            </div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-gray-600 mb-4">Create your first assignment to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Assignment
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Create Assignment</h2>
                <p className="text-gray-600 mt-1">Fill in the assignment details</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Essay on Climate Change"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed instructions..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {attachmentFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {attachmentFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Creating...' : 'Create Assignment'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
