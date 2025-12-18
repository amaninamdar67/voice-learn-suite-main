import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageCircle, ThumbsUp, Send, AlertCircle } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  anonymous_nickname: string;
  title: string;
  content: string;
  subject: string;
  is_anonymous: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  user_liked?: boolean;
  student_name?: string;
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  anonymous_nickname: string;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
  user_liked?: boolean;
}

export default function MentorCommunity() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [replyContent, setReplyContent] = useState('');
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.id) {
      fetchStudentCommunityPosts();
    }
  }, [user?.id]);

  const fetchStudentCommunityPosts = async () => {
    try {
      setLoading(true);

      // Step 1: Get all students assigned to this mentor
      const { data: mentorLinks, error: linksError } = await supabase
        .from('mentor_student_links')
        .select('student_id')
        .eq('mentor_id', user?.id);

      if (linksError) throw linksError;

      const studentIds = mentorLinks?.map(link => link.student_id) || [];

      if (studentIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Step 2: Get student names
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      const nameMap = new Map(students?.map(s => [s.id, s.full_name]) || []);
      setStudentNames(Object.fromEntries(nameMap));

      // Step 3: Get posts from these students
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .in('user_id', studentIds)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Step 4: Fetch user likes
      const { data: likes } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', user?.id)
        .not('post_id', 'is', null);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);

      const formattedPosts = postsData?.map(post => ({
        ...post,
        user_liked: likedPostIds.has(post.id),
        student_name: nameMap.get(post.user_id) || 'Unknown',
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching student community posts:', error);
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

      // Fetch user likes for replies
      const { data: likes } = await supabase
        .from('community_likes')
        .select('reply_id')
        .eq('user_id', user?.id)
        .not('reply_id', 'is', null);

      const likedReplyIds = new Set(likes?.map(l => l.reply_id) || []);

      const formattedReplies = repliesData?.map(reply => ({
        ...reply,
        user_liked: likedReplyIds.has(reply.id),
      })) || [];

      setReplies(prev => ({ ...prev, [postId]: formattedReplies }));
    } catch (error) {
      console.error('Error fetching replies:', error);
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
              user_liked: !currentlyLiked,
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
          anonymous_nickname: `Mentor_${Math.random().toString(36).substr(2, 9)}`,
          content: replyContent,
          is_anonymous: false,
        });

      if (error) throw error;

      setReplyContent('');
      fetchReplies(postId);
      fetchStudentCommunityPosts();
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
        <div className="text-gray-600">Loading community...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Community</h1>
        <p className="text-gray-600 mt-1">Monitor your students' discussions and posts</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold">Viewing posts from your assigned students</p>
          <p className="text-blue-800 mt-1">You can view and reply to discussions to provide guidance and support</p>
        </div>
      </div>

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
                  <span className="font-semibold">{post.anonymous_nickname}</span>
                  {post.student_name && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                      {post.student_name}
                    </span>
                  )}
                  {post.is_anonymous && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      Anonymous
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
                {/* Reply Input */}
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

                {/* Replies List */}
                {replies[post.id]?.map((reply) => (
                  <div key={reply.id} className="flex gap-3 pl-6 border-l-2 border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {reply.anonymous_nickname[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{reply.anonymous_nickname}</span>
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
          <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Your students haven't posted any discussions yet</p>
        </div>
      )}
    </div>
  );
}
