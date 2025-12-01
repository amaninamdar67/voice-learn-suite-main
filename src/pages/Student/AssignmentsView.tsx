import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  FileText, Calendar, Clock, CheckCircle, AlertCircle, 
  Upload, X, Download, Send 
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
  teacher_name: string;
  submission?: {
    id: string;
    submitted_at: string;
    marks_obtained: number | null;
    feedback: string | null;
    status: string;
    attachment_url: string;
    attachment_name: string;
  };
}

export default function AssignmentsView() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // Fetch teacher names
      const teacherIds = [...new Set(assignmentsData?.map(a => a.teacher_id) || [])];
      const { data: teachers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', teacherIds);

      const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]) || []);

      // Fetch submissions
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user?.id);

      const submissionMap = new Map(submissions?.map(s => [s.assignment_id, s]) || []);

      const formattedAssignments = assignmentsData?.map(assignment => ({
        ...assignment,
        teacher_name: teacherMap.get(assignment.teacher_id) || 'Unknown',
        submission: submissionMap.get(assignment.id),
      })) || [];

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || (!submissionText && !submissionFile)) return;

    try {
      setUploading(true);
      let fileUrl = '';
      let fileName = '';

      // Upload file if provided
      if (submissionFile) {
        const fileExt = submissionFile.name.split('.').pop();
        const filePath = `${user?.id}/${Date.now()}_${submissionFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('assignment-submissions')
          .upload(filePath, submissionFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('assignment-submissions')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = submissionFile.name;
      }

      // Submit assignment
      const { error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: selectedAssignment.id,
          student_id: user?.id,
          submission_text: submissionText,
          attachment_url: fileUrl,
          attachment_name: fileName,
          status: new Date() > new Date(selectedAssignment.due_date) ? 'late' : 'submitted',
        });

      if (error) throw error;

      alert('Assignment submitted successfully!');
      setSelectedAssignment(null);
      setSubmissionText('');
      setSubmissionFile(null);
      fetchAssignments();
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatus = (assignment: Assignment) => {
    if (assignment.submission?.marks_obtained !== null) return 'graded';
    if (assignment.submission) return 'submitted';
    if (new Date() > new Date(assignment.due_date)) return 'overdue';
    return 'pending';
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filterStatus === 'all') return true;
    return getStatus(assignment) === filterStatus;
  });

  const pendingCount = assignments.filter(a => getStatus(a) === 'pending').length;
  const submittedCount = assignments.filter(a => getStatus(a) === 'submitted').length;
  const gradedCount = assignments.filter(a => getStatus(a) === 'graded').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-1">View and submit your assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
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
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Send size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900">{gradedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Assignments</option>
          <option value="pending">⏰ Pending</option>
          <option value="submitted">📤 Submitted</option>
          <option value="graded">✅ Graded</option>
          <option value="overdue">⚠️ Overdue</option>
        </select>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const status = getStatus(assignment);
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
                    {status === 'graded' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                        ✅ Graded: {assignment.submission?.marks_obtained}/{assignment.total_marks}
                      </span>
                    )}
                    {status === 'submitted' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                        📤 Submitted
                      </span>
                    )}
                    {status === 'overdue' && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                        ⚠️ Overdue
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">
                        ⏰ Pending
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {assignment.subject}
                    </span>
                    <span>Total Marks: {assignment.total_marks}</span>
                    <span>By: {assignment.teacher_name}</span>
                  </div>
                </div>
              </div>

              {assignment.attachment_url && (
                <div className="mb-4">
                  <a
                    href={assignment.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Download size={16} />
                    {assignment.attachment_name}
                  </a>
                </div>
              )}

              {assignment.submission?.feedback && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-900 mb-1">Teacher Feedback:</p>
                  <p className="text-green-800">{assignment.submission.feedback}</p>
                </div>
              )}

              {!assignment.submission && (
                <button
                  onClick={() => setSelectedAssignment(assignment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Assignment
                </button>
              )}

              {assignment.submission && !assignment.submission.marks_obtained && (
                <div className="text-sm text-gray-600">
                  Submitted on: {new Date(assignment.submission.submitted_at).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">Check back later for new assignments</p>
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedAssignment.title}</h2>
                <p className="text-gray-600 mt-1">Submit your work</p>
              </div>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setSubmissionText('');
                  setSubmissionFile(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Text
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your answer or explanation here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {submissionFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {submissionFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={uploading || (!submissionText && !submissionFile)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Submitting...' : 'Submit Assignment'}
                </button>
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setSubmissionText('');
                    setSubmissionFile(null);
                  }}
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
