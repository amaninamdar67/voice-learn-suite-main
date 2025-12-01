import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageCircle, ThumbsUp, Send, X, Eye, EyeOff, Radio } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  anonymous_nickname: string;
  real_name?: string;
  title: string;
  content: string;
  subject: string;
  is_anonymous: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  user_liked?: boolean;
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  anonymous_nickname: string;
  real_name?: string;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
  user_liked?: boolean;
}

export default function LiveClassesCommunity() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('all');

  const canSeeRealIdentity = user?.role === 'mentor' || user?.role === 'parent';

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    subject: '',
  });

  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const generateNickname = () => {
    const adjectives = ['Smart', 'Curious', 'Bright', 'Clever', 'Wise', 'Quick', 'Sharp'];
    const nouns = ['Student', 'Learner', 'Scholar', 'Thinker', 'Mind', 'Brain'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch all posts to show comments from all pages
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch real names if user is mentor/parent
      let realNames = new Map();
      if (canSeeRealIdentity) {
        const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        realNames = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      }

      // Fetch user likes
      const { data: likes } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', user?.id)
        .not('post_id', 'is', null);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);

      const formattedPosts = postsData?.map(post => ({
        ...post,
        real_name: realNames.get(post.user_id),
        user_liked: likedPostIds.has(post.id),
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (postId: string) => {
    try {
      const { data: repliesData, error } = await supabase
        .from('community_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch real names if user is mentor/parent
      let realNames = new Map();
      if (canSeeRealIdentity) {
        const userIds = [...new Set(repliesData?.map(r => r.user_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        realNames = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      }

      // Fetch user likes for replies
      const { data: likes } = await supabase
        .from('community_likes')
        .select('reply_id')
        .eq('user_id', user?.id)
        .not('reply_id', 'is', null);

      const likedReplyIds = new Set(likes?.map(l => l.reply_id) || []);

      const formattedReplies = repliesData?.map(reply => ({
        ...reply,
        real_name: realNames.get(reply.user_id),
        user_liked: likedReplyIds.has(reply.id),
      })) || [];

      setReplies(prev => ({ ...prev, [postId]: formattedReplies }));
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content) {
      alert('Please write something');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user?.id,
          anonymous_nickname: generateNickname(),
          title: newPost.title,
          content: newPost.content,
          subject: newPost.subject,
          category: 'live-classes',
          is_anonymous: true,
        });

      if (error) throw error;

      alert('Post created successfully!');
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', subject: '' });
      fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert('Failed to create post: ' + error.message);
    }
  };

  const handleLikePost = async (postId: string, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id);
      } else {
        await supabase
          .from('community_likes')
          .insert({
            post_id: postId,
            user_id: user?.id,
          });
      }

      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: post.likes_count + (currentlyLiked ? -1 : 1),
              user_liked: !currentlyLiked 
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleReply = async (postId: string) => {
    if (!replyContent.trim()) return;

    try {
      const { error } = await supabase
        .from('community_replies')
        .insert({
          post_id: postId,
          user_id: user?.id,
          anonymous_nickname: generateNickname(),
          content: replyContent,
          is_anonymous: true,
        });

      if (error) throw error;

      setReplyContent('');
      fetchReplies(postId);
      fetchPosts();
    } catch (error: any) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply: ' + error.message);
    }
  };

  const handleViewReplies = (postId: string) => {
    if (selectedPost === postId) {
      setSelectedPost(null);
    } else {
      setSelectedPost(postId);
      if (!replies[postId]) {
        fetchReplies(postId);
      }
    }
  };

  const subjects = ['all', ...new Set(posts.map(p => p.subject).filter(Boolean))];
  const filteredPosts = filterSubject === 'all' 
    ? posts 
    : posts.filter(p => p.subject === filterSubject);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading discussions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Radio size={32} className="text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Live Classes Discussion</h1>
          </div>
          <p className="text-gray-600">Discuss live streaming classes and real-time learning</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle size={20} />
          New Post
        </button>
      </div>

      {canSeeRealIdentity && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <Eye size={20} />
            <span className="font-medium">
              As a {user?.role}, you can see real names and student details
            </span>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Subjects</option>
          {subjects.filter(s => s !== 'all').map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {post.anonymous_nickname[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {canSeeRealIdentity ? post.real_name : post.anonymous_nickname}
                  </span>
                  {!canSeeRealIdentity && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      Anonymous
                    </span>
                  )}
                  {canSeeRealIdentity && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                      Real Identity Visible
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    • {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                {post.subject && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mb-2">
                    {post.subject}
                  </span>
                )}
                {post.title && (
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                )}
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t">
              <button
                onClick={() => handleLikePost(post.id, post.user_liked || false)}
                className={`flex items-center gap-2 transition-colors ${
                  post.user_liked 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <ThumbsUp size={18} fill={post.user_liked ? 'currentColor' : 'none'} />
                <span className="font-medium">{post.likes_count}</span>
              </button>

              <button
                onClick={() => handleViewReplies(post.id)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle size={18} />
                <span className="font-medium">{post.replies_count}</span>
                <span className="text-sm">Replies</span>
              </button>
            </div>

            {/* Replies Section */}
            {selectedPost === post.id && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleReply(post.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleReply(post.id)}
                    disabled={!replyContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>

                {replies[post.id]?.map((reply) => (
                  <div key={reply.id} className="flex gap-3 pl-6 border-l-2 border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {reply.anonymous_nickname[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {canSeeRealIdentity ? reply.real_name : reply.anonymous_nickname}
                        </span>
                        <span className="text-xs text-gray-500">
                          • {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{reply.content}</p>
                    </div>
                  </div>
                ))}

                {replies[post.id]?.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No replies yet. Be the first to reply!
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Radio size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
          <p className="text-gray-600 mb-4">Start a discussion about live classes!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Post
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Create Post</h2>
                <p className="text-gray-600 mt-1">Share your thoughts about live classes</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <EyeOff size={20} />
                <span className="text-sm text-blue-900">
                  Posting as: <strong>Anonymous</strong> (Mentors & Parents can see your real name)
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Give your post a title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={newPost.subject}
                  onChange={(e) => setNewPost({ ...newPost, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics, Physics..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts about live classes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.content}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Post
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
