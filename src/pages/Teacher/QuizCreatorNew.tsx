import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Eye, X, Trophy, Sparkles } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  marks: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  section: string;
  total_marks: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export default function QuizCreatorNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    section: '',
    durationMinutes: 30,
    enableRankings: true,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 1,
    },
  ]);

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  };

  const validateQuiz = () => {
    if (!formData.title.trim()) {
      alert('Please enter a quiz title');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        alert(`Please enter text for Question ${i + 1}`);
        return false;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        alert(`Please fill all options for Question ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateQuiz()) return;

    try {
      const totalMarks = calculateTotalMarks();

      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([{
          teacher_id: user?.id,
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          grade: formData.grade,
          section: formData.section,
          total_marks: totalMarks,
          duration_minutes: formData.durationMinutes,
          is_active: true,
        }])
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions
      const questionsData = questions.map((q, index) => ({
        quiz_id: quiz.id,
        question_text: q.questionText,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_answer: q.correctAnswer,
        marks: q.marks,
        question_order: index + 1,
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsData);

      if (questionsError) throw questionsError;

      alert(`Quiz created successfully! ${formData.enableRankings ? 'Rankings enabled.' : 'Rankings disabled.'}`);
      resetForm();
      fetchQuizzes();
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      subject: '',
      grade: '',
      section: '',
      durationMinutes: 30,
      enableRankings: true,
    });
    setQuestions([{
      id: '1',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 1,
    }]);
  };

  const handlePreview = () => {
    setPreviewIndex(0);
    setShowPreview(true);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Creator</h1>
          <p className="text-gray-600 mt-1">Create quizzes with multiple choice questions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
          >
            <Trophy size={20} />
            View Leaderboard
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Quiz
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="space-y-6">
          {/* Quiz Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Quiz Details</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Chapter 1 Quiz"
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
                  rows={2}
                  placeholder="Brief description of the quiz"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Math"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  id="rankings"
                  checked={formData.enableRankings}
                  onChange={(e) => setFormData({ ...formData, enableRankings: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="rankings" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-600" />
                  Enable Rankings & Leaderboard for this quiz
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Questions ({questions.length}) - Total: {calculateTotalMarks()} marks
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Eye size={18} />
                  Preview
                </button>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus size={18} />
                  Add Question
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={question.marks}
                        onChange={(e) => updateQuestion(question.id, 'marks', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                      <span className="text-sm text-gray-600">marks</span>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                    rows={2}
                    placeholder="Enter your question here"
                  />

                  <div className="space-y-2">
                    {(['A', 'B', 'C', 'D'] as const).map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === option}
                          onChange={() => updateQuestion(question.id, 'correctAnswer', option)}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="font-medium text-gray-700 w-8">{option}.</span>
                        <input
                          type="text"
                          value={question[`option${option}` as keyof Question] as string}
                          onChange={(e) => updateQuestion(question.id, `option${option}`, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${option}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✓ Correct Answer: {question.correctAnswer}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Save size={20} />
                Create Quiz
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* AI Placeholder */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={24} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Auto Create with AI</h3>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                Coming Soon
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Generate quiz questions automatically using AI based on your topic and difficulty level.
            </p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{formData.title || 'Quiz Preview'}</h2>
                  <p className="text-gray-600 mt-1">{formData.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      Question {previewIndex + 1} of {questions.length}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {formData.durationMinutes} minutes
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {questions[previewIndex] && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {questions[previewIndex].questionText || 'Question text will appear here'}
                  </h3>

                  <div className="space-y-3">
                    {(['A', 'B', 'C', 'D'] as const).map((option) => (
                      <div
                        key={option}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input type="radio" name="preview-answer" className="w-4 h-4" />
                        <span className="font-medium">{option}.</span>
                        <span>{questions[previewIndex][`option${option}` as keyof Question] || `Option ${option}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                  disabled={previewIndex === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewIndex(Math.min(questions.length - 1, previewIndex + 1))}
                  disabled={previewIndex === questions.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      {!showForm && quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
              {quiz.description && (
                <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {quiz.subject && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {quiz.subject}
                  </span>
                )}
                {quiz.grade && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Grade {quiz.grade}
                  </span>
                )}
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                  {quiz.total_marks} marks
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                  {quiz.duration_minutes} min
                </span>
              </div>
              <div className={`text-sm font-medium ${quiz.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                {quiz.is_active ? '● Active' : '○ Inactive'}
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && quizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
          <p className="text-gray-600 mb-4">Create your first quiz to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Quiz
          </button>
        </div>
      )}
    </div>
  );
}
