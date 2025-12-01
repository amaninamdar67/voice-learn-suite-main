import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Trash2, Edit2, X, Trophy } from 'lucide-react';

interface VideoLesson {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  subject: string;
  grade: string;
  section: string;
  created_at: string;
}

export default function VideoLessonUpload() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<VideoLesson | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    subject: '',
    difficulty: 'beginner',
  });

  useEffect(() => {
    fetchLessons();
  }, [user]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('video_lessons')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoId = extractVideoId(formData.youtubeUrl);
    if (!videoId) {
      alert('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      return;
    }

    try {
      if (editingLesson) {
        // Update existing lesson
        const { error } = await supabase
          .from('video_lessons')
          .update({
            title: formData.title,
            description: formData.description,
            youtube_url: formData.youtubeUrl,
            youtube_video_id: videoId,
            subject: formData.subject,
            difficulty: formData.difficulty,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLesson.id);

        if (error) throw error;
        alert('Lesson updated successfully!');
      } else {
        // Create new lesson
        const { error } = await supabase
          .from('video_lessons')
          .insert([{
            teacher_id: user?.id,
            title: formData.title,
            description: formData.description,
            youtube_url: formData.youtubeUrl,
            youtube_video_id: videoId,
            subject: formData.subject,
            difficulty: formData.difficulty,
          }]);

        if (error) throw error;
        alert('Lesson created successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        youtubeUrl: '',
        subject: '',
        difficulty: 'beginner',
      });
      setShowForm(false);
      setEditingLesson(null);
      fetchLessons();
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (lesson: VideoLesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      youtubeUrl: lesson.youtube_url,
      subject: lesson.subject || '',
      difficulty: lesson.difficulty || 'beginner',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const { error } = await supabase
        .from('video_lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Lesson deleted successfully!');
      fetchLessons();
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      alert('Error: ' + error.message);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      subject: '',
      grade: '',
      section: '',
    });
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
        <h1 className="text-3xl font-bold text-gray-900">Video Lessons</h1>
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
              Upload Course
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
            </h2>
            <button onClick={cancelForm} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson title"
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
                placeholder="Enter lesson description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL *
              </label>
              <input
                type="text"
                required
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingLesson ? 'Update Course' : 'Upload Course'}
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
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <img
                src={`https://img.youtube.com/vi/${lesson.youtube_video_id}/mqdefault.jpg`}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <Play size={32} className="text-white ml-1" fill="white" />
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{lesson.title}</h3>
              {lesson.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {lesson.subject && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {lesson.subject}
                  </span>
                )}
                {lesson.grade && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Grade {lesson.grade}
                  </span>
                )}
                {lesson.section && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    Section {lesson.section}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(lesson)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(lesson.id)}
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

      {lessons.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Play size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No video lessons yet</h3>
          <p className="text-gray-600 mb-4">Create your first video lesson to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Lesson
          </button>
        </div>
      )}
    </div>
  );
}
