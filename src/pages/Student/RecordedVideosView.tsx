import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CustomVideoPlayer from '../../components/VideoPlayer/CustomVideoPlayer';
import { Video, Play, Star, TrendingUp, Clock, CheckCircle, X } from 'lucide-react';

interface RecordedVideo {
  id: string;
  title: string;
  description: string;
  youtube_video_id: string;
  category: string;
  subject: string;
  topic: string;
  difficulty_level: string;
  grade: string;
  is_featured: boolean;
  view_count: number;
  profiles: {
    full_name: string;
  };
}

interface WatchHistory {
  watch_percentage: number;
  is_completed: boolean;
  last_watched_at: string;
}

export default function RecordedVideosView() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<RecordedVideo[]>([]);
  const [watchHistory, setWatchHistory] = useState<Record<string, WatchHistory>>({});
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<RecordedVideo | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    fetchVideos();
    fetchWatchHistory();
  }, [user]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('recorded_videos')
        .select('*, profiles!recorded_videos_teacher_id_fkey(full_name)')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('video_watch_history')
        .select('video_id, watch_percentage, is_completed, last_watched_at')
        .eq('student_id', user?.id);

      if (error) throw error;

      const historyMap: Record<string, WatchHistory> = {};
      data?.forEach(item => {
        historyMap[item.video_id] = {
          watch_percentage: item.watch_percentage,
          is_completed: item.is_completed,
          last_watched_at: item.last_watched_at,
        };
      });
      setWatchHistory(historyMap);
    } catch (error) {
      console.error('Error fetching watch history:', error);
    }
  };

  const handleProgress = async (videoId: string, seconds: number, percentage: number) => {
    try {
      await supabase
        .from('video_watch_history')
        .upsert({
          student_id: user?.id,
          video_id: videoId,
          watch_duration_seconds: Math.floor(seconds),
          watch_percentage: percentage,
          is_completed: percentage >= 80,
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,video_id'
        });

      // Update local state
      setWatchHistory(prev => ({
        ...prev,
        [videoId]: {
          watch_percentage: percentage,
          is_completed: percentage >= 80,
          last_watched_at: new Date().toISOString(),
        }
      }));
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  };

  const filteredVideos = videos.filter(video => {
    if (filterCategory !== 'all' && video.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && video.difficulty_level !== filterDifficulty) return false;
    return true;
  });

  const featuredVideos = filteredVideos.filter(v => v.is_featured);
  const continueWatching = filteredVideos.filter(v => {
    const history = watchHistory[v.id];
    return history && !history.is_completed && history.watch_percentage > 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
        <p className="text-gray-600 mt-1">Browse and watch educational videos</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="tutorial">Tutorial</option>
              <option value="lecture">Lecture</option>
              <option value="demonstration">Demonstration</option>
              <option value="review">Review</option>
              <option value="practice">Practice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock size={24} className="text-blue-600" />
            Continue Watching
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueWatching.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                watchHistory={watchHistory[video.id]}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star size={24} className="text-yellow-500" fill="currentColor" />
            Featured Videos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                watchHistory={watchHistory[video.id]}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Videos */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video size={24} className="text-gray-600" />
          All Videos ({filteredVideos.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              watchHistory={watchHistory[video.id]}
              onClick={() => setSelectedVideo(video)}
            />
          ))}
        </div>
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedVideo.title}</h2>
                <p className="text-gray-600 mt-1">{selectedVideo.profiles.full_name}</p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <CustomVideoPlayer
                videoId={selectedVideo.youtube_video_id}
                title={selectedVideo.title}
                onProgress={(seconds, percentage) => handleProgress(selectedVideo.id, seconds, percentage)}
                onComplete={() => handleProgress(selectedVideo.id, 0, 100)}
                isLive={false}
              />

              {watchHistory[selectedVideo.id] && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Your Progress</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {Math.round(watchHistory[selectedVideo.id].watch_percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${watchHistory[selectedVideo.id].watch_percentage}%` }}
                    />
                  </div>
                  {watchHistory[selectedVideo.id].is_completed && (
                    <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-medium">
                      <CheckCircle size={16} />
                      Completed
                    </div>
                  )}
                </div>
              )}

              {selectedVideo.description && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">About this video</h3>
                  <p className="text-gray-600">{selectedVideo.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {selectedVideo.category && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full capitalize">
                    {selectedVideo.category}
                  </span>
                )}
                {selectedVideo.difficulty_level && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full capitalize">
                    {selectedVideo.difficulty_level}
                  </span>
                )}
                {selectedVideo.subject && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {selectedVideo.subject}
                  </span>
                )}
                {selectedVideo.topic && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {selectedVideo.topic}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Card Component
function VideoCard({ video, watchHistory, onClick }: {
  video: RecordedVideo;
  watchHistory?: WatchHistory;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-video bg-gray-900">
        <img
          src={`https://img.youtube.com/vi/${video.youtube_video_id}/mqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Play size={32} className="text-blue-600 ml-1" fill="currentColor" />
          </div>
        </div>
        {video.is_featured && (
          <div className="absolute top-2 right-2">
            <Star size={20} className="text-yellow-400" fill="currentColor" />
          </div>
        )}
        {watchHistory?.is_completed && (
          <div className="absolute top-2 left-2">
            <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
              <CheckCircle size={12} />
              Completed
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
          <TrendingUp size={12} />
          {video.view_count} views
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
        )}

        {watchHistory && watchHistory.watch_percentage > 0 && !watchHistory.is_completed && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(watchHistory.watch_percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${watchHistory.watch_percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>
    </div>
  );
}
