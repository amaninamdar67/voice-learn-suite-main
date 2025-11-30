import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Clock, Award, CheckCircle, X, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  total_marks: number;
  duration_minutes: number;
  is_active: boolean;
  profiles: {
    full_name: string;
  };
}

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  marks: number;
  question_order: number;
}

interface QuizResult {
  score: number;
  percentage: number;
  attempted_at: string;
}

export default function QuizzesView() {
  const { user, profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    fetchQuizzes();
    fetchResults();
  }, [user, profile]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch teacher names separately
      if (data && data.length > 0) {
        const teacherIds = [...new Set(data.map(q => q.teacher_id))];
        const { data: teachers } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', teacherIds);
        
        const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]) || []);
        const quizzesWithTeachers = data.map(quiz => ({
          ...quiz,
          profiles: { full_name: teacherMap.get(quiz.teacher_id) || 'Unknown' }
        }));
        
        setQuizzes(quizzesWithTeachers);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('quiz_id, score, percentage, attempted_at')
        .eq('student_id', user?.id)
        .eq('is_completed', true);

      if (error) throw error;

      const resultsMap: Record<string, QuizResult> = {};
      data?.forEach(result => {
        resultsMap[result.quiz_id] = {
          score: result.score,
          percentage: result.percentage,
          attempted_at: result.attempted_at,
        };
      });
      setResults(resultsMap);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('question_order', { ascending: true });

      if (error) throw error;

      setQuestions(data || []);
      setSelectedQuiz(quiz);
      setCurrentQuestion(0);
      setAnswers({});
      setStartTime(new Date());
      setShowResults(false);
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz || !startTime) return;

    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      const endTime = new Date();
      const timeTaken = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Calculate score
      let score = 0;
      questions.forEach(question => {
        if (answers[question.id] === question.correct_answer) {
          score += question.marks;
        }
      });

      const percentage = (score / selectedQuiz.total_marks) * 100;

      // Submit to database
      const { data, error } = await supabase
        .from('quiz_results')
        .insert([{
          student_id: user?.id,
          quiz_id: selectedQuiz.id,
          score,
          total_marks: selectedQuiz.total_marks,
          percentage,
          time_taken_seconds: timeTaken,
          answers,
          is_completed: true,
          completed_at: endTime.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      setQuizResult(data);
      setShowResults(true);
      fetchResults(); // Refresh results
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleCloseQuiz = () => {
    setSelectedQuiz(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setStartTime(null);
    setShowResults(false);
    setQuizResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading quizzes...</div>
      </div>
    );
  }

  // Quiz Taking View
  if (selectedQuiz && !showResults) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 z-[100] overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 py-12">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{selectedQuiz.title}</h1>
                {selectedQuiz.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedQuiz.description}</p>
                )}
              </div>
              <button
                onClick={handleCloseQuiz}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close quiz"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
                <FileText size={16} />
                <span className="font-medium">Question {currentQuestion + 1} of {questions.length}</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
                <Award size={16} />
                <span className="font-medium">{selectedQuiz.total_marks} marks</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full">
                <Clock size={16} />
                <span className="font-medium">{selectedQuiz.duration_minutes} min</span>
              </span>
            </div>

            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="absolute right-0 -top-6 text-xs font-semibold text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Question Card */}
          {question && (
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-4">
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-5">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-sm">
                    Q{currentQuestion + 1}
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-sm">
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-semibold leading-relaxed break-words whitespace-pre-wrap text-gray-800">
                  {question.question_text}
                </h2>
              </div>

              <div className="space-y-3 mb-6">
                {['A', 'B', 'C', 'D'].map((option) => {
                  const optionText = question[`option_${option.toLowerCase()}` as keyof Question] as string;
                  const isSelected = answers[question.id] === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(question.id, option)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                        }`}>
                          {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                        </div>
                        <span className="font-semibold text-gray-700 flex-shrink-0">{option}.</span>
                        <span className="flex-1 break-words">{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between gap-4">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>

                {currentQuestion === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <CheckCircle size={20} />
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results View
  if (showResults && quizResult) {
    const passed = quizResult.percentage >= 60;

    return (
      <div className="fixed inset-0 bg-gray-50 z-[100] overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              {passed ? (
                <Trophy size={80} className="mx-auto text-yellow-500" />
              ) : (
                <FileText size={80} className="mx-auto text-gray-400" />
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Quiz Completed'}
            </h1>
            <p className="text-gray-600 mb-8">
              {passed ? 'You passed the quiz!' : 'Keep practicing to improve your score'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {quizResult.score}/{quizResult.total_marks}
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(quizResult.percentage)}%
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseQuiz}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Back to Quizzes
              </button>
              <button
                onClick={() => window.location.href = `/student/quiz-rankings/${selectedQuiz?.id}`}
                className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold flex items-center justify-center gap-2"
              >
                <Trophy size={20} />
                View Rankings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz List View
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
        <p className="text-gray-600 mt-1">Test your knowledge and track your progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => {
          const result = results[quiz.id];
          const hasAttempted = !!result;

          return (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1">{quiz.title}</h3>
                  {hasAttempted && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                </div>

                {quiz.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award size={16} />
                    <span>{quiz.total_marks} marks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{quiz.duration_minutes} minutes</span>
                  </div>
                </div>

                {hasAttempted && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">
                      Last Score: {result.score}/{quiz.total_marks} ({Math.round(result.percentage)}%)
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
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
                </div>

                <div className="text-sm text-gray-600">
                  By {quiz.profiles.full_name}
                </div>
              </div>

              {/* Button at bottom with fixed position */}
              <div className="p-4 bg-gray-50 border-t">
                <button
                  onClick={() => handleStartQuiz(quiz)}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
          <p className="text-gray-600">Check back later for new quizzes</p>
        </div>
      )}
    </div>
  );
}
