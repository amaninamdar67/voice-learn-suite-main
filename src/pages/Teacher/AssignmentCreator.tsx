import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  FileText, Plus, Edit, Trash2, Users, CheckCircle, Clock, X, Download 
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

interface Submission {
  id: string;
  student_id: string;
  student_name: string;
  submission_text: string;
  attachment_url: string;
  attachment_name: string;
  submitted_at: string;
  marks_obtained: number | null;
  feedback: string | null;
  status: string;
}

export default function AssignmentCreator() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

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

  const fetchSubmissions = async (assignment: Assignment) => {
    try {
      setLoadingSubmissions(true);
      setSelectedAssignment(assignment);
      setShowSubmissionsModal(true);

      const { data: submissionsData, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignment.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Fetch student names
      const studentIds = [...new Set(submissionsData?.map(s => s.student_id) || [])];
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const studentMap = new Map(students?.map(s => [s.id, s.full_name]) || []);

      const formattedSubmissions = submissionsData?.map(sub => ({
        ...sub,
        student_name: studentMap.get(sub.student_id) || 'Unknown',
      })) || [];

      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!gradingSubmission || gradeMarks < 0) return;

    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          marks_obtained: gradeMarks,
          feedback: gradeFeedback,
          status: 'graded',
        })
        .eq('id', gradingSubmission.id);

      if (error) throw error;

      alert('Submission graded successfully!');
      setGradingSubmission(null);
      setGradeMarks(0);
      setGradeFeedback('');
      
      // Refresh both submissions and assignments list
      if (selectedAssignment) {
        await fetchSubmissions(selectedAssignment);
      }
      await fetchAssignments(); // Refresh the main list to update counts
    } catch (error: any) {
      console.error('Error grading submission:', error);
      alert('Failed to grade submission: ' + error.message);
    }
  };

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

      {loading && (
        <>
          {/* Skeleton Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Assignment Cards */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-40"></div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && (
        <>

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
                onClick={() => fetchSubmissions(assignment)}
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

      </>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold">{selectedAssignment.title}</h2>
                <p className="text-gray-600 mt-1">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSubmissionsModal(false);
                  setSelectedAssignment(null);
                  setSubmissions([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {loadingSubmissions ? (
                <div className="text-center py-8 text-gray-600">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600">Students haven't submitted their work yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`rounded-lg p-6 border-2 transition-all ${
                        submission.status === 'graded'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4 pb-4 border-b">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600">
                              {submission.student_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {submission.student_name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Clock size={14} />
                              {new Date(submission.submitted_at).toLocaleDateString()} at{' '}
                              {new Date(submission.submitted_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                              submission.status === 'graded'
                                ? 'bg-green-500 text-white'
                                : submission.status === 'late'
                                ? 'bg-red-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            {submission.status === 'graded' ? '✅ Graded' : 
                             submission.status === 'late' ? '⚠️ Late Submission' : '📤 Submitted'}
                          </span>
                          {submission.status === 'graded' && (
                            <p className="text-2xl font-bold text-green-600 mt-2">
                              {submission.marks_obtained}/{selectedAssignment.total_marks}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      {submission.submission_text && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-gray-600" />
                            <p className="text-sm font-bold text-gray-700">Submission Text:</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {submission.submission_text}
                            </p>
                          </div>
                        </div>
                      )}

                      {submission.attachment_url && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Download size={16} className="text-gray-600" />
                            <p className="text-sm font-bold text-gray-700">Attachment:</p>
                          </div>
                          <a
                            href={submission.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                          >
                            <Download size={18} />
                            {submission.attachment_name}
                          </a>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="mb-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                          <p className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                            <CheckCircle size={16} />
                            Your Feedback:
                          </p>
                          <p className="text-green-900 leading-relaxed">{submission.feedback}</p>
                        </div>
                      )}

                      {/* Action Button */}
                      {submission.status !== 'graded' ? (
                        <button
                          onClick={() => {
                            setGradingSubmission(submission);
                            setGradeMarks(0);
                            setGradeFeedback('');
                          }}
                          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
                        >
                          Grade This Submission
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setGradingSubmission(submission);
                            setGradeMarks(submission.marks_obtained || 0);
                            setGradeFeedback(submission.feedback || '');
                          }}
                          className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold"
                        >
                          Update Grade
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Grade Submission</h2>
              <p className="text-gray-600 mt-1">{gradingSubmission.student_name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks Obtained (out of {selectedAssignment?.total_marks})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedAssignment?.total_marks}
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide feedback to the student..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGradeSubmission}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Grade
                </button>
                <button
                  onClick={() => {
                    setGradingSubmission(null);
                    setGradeMarks(0);
                    setGradeFeedback('');
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
