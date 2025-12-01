import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PageCommentBoxProps {
  pageName: string;
  category?: 'recorded-classes' | 'courses' | 'live-classes' | 'general';
}

export default function PageCommentBox({ pageName, category = 'general' }: PageCommentBoxProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const generateNickname = () => {
    const adjectives = ['Smart', 'Curious', 'Bright', 'Clever', 'Wise', 'Quick', 'Sharp'];
    const nouns = ['Student', 'Learner', 'Scholar', 'Thinker', 'Mind', 'Brain'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  };

  const handleSendComment = async () => {
    if (!comment.trim() || !user) return;

    try {
      setSending(true);

      // Insert comment into community_posts
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          anonymous_nickname: generateNickname(),
          content: comment,
          page_source: pageName,
          category: category,
          is_anonymous: true,
          parent_visible: true,
        });

      if (error) throw error;

      // Show success message with details
      console.log('Comment saved:', { pageName, category, content: comment });
      alert(`Comment sent successfully!\nPage: ${pageName}\nCategory: ${category}`);
      setComment('');
    } catch (error: any) {
      console.error('Error sending comment:', error);
      alert('Failed to send comment: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Write a comment..."
          disabled={sending}
          className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <button
          onClick={handleSendComment}
          disabled={!comment.trim() || sending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
      <span className="text-xs text-gray-500">
        Category: {category} | Page: {pageName}
      </span>
    </div>
  );
}
