# Analytics Page - Real-Time Data Implementation

## Overview
Updated the Analytics page to display real-time data across all 4 tabs with live metrics from the database. Removed weekly attendance from the dashboard and integrated it into the Analytics page.

## Changes Made

### 1. Removed from Admin Dashboard
- Weekly Attendance Overview section removed
- Dashboard now focuses on system activity analytics chart and recent activities

### 2. Analytics Page - 4 Real-Time Tabs

#### Tab 1: Attendance
**Real-Time Data:**
- Weekly attendance percentages (Mon-Sun)
- Color-coded bars:
  - Green: ≥85% attendance
  - Orange: 70-84% attendance
  - Red: <70% attendance
- Shows present/total count for each day
- Calculates average attendance rate
- Identifies highest attendance day

**Data Source:**
- Endpoint: `/api/admin/attendance/weekly`
- Pulls from `live_attendance` table
- Aggregates by day

#### Tab 2: Quiz Performance
**Real-Time Data:**
- Quiz performance by subject
- Average score for each quiz
- Number of students who took each quiz
- Color-coded performance bars:
  - Green: ≥85% average
  - Blue: 70-84% average
  - Orange: <70% average
- Recommendations based on performance

**Data Source:**
- Endpoint: `/api/admin/quiz-performance?range={week|month|year}`
- Pulls from `quizzes` and `quiz_submissions` tables
- Calculates average scores per quiz

#### Tab 3: LMS Analytics
**Real-Time Data:**
- Video Lessons count
- Recorded Videos count
- Live Classes count
- Quizzes count
- Total Views
- Average Completion Rate
- Total content items
- Completion rate percentage

**Data Source:**
- Endpoint: `/api/admin/lms-analytics?range={week|month|year}`
- Pulls from:
  - `lessons` table
  - `recorded_videos` table
  - `live_classes` table
  - `quizzes` table
  - `lesson_attendance` table

#### Tab 4: AI Tutor Engagement
**Real-Time Data:**
- Total AI Tutor sessions
- Total tokens used
- Sessions by category:
  - Math Help
  - Science Questions
  - Homework Assistance
  - Exam Preparation
- Tokens used per category
- Popular questions with frequency count

**Data Source:**
- Endpoint: `/api/admin/ai-tutor-stats?range={week|month|year}`
- Pulls from:
  - `ai_tutor_sessions` table
  - `ai_tutor_questions` table
- Groups by category
- Tracks token usage

## Backend Endpoints

### 1. Weekly Attendance
```
GET /api/admin/attendance/weekly
```

**Response:**
```json
{
  "weeklyData": [
    {
      "day": "Mon",
      "percentage": 85,
      "total": 120,
      "present": 102,
      "date": "2025-01-13"
    }
  ]
}
```

### 2. Quiz Performance
```
GET /api/admin/quiz-performance?range=week|month|year
```

**Response:**
```json
{
  "quizPerformance": [
    {
      "subject": "Mathematics",
      "avgScore": 85,
      "students": 234
    }
  ]
}
```

### 3. AI Tutor Statistics
```
GET /api/admin/ai-tutor-stats?range=week|month|year
```

**Response:**
```json
{
  "aiTutorEngagement": [
    {
      "category": "Math Help",
      "sessions": 456,
      "tokensUsed": 12500
    }
  ],
  "totalSessions": 1646,
  "totalTokensUsed": 45000,
  "popularQuestions": [
    {
      "question": "How do I solve quadratic equations?",
      "count": 45
    }
  ]
}
```

### 4. LMS Analytics
```
GET /api/admin/lms-analytics?range=week|month|year
```

**Response:**
```json
{
  "videoLessons": 35,
  "recordedVideos": 12,
  "liveClasses": 8,
  "quizzes": 15,
  "assignments": 20,
  "totalViews": 450,
  "avgCompletion": 78
}
```

## Database Tables Used

### live_attendance
- `id` - Unique identifier
- `student_id` - Student reference
- `live_class_id` - Live class reference
- `is_present` - Boolean flag
- `created_at` - Timestamp

### quizzes & quiz_submissions
- `quizzes.id, title, created_at`
- `quiz_submissions.quiz_id, score, created_at`

### ai_tutor_sessions
- `id` - Session ID
- `category` - Question category
- `tokens_used` - Token count
- `created_at` - Timestamp

### ai_tutor_questions
- `question` - Question text
- `count` - Frequency
- `created_at` - Timestamp

### LMS Tables
- `lessons` - Video lessons
- `recorded_videos` - Recorded class videos
- `live_classes` - Live class sessions
- `quizzes` - Quiz content
- `lesson_attendance` - Lesson tracking

## Frontend Components

### Analytics.tsx
Main analytics page with 4 tabs:

**State Management:**
```typescript
- tabValue: number - Current tab
- timeRange: 'week' | 'month' | 'year'
- stats: StatCard[] - Overview stats
- lmsStats: LMS metrics
- attendanceData: Weekly attendance
- quizPerformance: Quiz scores
- aiTutorData: AI tutor metrics
```

**Data Loading:**
- `loadAnalyticsData()` - Overview stats
- `loadAttendanceData()` - Weekly attendance
- `loadQuizPerformance()` - Quiz scores
- `loadAiTutorStats()` - AI tutor usage
- `loadLmsAnalytics()` - LMS metrics

**Auto-Refresh:**
- Triggers on time range change
- Updates all tabs with new data

## Time Range Support

All tabs support three time ranges:
- **Week**: Last 7 days (daily aggregation)
- **Month**: Last 30 days (daily aggregation)
- **Year**: Last 12 months (monthly aggregation)

## Real-Time Features

1. **Live Attendance Tracking**
   - Updates as students join/leave classes
   - Reflects presence based on ping responses
   - Calculated daily for weekly view

2. **Quiz Performance**
   - Aggregates scores from all submissions
   - Calculates averages per quiz
   - Updates as new submissions arrive

3. **AI Tutor Usage**
   - Tracks sessions by category
   - Counts tokens used
   - Records popular questions
   - Updates in real-time

4. **LMS Analytics**
   - Counts content items
   - Tracks views and completions
   - Calculates completion rates
   - Updates as content is created

## Color Coding

| Metric | Color | Hex |
|--------|-------|-----|
| High Attendance (≥85%) | Green | #4CAF50 |
| Medium Attendance (70-84%) | Orange | #FF9800 |
| Low Attendance (<70%) | Red | #F44336 |
| High Quiz Score (≥85%) | Green | #4CAF50 |
| Medium Quiz Score (70-84%) | Blue | #2196F3 |
| Low Quiz Score (<70%) | Orange | #FF9800 |

## Files Modified

1. **backend/server.js**
   - Added `/api/admin/attendance/weekly`
   - Added `/api/admin/quiz-performance`
   - Added `/api/admin/ai-tutor-stats`
   - Added `/api/admin/lms-analytics`

2. **src/pages/Admin/Analytics.tsx**
   - Updated all 4 tabs with real-time data
   - Added data loading functions
   - Integrated time range filtering
   - Added real-time metrics display

3. **src/pages/Admin/AdminDashboard.tsx**
   - Removed weekly attendance section
   - Kept system activity analytics chart
   - Kept recent activities feed

## Key Metrics Tracked

### Attendance
- Daily percentage
- Present/total count
- Average rate
- Highest day

### Quiz Performance
- Average score per quiz
- Student count per quiz
- Performance trends
- Subject-wise comparison

### AI Tutor
- Total sessions
- Sessions by category
- Tokens used
- Popular questions
- Question frequency

### LMS
- Content count (all types)
- Total views
- Completion rate
- Content distribution

## Future Enhancements

1. **Custom Date Range**
   - Allow specific date selection
   - Compare periods

2. **Export Functionality**
   - Export to CSV/PDF
   - Generate reports

3. **Advanced Filtering**
   - Filter by category
   - Filter by user role
   - Filter by domain

4. **Trend Analysis**
   - Week-over-week comparison
   - Month-over-month trends
   - Predictive insights

5. **Drill-Down Analytics**
   - Click on metric to see details
   - Student-level analytics
   - Question-level analysis

## Performance Considerations

- Data aggregation at database level
- Indexes on `created_at` for fast queries
- Efficient date grouping
- Pagination for large datasets (future)
- Caching of analytics data (30-second refresh)

## Security

- Admin-only access to all endpoints
- RLS policies enforce data isolation
- No sensitive student data exposed
- Aggregated metrics only
- Token usage tracking for cost control
