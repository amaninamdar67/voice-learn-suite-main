# Messaging System Documentation

## Overview
A generic user-to-user messaging system that works for all roles (teacher-student, student-mentor, mentor-student, etc.).

## Database Table: `user_messages`

### Schema
```sql
CREATE TABLE user_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  reply_to_id UUID REFERENCES user_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Columns
| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Unique message identifier |
| `sender_id` | UUID | User who sent the message |
| `receiver_id` | UUID | User who receives the message |
| `message` | TEXT | Message content |
| `message_type` | VARCHAR(50) | Type: 'text', 'image', 'file', etc. |
| `is_read` | BOOLEAN | Whether receiver has read it |
| `is_deleted` | BOOLEAN | Soft delete flag |
| `deleted_at` | TIMESTAMP | When it was deleted |
| `reply_to_id` | UUID | For message threading/replies |
| `created_at` | TIMESTAMP | When message was created |
| `updated_at` | TIMESTAMP | When message was last updated |

## Backend Endpoints

### Get Conversation
```
GET /api/messages/conversation/:userId/:otherUserId
```
Returns all messages between two users (both directions).

**Response:**
```json
[
  {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "message": "Hello!",
    "message_type": "text",
    "is_read": false,
    "created_at": "2025-12-18T10:30:00Z"
  }
]
```

### Send Message
```
POST /api/messages/send
```

**Request Body:**
```json
{
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "message": "Hello!",
  "message_type": "text"
}
```

**Response:**
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "message": "Hello!",
  "message_type": "text",
  "is_read": false,
  "created_at": "2025-12-18T10:30:00Z"
}
```

### Mark as Read
```
PUT /api/messages/read/:messageId
```

### Delete Message (Soft Delete)
```
DELETE /api/messages/:messageId
```

### Get Unread Count
```
GET /api/messages/unread-count/:userId
```

**Response:**
```json
{
  "unreadCount": 5
}
```

## Frontend Pages

### Messages Page
- **Path**: `/teacher/messages`, `/student/messages`, `/mentor/messages`
- **Component**: `src/pages/Messages.tsx`
- **Features**:
  - Left side: Scrollable chat area with messages
  - Right side: List of people to message
  - Date/time stamps on messages
  - Real-time polling (2 sec for messages, 5 sec for people list)
  - Send with Enter key or Send button
  - Auto-scroll to latest message

## Setup Instructions

### 1. Apply Database Migration
Run the SQL from `database/75_user_messages_table.sql` in your Supabase SQL Editor:
- Go to Supabase Dashboard → SQL Editor
- Create new query
- Paste the SQL content
- Execute

### 2. Backend is Ready
The backend endpoints are already configured in:
- `backend/messaging-routes.js` - All messaging endpoints
- `backend/server.js` - Routes initialized at `/api/messages`

### 3. Frontend is Ready
The Messages page is already integrated:
- Routes: `/teacher/messages`, `/student/messages`, `/mentor/messages`
- Sidebar links added for all three roles
- Real-time polling enabled

## Usage

### For Teachers
1. Click "Messages" in sidebar
2. Select a student from the right panel
3. Type message and press Enter or click Send

### For Students
1. Click "Messages" in sidebar
2. Select a teacher from the right panel
3. Type message and press Enter or click Send

### For Mentors
1. Click "Messages" in sidebar
2. Select a student from the right panel
3. Type message and press Enter or click Send

## Features

✅ Generic user-to-user messaging
✅ Works for all roles (teacher, student, mentor)
✅ Date/time stamps on messages
✅ Scrollable chat interface
✅ Real-time message updates
✅ Soft delete support
✅ Read status tracking
✅ Message threading support (reply_to_id)
✅ Multiple message types (text, image, file)
✅ Unread message counting

## Future Enhancements

- [ ] Message search functionality
- [ ] File/image upload support
- [ ] Typing indicators
- [ ] Message reactions/emojis
- [ ] Group messaging
- [ ] Message encryption
- [ ] Voice/video call integration
- [ ] Message notifications
