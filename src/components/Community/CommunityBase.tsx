import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageCircle, ThumbsUp, Send, X, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';

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

interface CommunityBaseProps {
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
}

export default function CommunityBase({ category, title, description, icon, iconColor }: CommunityBaseProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [loading, setLoading] = useState(true);
