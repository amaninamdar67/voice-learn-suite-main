import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react';

interface Message {
  id: string;
  mentor_id: string;
  parent_id: string;
  student_id: string;
  message: string;
  message_type: 'text' | 'alert' | 'update';
  is_read: boolean;
  created_at: string;
  mentor?: { full_name: string; avatar_url?: string };
  parent?: { full_name: string; avatar_url?: string };
  student?: { full_name: string };
}

interface MentorParentChatProps {
  mentorId: string;
  parentId: string;
  studentId: string;
  studentName: string;
  currentUserId: string;
  currentUserRole: 'mentor' | 'parent';
}

export const MentorParentChat: React.FC<MentorParentChatProps> = ({
  mentorId,
  parentId,
  studentId,
  studentName,
  currentUserId,
  currentUserRole
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [mentorId, parentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/mentor-parent/conversations/${mentorId}/${parentId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/mentor-parent/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId,
          parentId,
          studentId,
          message: inputValue,
          messageType: 'text',
          senderId: currentUserId
        })
      });

      if (response.ok) {
        setInputValue('');
        await loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMessageColor = (type: string, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      // Mentor/Current user messages - Blue
      switch (type) {
        case 'alert':
          return 'bg-blue-600/40 border-blue-500/60 shadow-lg shadow-blue-500/20';
        case 'update':
          return 'bg-blue-600/40 border-blue-500/60 shadow-lg shadow-blue-500/20';
        default:
          return 'bg-blue-600/40 border-blue-500/60 shadow-lg shadow-blue-500/20';
      }
    } else {
      // Parent messages - Warm Brown/Tan
      switch (type) {
        case 'alert':
          return 'bg-amber-700/40 border-amber-600/60 shadow-lg shadow-amber-600/20';
        case 'update':
          return 'bg-amber-700/40 border-amber-600/60 shadow-lg shadow-amber-600/20';
        default:
          return 'bg-amber-700/40 border-amber-600/60 shadow-lg shadow-amber-600/20';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {currentUserRole === 'mentor' ? 'Parent' : 'Mentor'} - {studentName}
          </h3>
          <p className="text-xs text-slate-400">About {studentName}'s progress</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300">
            <Phone size={18} />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300">
            <Video size={18} />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-slate-700">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-700/50 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isCurrentUser = msg.mentor_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg border-2 ${getMessageColor(msg.message_type, isCurrentUser)}`}
                >
                  <p className={`text-xs font-semibold mb-1 ${isCurrentUser ? 'text-blue-200' : 'text-amber-200'}`}>
                    {isCurrentUser ? 'You (Mentor)' : msg.parent?.full_name || 'Parent'}
                  </p>
                  <p className="text-sm text-white">{msg.message}</p>
                  <p className={`text-xs mt-2 font-medium ${isCurrentUser ? 'text-blue-300' : 'text-amber-300'}`}>
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
