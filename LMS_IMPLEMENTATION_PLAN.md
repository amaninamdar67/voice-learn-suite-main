# 🎓 Learning Management System - Implementation Plan

## Overview
Complete LMS with Teacher content creation, Student consumption, Live attendance tracking, and comprehensive analytics for Parents/Mentors/Admin.

---

## 📊 Implementation Phases

### ✅ Phase 1: Database Schema (Step 1-2)
**Goal:** Create all necessary tables and relationships

#### Step 1: Core Content Tables
- [x] `video_lessons` - YouTube-based video lessons (for study materials)
- [x] `recorded_videos` - YouTube-based recorded video library (general videos)
- [x] `live_classes` - Live streaming sessions
- [x] `quizzes` - Quiz metadata
- [x] `quiz_questions` - Individual questions

#### Step 2: Tracking & Analytics Tables
- [x] `lesson_attendance` - Video watch tracking (80% rule)
- [x] `video_watch_history` - Recorded video watch tracking
- [x] `live_attendance` - Live class join/leave logs
- [x] `live_attendance_pings` - Real-time attentiveness checks
- [x] `quiz_results` - Student quiz attempts and scores
- [x] `quiz_rankings` - Leaderboard rankings per quiz

---

### ✅ Phase 2: Backend API (Step 3-4)

#### Step 3: Teacher APIs
- [ ] POST `/api/lessons` - Create video lesson
- [ ] POST `/api/live-classes` - Create live class
- [ ] POST `/api/quizzes` - Create quiz
- [ ] POST `/api/live-classes/:id/ping` - Send attendance ping
- [ ] GET `/api/teacher/content` - List all teacher content

#### Step 4: Student APIs
- [ ] GET `/api/student/lessons` - Get assigned lessons
- [ ] GET `/api/student/live-classes` - Get live classes
- [ ] GET `/api/student/quizzes` - Get available quizzes
- [ ] POST `/api/lessons/:id/track` - Track video watch progress
- [ ] POST `/api/live-classes/:id/respond-ping` - Respond to attendance ping
- [ ] POST `/api/quizzes/:id/submit` - Submit quiz answers

---

### ✅ Phase 3: Teacher Module UI (Step 5-8)

#### Step 5: Video Lesson Upload Page ✅
- [x] Form: Title, Description, YouTube URL
- [x] YouTube URL validation
- [x] Save lesson to database
- [x] List created lessons

#### Step 5b: Recorded Videos Upload (NEW)
- [ ] Separate section for general recorded videos
- [ ] Same YouTube URL method
- [ ] Categorization (subject, topic, difficulty)
- [ ] Video library management

#### Step 6: Live Class Creator ✅
- [x] Form: Title, Description, Stream URL, Start/End Time
- [x] Create live class
- [x] Live class management dashboard
- [x] **Attendance Ping Sender** - Button to trigger 60-second countdown

#### Step 7: Quiz Creator
- [ ] Manual quiz creation form
- [ ] Add/remove questions dynamically
- [ ] Set correct answers and marks
- [ ] "Auto Create (AI)" placeholder button
- [ ] Preview quiz
- [ ] **Enable/Disable Rankings** toggle

#### Step 8: Quiz Rankings View (Teacher)
- [ ] View leaderboard for each quiz
- [ ] Top performers list
- [ ] Score distribution chart
- [ ] Export rankings

---

### ✅ Phase 4: Student Module UI (Step 9-13)

#### Step 9: Recorded Videos View (Student) (NEW)
- [ ] Video library with categories
- [ ] Medium-width video cards
- [ ] **Custom Video Player Component**
  - Restricted YouTube embed
  - Play/pause controls
  - Progress bar
  - Fullscreen support
  - Watch time tracking
- [ ] Continue watching section

#### Step 10: Lessons View (Student)
- [ ] Medium-width lesson cards
- [ ] Same custom video player
- [ ] Auto-track watch percentage
- [ ] Mark attended when ≥80% watched
- [ ] Completion badges

#### Step 11: Live Classes (Student)
- [ ] Live class cards with status badges (UPCOMING/LIVE/ENDED)
- [ ] Join button → Full-screen live player
- [ ] **Live Player (No Controls)**
  - No pause/rewind during live
  - Only volume and fullscreen
  - Chat/Q&A sidebar (optional)
- [ ] **Ping Response Modal** - 60-second countdown timer
- [ ] "Mark Present" button
- [ ] Auto-mark absent if time expires

#### Step 12: Quizzes (Student)
- [ ] Quiz cards matching video card style
- [ ] Start quiz interface
- [ ] Question navigation
- [ ] Timer display (if time-limited)
- [ ] Auto-grade on submission
- [ ] Show results with correct answers
- [ ] **View Rankings** button (if enabled)

#### Step 13: Quiz Rankings View (Student)
- [ ] Personal rank display
- [ ] Top 10 leaderboard
- [ ] Score comparison
- [ ] Percentile indicator

---

### ✅ Phase 5: Analytics Dashboards (Step 14-15)

#### Step 14: Parent/Mentor Analytics
- [ ] **Video Analytics:** Recorded videos watched, watch time
- [ ] **Lesson Analytics:** Assigned, watched, watch %, skipped
- [ ] **Live Class Analytics:** Attended, duration, ping stats, focus score
- [ ] **Quiz Analytics:** Attempts, marks, **rank position**, weekly graph
- [ ] **Quiz Rankings:** View child's rank in each quiz
- [ ] **Overall Insights:** Consistency, daily activity, attention analysis, engagement score

#### Step 15: Admin Analytics
- [ ] Teacher performance metrics
- [ ] Content statistics (videos, lessons, live classes, quizzes)
- [ ] Lessons uploaded by each teacher
- [ ] Live sessions created
- [ ] Quiz statistics with rankings
- [ ] **Top Students Leaderboard** (across all quizzes)
- [ ] Lesson attendance distribution
- [ ] Live class attentiveness (ping analytics)
- [ ] Quiz performance distribution
- [ ] Subject-wise insights
- [ ] Student activity logs

---

## 🎨 UI Design Guidelines

### Card Design
- Medium-width cards (consistent sizing)
- Clean, simple interface
- Proper spacing and typography
- Hover effects for interactivity

### Custom Video Player Component
**For Recorded Videos & Lessons:**
- Restricted YouTube embed with controls:
  ```
  https://www.youtube-nocookie.com/embed/VIDEO_ID?rel=0&modestbranding=1&controls=1&fs=1&showinfo=0
  ```
- Play/pause button
- Progress bar with seek
- Volume control
- Fullscreen button
- Watch time tracking overlay
- No YouTube branding, recommendations, or comments

**For Live Classes:**
- Full-screen immersive player
- **NO pause/rewind controls** (live only)
- Only volume and fullscreen available
- Live indicator badge
- Optional chat/Q&A sidebar
- Ping notification overlay

### Status Badges
- **UPCOMING** - Blue badge
- **LIVE NOW** - Red pulsing badge with dot animation
- **ENDED** - Gray badge
- **COMPLETED** - Green checkmark badge (for watched content)

### Attendance Ping Modal
- Countdown timer (60 seconds) with progress ring
- Large "Mark Present" button
- Auto-close on timeout or response
- Sound notification (optional)

### Quiz Rankings Display
- Podium view for top 3
- Scrollable leaderboard list
- Highlight current user's rank
- Score and percentage display
- Time taken indicator

---

## 🔄 Real-Time Features

### Live Attendance Ping System
1. Teacher clicks "Send Attendance Check" during live class
2. Backend broadcasts ping to all joined students
3. Students see modal with 60-second countdown
4. Student clicks "Present" or timer expires
5. Response logged with timestamp and status
6. Analytics updated in real-time

**Technology:** WebSocket or Server-Sent Events (SSE)

### Quiz Ranking System
1. Student submits quiz → auto-graded
2. Score saved to `quiz_results`
3. Ranking calculated based on:
   - **Primary:** Score (highest first)
   - **Secondary:** Time taken (fastest first)
   - **Tertiary:** Submission timestamp (earliest first)
4. Rankings updated in `quiz_rankings` table
5. Leaderboard refreshed in real-time
6. Teacher can enable/disable rankings per quiz

**Ranking Visibility:**
- **Students:** See own rank + top 10
- **Teachers:** See full leaderboard + analytics
- **Parents/Mentors:** See child's rank + percentile
- **Admin:** See all rankings + top performers system-wide

---

## 📦 Current Progress

### ✅ Phase 1: Database Schema (COMPLETED)
- ✅ Created `database/11_lms_core_schema.sql`
  - video_lessons table
  - live_classes table
  - quizzes table
  - quiz_questions table
  - All RLS policies configured
- ✅ Created `database/12_lms_tracking_schema.sql`
  - lesson_attendance table
  - live_attendance table
  - live_attendance_pings table
  - live_ping_responses table
  - quiz_results table
  - All RLS policies configured

### ✅ Phase 2: Backend API (COMPLETED)
- ✅ Created `backend/lms-routes.js` with all endpoints
- ✅ Integrated routes into `backend/server.js`
- ✅ Teacher APIs (create/update/delete lessons, live classes, quizzes)
- ✅ Student APIs (track progress, join classes, respond to pings, submit quizzes)
- ✅ Analytics APIs (student and teacher analytics)

### 🔄 Phase 3: Teacher Module UI (NEXT)
- [ ] Video Lesson Upload Page
- [ ] Live Class Creator
- [ ] Quiz Creator with manual questions
- [ ] Teacher Dashboard

### ⏳ Phase 4: Student Module UI (PENDING)
- [ ] Video Lessons View
- [ ] Live Classes View
- [ ] Quizzes View
- [ ] Ping Response Modal

### ⏳ Phase 5: Analytics Dashboards (PENDING)
- [ ] Parent/Mentor Analytics
- [ ] Admin Analytics

---

## 🚀 Next Steps
**Phase 3, Step 5:** Create Teacher Video Lesson Upload Page
