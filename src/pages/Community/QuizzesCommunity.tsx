import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageCircle, ThumbsUp, Send, X, Eye, EyeOff, Brain, Edit2, Trash2 } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  anonymous_nickname: string;
  real_name?: string;
  title: string;
  content: string;
  subject: string;
  page_source?: string;
  is_anonymous: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  edited_at?: string;
  is_edited?: boolean;
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
  edited_at?: string;
  is_edited?: boolean;
  user_liked?: boolean;
}

export default function QuizzesCommunity() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterPageSource, setFilterPageSource] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterChild, setFilterChild] = useState('all');
  const [children, setChildren] = useState<Array<{id: string, name: string}>>([]);
  const [myStudentIds, setMyStudentIds] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');

  const canSeeRealIdentity = user?.role === 'mentor' || user?.role === 'parent';
  const canComment = user?.role === 'student' || user?.role === 'teacher';

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    subject: '',
  });

  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchPosts();
    if (user?.role === 'parent') {
      fetchChildren();
    }
    if (user?.role === 'mentor') {
      fetchMyStudents();
    }
  }, [user]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('parent_id', user?.id);
      
      if (error) throw error;
      setChildren(data?.map(c => ({ id: c.id, name: c.full_name })) || []);
      
      // Default to first child if exists
      if (data && data.length > 0) {
        setFilterChild(data[0].id);
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(`Failed to delete post: ${error.message}`);
    }
  };

  const handleEditReply = (reply: Reply) => {
    setEditingReply(reply.id);
    setEditContent(reply.content);
  };

  const handleSaveReply = async (replyId: string, postId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/community/replies/${replyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) throw new Error('Failed to update reply');

      setEditingReply(null);
      fetchReplies(postId);
      alert('Reply updated successfully!');
    } catch (error: any) {
      console.error('Error deleting reply:', error);
      alert(`Failed to delete reply: ${error.message}`);
    }
  };

  const subjects = ['all', ...new Set(posts.map(p => p.subject).filter(Boolean))];
  const pageSources = ['all', ...new Set(posts.map(p => p.page_source).filter(Boolean))];
  
  const filteredPosts = posts.filter(post => {
    // Filter by subject
    if (filterSubject !== 'all' && post.subject !== filterSubject) return false;
    
    // Filter by page source
    if (filterPageSource !== 'all' && post.page_source !== filterPageSource) return false;
    
    // Filter for mentors - show only their students
    if (user?.role === 'mentor' && filterStudent === 'my-students') {
      if (!myStudentIds.includes(post.user_id)) return false;
    }
    
    // Filter for parents - show only selected child
    if (user?.role === 'parent') {
      if (filterChild !== 'all' && post.user_id !== filterChild) return false;
    }
    
    return true;
  });

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
            <Brain size={32} className="text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Quizzes Discussion</h1>
          </div>
          <p className="text-gray-600">Discuss quizzes, questions, and test strategies</p>
        </div>
        {canComment && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle size={20} />
            New Post
          </button>
        )}
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

      {!canComment && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Eye size={20} />
            <span className="font-medium">
              You can view all discussions. Only students and teachers can post and reply.
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Page</label>
            <select
              value={filterPageSource}
              onChange={(e) => setFilterPageSource(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Pages</option>
              {pageSources.filter(p => p !== 'all').map(pageSource => (
                <option key={pageSource} value={pageSource}>📍 {pageSource}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {subjects.filter(s => s !== 'all').map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {user?.role === 'mentor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Student</label>
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Students</option>
                <option value="my-students">My Students Only</option>
              </select>
            </div>
          )}

          {user?.role === 'parent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Child</label>
              <select
                value={filterChild}
                onChange={(e) => setFilterChild(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Children</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6 relative">
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
                    <span className="px-2 py-0.5 bg-blue-100 text-purple-600 text-xs rounded">
                      Real Identity Visible
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    • {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  {post.is_edited && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded italic">
                      edited
                    </span>
                  )}
                </div>
                {post.page_source && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded mb-2 mr-2">
                    📍 from {post.page_source}
                  </span>
                )}
                {post.subject && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mb-2">
                    {post.subject}
                  </span>
                )}
                
                {editingPost === post.id ? (
                  // Edit Mode
                  <div className="space-y-3 mt-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="Subject (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Edit your post..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSavePost(post.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPost(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    {post.title && (
                      <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    )}
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  </>
                )}
              </div>
            </div>
            
            {/* Edit button in bottom right - only show if not editing and user owns post */}
            {!editingPost && post.user_id === user?.id && (
              <button
                onClick={() => handleEditPost(post)}
                className="absolute bottom-4 right-4 text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-1 text-sm"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            )}

            <div className="flex items-center gap-6 pt-4 border-t">
              <button
                onClick={() => handleLikePost(post.id, post.user_liked || false)}
                className={`flex items-center gap-2 transition-colors ${
                  post.user_liked 
                    ? 'text-purple-600' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <ThumbsUp size={18} fill={post.user_liked ? 'currentColor' : 'none'} />
                <span className="font-medium">{post.likes_count}</span>
              </button>

              <button
                onClick={() => handleViewReplies(post.id)}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
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
                  <div key={reply.id} className="flex gap-3 pl-6 border-l-2 border-gray-200 relative">
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
                        {reply.is_edited && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded italic">
                            edited
                          </span>
                        )}
                      </div>
                      
                      {editingReply === reply.id ? (
                        // Edit Mode
                        <div className="space-y-2 mt-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Edit your reply..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveReply(reply.id, post.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingReply(null)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteReply(reply.id, post.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors ml-auto flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                          {reply.user_id === user?.id && (
                            <button
                              onClick={() => handleEditReply(reply)}
                              className="mt-1 text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-1 text-xs"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                          )}
                        </>
                      )}
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
          <Brain size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
          <p className="text-gray-600 mb-4">Start a discussion about recorded classes!</p>
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
                <p className="text-gray-600 mt-1">Share your thoughts about quizzes</p>
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
                  placeholder="Share your thoughts about quizzes..."
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



