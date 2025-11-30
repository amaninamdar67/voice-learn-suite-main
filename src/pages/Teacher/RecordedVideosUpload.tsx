import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Video, Plus, Trash2, Edit2, X, Star } from 'lucide-react';

interface RecordedVideo {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  category: string;
  subject: string;
  topic: string;
  difficulty_level: string;
  grade: string;
  is_featured: boolean;
  view_count: number;
  created_at: string;
}

export default function RecordedVideosUpload() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<RecordedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<RecordedVideo | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: '',
    subject: '',
    topic: '',
    difficultyLevel: '',
    grade: '',
    isFeatured: false,
  });

  useEffect(() => {
    fetchVideos();
  }, [user]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('recorded_videos')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
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
      if (editingVideo) {
        const { error } = await supabase
          .from('recorded_videos')
          .update({
            title: formData.title,
            description: formData.description,
            youtube_url: formData.youtubeUrl,
            youtube_video_id: videoId,
            category: formData.category,
            subject: formData.subject,
            topic: formData.topic,
            difficulty_level: formData.difficultyLevel,
            grade: formData.grade,
            is_featured: formData.isFeatured,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingVideo.id);

        if (error) throw error;
        alert('Video updated successfully!');
      } else {
        const { error } = await supabase
          .from('recorded_videos')
          .insert([{
            teacher_id: user?.id,
            title: formData.title,
            description: formData.description,
            youtube_url: formData.youtubeUrl,
            youtube_video_id: videoId,
            category: formData.category,
            subject: formData.subject,
            topic: formData.topic,
            difficulty_level: formData.difficultyLevel,
            grade: formData.grade,
            is_featured: formData.isFeatured,
          }]);

        if (error) throw error;
        alert('Video uploaded successfully!');
      }

      resetForm();
      fetchVideos();
    } catch (error: any) {
      console.error('Error saving video:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (video: RecordedVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtubeUrl: video.youtube_url,
      category: video.category || '',
      subject: video.subject || '',
      topic: video.topic || '',
      difficultyLevel: video.difficulty_level || '',
      grade: video.grade || '',
      isFeatured: video.is_featured || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('recorded_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Video deleted successfully!');
      fetchVideos();
    } catch (error: any) {
      console.error('Error deleting video:', error);
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      category: '',
      subject: '',
      topic: '',
      difficultyLevel: '',
      grade: '',
      isFeatured: false,
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recorded Videos</h1>
          <p className="text-gray-600 mt-1">Upload and manage your video library</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Upload Video
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingVideo ? 'Edit Video' : 'Upload New Video'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                Paste the YouTube video URL here
              </p>
            </div>

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
                placeholder="Enter video title"
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
                placeholder="Enter video description (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="lecture">Lecture</option>
                  <option value="demonstration">Demonstration</option>
                  <option value="review">Review</option>
                  <option value="practice">Practice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
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
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Algebra"
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
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Star size={16} className="text-yellow-500" />
                Mark as Featured Video
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingVideo ? 'Update Video' : 'Upload Video'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <img
                src={`https://img.youtube.com/vi/${video.youtube_video_id}/mqdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              {video.is_featured && (
                <div className="absolute top-2 right-2">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                {video.view_count} views
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
              {video.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {video.category && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
                    {video.category}
                  </span>
                )}
                {video.difficulty_level && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded capitalize">
                    {video.difficulty_level}
                  </span>
                )}
                {video.subject && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {video.subject}
                  </span>
                )}
                {video.grade && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Grade {video.grade}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
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

      {videos.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Video size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
          <p className="text-gray-600 mb-4">Upload your first video to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Upload Video
          </button>
        </div>
      )}
    </div>
  );
}
