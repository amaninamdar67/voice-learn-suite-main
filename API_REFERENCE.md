# Voice Learn Suite - API Reference

Complete documentation of all API endpoints.

---

## Base URL

**Development:** `http://localhost:3001`
**Production:** `https://your-api-domain.com`

---

## Authentication

All requests should include JWT token in header:

```
Authorization: Bearer <jwt_token>
```

Token is obtained after login via Supabase authentication.

---

## AI Tutor Endpoints

### Analyze Text with Groq

**Endpoint:** `POST /api/groq/chat`

**Request:**
```json
{
  "message": "What is photosynthesis?",
  "model": "llama-3.1-8b-instant"
}
```

**Response:**
```json
{
  "response": "Photosynthesis is the process...",
  "model": "llama-3.1-8b-instant",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `500` - Server error

---

### Analyze Image with Gemini

**Endpoint:** `POST /api/gemini/analyze`

**Request:**
```json
{
  "imageData": "base64_encoded_image",
  "prompt": "What's in this image?"
}
```

**Response:**
```json
{
  "response": "This image shows...",
  "model": "gemini-pro-vision"
}
```

---

### Analyze Document with Perplexity

**Endpoint:** `POST /api/perplexity/analyze`

**Request:**
```json
{
  "documentText": "Full document content...",
  "question": "Summarize this document"
}
```

**Response:**
```json
{
  "response": "Summary of document...",
  "model": "pplx-7b-online"
}
```

---

### Analyze with Claude

**Endpoint:** `POST /api/claude/analyze`

**Request:**
```json
{
  "imageData": "base64_encoded_image",
  "prompt": "Analyze this image"
}
```

**Response:**
```json
{
  "response": "Analysis of image...",
  "model": "claude-3-sonnet-20240229"
}
```

---

## AI Tutor Sessions

### Create Session

**Endpoint:** `POST /api/ai-tutor/sessions`

**Request:**
```json
{
  "title": "Math Tutoring",
  "subject": "Mathematics"
}
```

**Response:**
```json
{
  "id": "session-123",
  "title": "Math Tutoring",
  "subject": "Mathematics",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### Get Session History

**Endpoint:** `GET /api/ai-tutor/sessions/:sessionId`

**Response:**
```json
{
  "id": "session-123",
  "messages": [
    {
      "role": "user",
      "content": "What is 2+2?",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "2+2 equals 4",
      "timestamp": "2024-01-15T10:00:05Z"
    }
  ]
}
```

---

### Save Message to Session

**Endpoint:** `POST /api/ai-tutor/sessions/:sessionId/messages`

**Request:**
```json
{
  "role": "user",
  "content": "What is photosynthesis?"
}
```

**Response:**
```json
{
  "id": "msg-456",
  "role": "user",
  "content": "What is photosynthesis?",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## Messaging Endpoints

### Send Message

**Endpoint:** `POST /api/messages`

**Request:**
```json
{
  "recipient_id": "user-456",
  "content": "Hello, how are you?"
}
```

**Response:**
```json
{
  "id": "msg-789",
  "sender_id": "user-123",
  "recipient_id": "user-456",
  "content": "Hello, how are you?",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### Get Messages

**Endpoint:** `GET /api/messages?limit=50&offset=0`

**Query Parameters:**
- `limit` - Number of messages (default: 50)
- `offset` - Pagination offset (default: 0)
- `user_id` - Filter by user (optional)

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-789",
      "sender_id": "user-123",
      "recipient_id": "user-456",
      "content": "Hello, how are you?",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 100
}
```

---

### Delete Message

**Endpoint:** `DELETE /api/messages/:messageId`

**Response:**
```json
{
  "success": true,
  "message": "Message deleted"
}
```

---

### Get Conversation

**Endpoint:** `GET /api/messages/conversation/:userId`

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-789",
      "sender_id": "user-123",
      "recipient_id": "user-456",
      "content": "Hello",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Mentor Endpoints

### Get Mentor's Students

**Endpoint:** `GET /api/mentor/students`

**Response:**
```json
{
  "students": [
    {
      "id": "student-123",
      "name": "John Doe",
      "email": "john@example.com",
      "progress": 75,
      "last_active": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Send Mentor Message

**Endpoint:** `POST /api/mentor/message`

**Request:**
```json
{
  "student_id": "student-123",
  "content": "Great work on the assignment!"
}
```

**Response:**
```json
{
  "id": "msg-456",
  "mentor_id": "mentor-123",
  "student_id": "student-123",
  "content": "Great work on the assignment!",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### Get Mentor Sessions

**Endpoint:** `GET /api/mentor/sessions`

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-123",
      "student_id": "student-123",
      "student_name": "John Doe",
      "status": "active",
      "started_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Parent Endpoints

### Get Parent's Children

**Endpoint:** `GET /api/parent/children`

**Response:**
```json
{
  "children": [
    {
      "id": "child-123",
      "name": "Jane Doe",
      "grade": "10",
      "progress": 85,
      "last_active": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Get Child Progress

**Endpoint:** `GET /api/parent/children/:childId/progress`

**Response:**
```json
{
  "child_id": "child-123",
  "quizzes_completed": 15,
  "assignments_completed": 8,
  "average_score": 82,
  "videos_watched": 45,
  "last_active": "2024-01-15T10:00:00Z"
}
```

---

### Send Parent-Mentor Message

**Endpoint:** `POST /api/parent-mentor/message`

**Request:**
```json
{
  "mentor_id": "mentor-123",
  "content": "How is my child progressing?"
}
```

**Response:**
```json
{
  "id": "msg-789",
  "parent_id": "parent-123",
  "mentor_id": "mentor-123",
  "content": "How is my child progressing?",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

## Teacher Endpoints

### Create Lesson

**Endpoint:** `POST /api/teacher/lessons`

**Request:**
```json
{
  "title": "Introduction to Algebra",
  "description": "Learn the basics of algebra",
  "video_url": "https://example.com/video.mp4",
  "duration": 3600
}
```

**Response:**
```json
{
  "id": "lesson-123",
  "title": "Introduction to Algebra",
  "description": "Learn the basics of algebra",
  "video_url": "https://example.com/video.mp4",
  "duration": 3600,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### Create Quiz

**Endpoint:** `POST /api/teacher/quizzes`

**Request:**
```json
{
  "title": "Algebra Quiz 1",
  "description": "Test your algebra knowledge",
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correct_answer": 1
    }
  ]
}
```

**Response:**
```json
{
  "id": "quiz-123",
  "title": "Algebra Quiz 1",
  "questions_count": 1,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### Create Assignment

**Endpoint:** `POST /api/teacher/assignments`

**Request:**
```json
{
  "title": "Algebra Homework",
  "description": "Complete these algebra problems",
  "due_date": "2024-01-20T23:59:59Z",
  "max_score": 100
}
```

**Response:**
```json
{
  "id": "assignment-123",
  "title": "Algebra Homework",
  "due_date": "2024-01-20T23:59:59Z",
  "max_score": 100,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### Get Class Analytics

**Endpoint:** `GET /api/teacher/analytics`

**Response:**
```json
{
  "total_students": 30,
  "average_score": 78,
  "completion_rate": 85,
  "top_performers": [
    {
      "name": "John Doe",
      "score": 95
    }
  ]
}
```

---

## Student Endpoints

### Get Dashboard Data

**Endpoint:** `GET /api/student/dashboard`

**Response:**
```json
{
  "progress": 75,
  "quizzes_completed": 10,
  "assignments_completed": 5,
  "videos_watched": 20,
  "current_rank": 5,
  "recent_activity": [
    {
      "type": "quiz_completed",
      "title": "Algebra Quiz 1",
      "score": 85,
      "date": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Submit Quiz

**Endpoint:** `POST /api/student/quizzes/:quizId/submit`

**Request:**
```json
{
  "answers": [1, 2, 0, 3, 1]
}
```

**Response:**
```json
{
  "id": "result-123",
  "quiz_id": "quiz-123",
  "score": 85,
  "total": 100,
  "percentage": 85,
  "submitted_at": "2024-01-15T10:00:00Z"
}
```

---

### Submit Assignment

**Endpoint:** `POST /api/student/assignments/:assignmentId/submit`

**Request:**
```
Content-Type: multipart/form-data

file: <binary_file>
```

**Response:**
```json
{
  "id": "submission-123",
  "assignment_id": "assignment-123",
  "file_url": "https://storage.example.com/submission.pdf",
  "submitted_at": "2024-01-15T10:00:00Z",
  "status": "submitted"
}
```

---

### Get Rankings

**Endpoint:** `GET /api/student/rankings?type=quiz&limit=10`

**Query Parameters:**
- `type` - `quiz`, `assignment`, or `overall`
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "rankings": [
    {
      "rank": 1,
      "name": "John Doe",
      "score": 95,
      "percentage": 95
    },
    {
      "rank": 2,
      "name": "Jane Smith",
      "score": 92,
      "percentage": 92
    }
  ]
}
```

---

## Admin Endpoints

### Get All Users

**Endpoint:** `GET /api/admin/users?limit=50&offset=0`

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 100
}
```

---

### Update User Role

**Endpoint:** `PUT /api/admin/users/:userId/role`

**Request:**
```json
{
  "role": "teacher"
}
```

**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "role": "teacher",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

### Delete User

**Endpoint:** `DELETE /api/admin/users/:userId`

**Response:**
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

### Get System Analytics

**Endpoint:** `GET /api/admin/analytics`

**Response:**
```json
{
  "total_users": 500,
  "total_students": 300,
  "total_teachers": 50,
  "total_mentors": 30,
  "total_parents": 120,
  "active_users_today": 250,
  "quizzes_completed": 1500,
  "assignments_submitted": 800
}
```

---

### Create Announcement

**Endpoint:** `POST /api/admin/announcements`

**Request:**
```json
{
  "title": "System Maintenance",
  "content": "System will be down for maintenance",
  "target_roles": ["student", "teacher"],
  "published": true
}
```

**Response:**
```json
{
  "id": "announcement-123",
  "title": "System Maintenance",
  "content": "System will be down for maintenance",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

## Announcements Endpoints

### Get Announcements

**Endpoint:** `GET /api/announcements?limit=10`

**Response:**
```json
{
  "announcements": [
    {
      "id": "announcement-123",
      "title": "System Maintenance",
      "content": "System will be down for maintenance",
      "created_at": "2024-01-15T10:00:00Z",
      "published": true
    }
  ]
}
```

---

## LMS Endpoints

### Get Lessons

**Endpoint:** `GET /api/lms/lessons?limit=20`

**Response:**
```json
{
  "lessons": [
    {
      "id": "lesson-123",
      "title": "Introduction to Algebra",
      "description": "Learn the basics",
      "video_url": "https://example.com/video.mp4",
      "duration": 3600
    }
  ]
}
```

---

### Get Quizzes

**Endpoint:** `GET /api/lms/quizzes?limit=20`

**Response:**
```json
{
  "quizzes": [
    {
      "id": "quiz-123",
      "title": "Algebra Quiz 1",
      "questions_count": 10,
      "max_score": 100
    }
  ]
}
```

---

### Get Assignments

**Endpoint:** `GET /api/lms/assignments?limit=20`

**Response:**
```json
{
  "assignments": [
    {
      "id": "assignment-123",
      "title": "Algebra Homework",
      "due_date": "2024-01-20T23:59:59Z",
      "max_score": 100
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request",
  "message": "Missing required field: message"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Server Error

```json
{
  "error": "Server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limits

- **Groq:** Unlimited (free tier)
- **Gemini:** 60 requests/minute (free tier)
- **Perplexity:** Varies by plan
- **Claude:** Varies by plan

---

## Pagination

All list endpoints support pagination:

```
GET /api/endpoint?limit=50&offset=0
```

- `limit` - Number of results (default: 50, max: 100)
- `offset` - Number of results to skip (default: 0)

---

## Filtering

Some endpoints support filtering:

```
GET /api/endpoint?role=student&status=active
```

Check individual endpoint documentation for supported filters.

---

## Sorting

Some endpoints support sorting:

```
GET /api/endpoint?sort=created_at&order=desc
```

- `sort` - Field to sort by
- `order` - `asc` or `desc`

---

## Testing Endpoints

### Using curl

```bash
# Test GET
curl http://localhost:3001/api/student/dashboard

# Test POST
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":"user-456","content":"Hello"}'

# Test with authentication
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/student/dashboard
```

### Using Postman

1. Import API endpoints
2. Set base URL: `http://localhost:3001`
3. Add Authorization header with JWT token
4. Test endpoints

---

## WebSocket Endpoints (Real-time)

### Subscribe to Messages

```typescript
const subscription = supabase
  .from('messages')
  .on('*', payload => {
    console.log('New message:', payload);
  })
  .subscribe();
```

### Subscribe to Announcements

```typescript
const subscription = supabase
  .from('announcements')
  .on('INSERT', payload => {
    console.log('New announcement:', payload);
  })
  .subscribe();
```

---

**Last Updated:** January 2026
**Version:** 2.0
