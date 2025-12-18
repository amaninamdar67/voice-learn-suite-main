# Admin Dashboard - Real-Time Analytics & Attendance

## Overview
Enhanced the admin dashboard with comprehensive real-time analytics showing all system activities and live attendance data calculated from actual live class attendance records.

## Features Implemented

### 1. System Activity Analytics Chart
Displays all types of platform activities in a stacked bar chart:

**Metrics Tracked:**
- **New Users** (Blue) - User registrations
- **Lessons Uploaded** (Green) - Video lessons and content
- **Quizzes Created** (Orange) - Assessment creation
- **Assignments Created** (Purple) - Assignment submissions
- **Live Classes** (Pink) - Live class sessions

**Time Range Options:**
- Week (daily view)
- Month (daily view)
- Year (monthly view)

**Real-Time Data:**
- Fetches from `/api/admin/analytics?range={week|month|year}`
- Updates every 30 seconds
- Shows totals for each metric below the chart

### 2. Weekly Attendance Overview
Real-time attendance data calculated from live class attendance records:

**Data Source:**
- Pulls from `live_attendance` table
- Calculates based on `is_present` field
- Shows students who marked present during live classes

**Display:**
- 7-day view (Monday to Sunday)
- Percentage attendance for each day
- Color-coded bars:
  - Green: ≥85% attendance
  - Orange: 70-84% attendance
  - Red: <70% attendance
- Shows present/total count for each day

**Attendance Stats:**
- Total attendance records
- Students present count
- Overall attendance rate percentage

### 3. Recent System Activities
Enhanced activity feed showing:
- New user enrollments
- Lesson uploads
- Quiz creations
- Assignments created
- Live classes started
- Color-coded activity type badges
- Timestamps for each activity

## Backend Endpoints

### 1. Get Comprehensive Analytics
```
GET /api/admin/analytics?range=week|month|year
```

**Response:**
```json
{
  "chartData": [
    {
      "date": "Jan 15",
      "users": 12,
      "lessons": 5,
      "quizzes": 8,
      "assignments": 3,
      "liveClasses": 2,
      "total": 30
    }
  ],
  "totals": {
    "users": 87,
    "lessons": 35,
    "quizzes": 55,
    "assignments": 42,
    "liveClasses": 18,
    "attendance": {
      "total": 450,
      "present": 405,
      "rate": 90
    }
  },
  "range": "week"
}
```

### 2. Get Weekly Attendance Data
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
    },
    {
      "day": "Tue",
      "percentage": 92,
      "total": 125,
      "present": 115,
      "date": "2025-01-14"
    }
  ]
}
```

### 3. Get System Activities
```
GET /api/system/activities
```

**Response:**
```json
{
  "activities": [
    {
      "id": "user-123",
      "message": "New student enrolled: John Doe",
      "timestamp": "1/15/2025, 10:30:00 AM",
      "type": "user"
    },
    {
      "id": "lesson-456",
      "message": "Teacher uploaded lesson: Math Basics",
      "timestamp": "1/15/2025, 10:25:00 AM",
      "type": "lesson"
    }
  ]
}
```

## Database Tables Used

### live_attendance
- `id` - Unique identifier
- `student_id` - Student reference
- `live_class_id` - Live class reference
- `is_present` - Boolean flag (true if student marked present)
- `created_at` - Timestamp

### live_classes
- `id` - Unique identifier
- `title` - Class title
- `created_at` - Creation timestamp

### profiles
- `id` - User ID
- `full_name` - User name
- `role` - User role (student, teacher, etc.)
- `created_at` - Registration timestamp

### lessons
- `id` - Lesson ID
- `title` - Lesson title
- `created_at` - Upload timestamp

### quizzes
- `id` - Quiz ID
- `title` - Quiz title
- `created_at` - Creation timestamp

### assignments
- `id` - Assignment ID
- `created_at` - Creation timestamp

## Frontend Components

### AdminDashboard.tsx
Main dashboard component with:
- Stats cards (Schools, Students, Teachers, Courses)
- System Activity Analytics chart
- Weekly Attendance Overview
- Recent System Activities feed

**State Management:**
```typescript
- stats: StatCard[] - Dashboard statistics
- activities: Activity[] - Recent activities
- activityChartData: ActivityData[] - Chart data
- weeklyAttendance: WeeklyAttendance[] - Attendance data
- timeRange: 'week' | 'month' | 'year' - Selected time range
- analyticsData: Analytics totals
```

**Data Refresh:**
- Auto-refresh every 30 seconds
- Manual refresh on time range change
- Real-time updates for attendance

## Attendance Calculation

**Formula:**
```
Attendance Rate = (Students Present / Total Students) × 100
```

**Data Collection:**
1. When student joins live class → `live_attendance` record created
2. Teacher sends attendance ping → `live_attendance_pings` created
3. Student responds to ping → `live_ping_responses` recorded
4. `is_present` flag set based on response
5. Dashboard aggregates by day for weekly view

## Real-Time Features

1. **Live Attendance Tracking:**
   - Updates as students join/leave classes
   - Reflects presence based on ping responses
   - Calculated daily for weekly overview

2. **Activity Feed:**
   - Shows latest system events
   - Updates every 30 seconds
   - Includes all activity types

3. **Analytics Chart:**
   - Aggregates data by date
   - Updates on time range change
   - Shows trends over selected period

## Color Coding

| Metric | Color | Hex |
|--------|-------|-----|
| New Users | Blue | #2196F3 |
| Lessons | Green | #4CAF50 |
| Quizzes | Orange | #FF9800 |
| Assignments | Purple | #9C27B0 |
| Live Classes | Pink | #E91E63 |
| High Attendance (≥85%) | Green | #4CAF50 |
| Medium Attendance (70-84%) | Orange | #FF9800 |
| Low Attendance (<70%) | Red | #F44336 |

## Files Modified

1. **backend/server.js**
   - Added `/api/admin/analytics` endpoint
   - Added `/api/admin/attendance/weekly` endpoint
   - Enhanced `/api/system/activities` endpoint

2. **src/pages/Admin/AdminDashboard.tsx**
   - Added real-time analytics chart with all activity types
   - Added weekly attendance overview
   - Added real-time data fetching
   - Enhanced activity feed display

## Future Enhancements

1. **Custom Date Range Picker**
   - Allow selection of specific date ranges
   - Compare periods (week-over-week, month-over-month)

2. **Export Functionality**
   - Export analytics to CSV/PDF
   - Generate reports

3. **Filtering Options**
   - Filter by activity type
   - Filter by user role
   - Filter by domain/subdomain

4. **Advanced Analytics**
   - Trend analysis
   - Predictive insights
   - Anomaly detection

5. **Performance Metrics**
   - Student engagement scores
   - Teacher activity metrics
   - Content performance analytics

## Performance Considerations

- Data aggregation done at database level
- Indexes on `created_at` for fast queries
- Caching of analytics data (30-second refresh)
- Efficient date grouping queries
- Pagination for large datasets (future)

## Security

- Admin-only access to analytics endpoints
- RLS policies enforce data isolation
- No sensitive student data exposed
- Aggregated metrics only
