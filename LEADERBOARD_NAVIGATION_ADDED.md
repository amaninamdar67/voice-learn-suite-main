# Leaderboard Navigation Implementation

## Summary
Added "View Leaderboard" button to all student module pages that navigates to the Overall Rankings leaderboard page.

## Changes Made

### 1. Route Configuration (src/App.tsx)
- Added route for `/leaderboard` that displays the `OverallRankings` component
- Imported `OverallRankings` from `src/pages/Student/OverallRankings.tsx`

### 2. Student Module Pages Updated

All student module pages now include a "View Leaderboard" button in the header:

#### Video Lessons (src/pages/Student/VideoLessonsView.tsx)
- Added Trophy icon import
- Added useNavigate hook
- Added View Leaderboard button in header next to PageCommentBox

#### Recorded Videos (src/pages/Student/RecordedVideosView.tsx)
- Added Trophy icon import
- Added useNavigate hook
- Added View Leaderboard button in header next to PageCommentBox

#### Live Classes (src/pages/Student/LiveClassesView.tsx)
- Added Trophy icon import
- Added useNavigate hook
- Added View Leaderboard button in header next to PageCommentBox

#### Quizzes (src/pages/Student/QuizzesView.tsx)
- Added Trophy icon import
- Added useNavigate hook
- Added View Leaderboard button in header

#### Assignments (src/pages/Student/AssignmentsView.tsx)
- Added Trophy icon import
- Added useNavigate hook
- Added View Leaderboard button in header

#### Student Dashboard (src/pages/Student/StudentDashboard.tsx)
- Already had View Leaderboard button in the "Your Progress" section
- Button navigates to `/leaderboard`

## Button Design
The View Leaderboard button features:
- Purple to pink gradient background (`from-purple-500 to-pink-500`)
- Trophy icon from lucide-react
- White text with medium font weight
- Hover effect with darker gradient
- Consistent placement in the header area of each page

## Leaderboard Page Features
The Overall Rankings page (`/leaderboard`) displays:
- Combined performance across all modules
- Top 3 podium display
- Full rankings table with:
  - Student rank and name
  - Total points breakdown (Quiz, Assignment, Attendance, Participation)
  - Percentile ranking
- Filters by grade and section
- Highlighted row for current user
- Points calculation explanation

## Navigation Flow
Students can now access the leaderboard from:
1. Dashboard → View Leaderboard button
2. Video Lessons → View Leaderboard button
3. Recorded Videos → View Leaderboard button
4. Live Classes → View Leaderboard button
5. Quizzes → View Leaderboard button
6. Assignments → View Leaderboard button

All buttons navigate to the same unified leaderboard at `/leaderboard`.
