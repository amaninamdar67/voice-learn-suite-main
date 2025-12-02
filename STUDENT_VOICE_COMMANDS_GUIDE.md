# Student Module Voice Commands Guide

## Overview
Optimized voice commands specifically for the student module with multiple variations for natural language interaction.

## Student Page Navigation Commands

### Recorded Videos
**Navigate to recorded videos page**
- "Open recorded videos"
- "Recorded videos"
- "Recorded classes"
- "Open recorded classes"
- "Recorded videos page"
- "Recorded classes page"
- "Go to recorded videos"
- "Go to recorded classes"

**Response:** "Opening recorded videos"

---

### Video Lessons
**Navigate to video lessons page**
- "Open video lessons"
- "Video lessons"
- "Video lessons page"
- "Go to video lessons"
- "Open lessons videos"
- "Lessons videos"

**Response:** "Opening video lessons"

---

### Live Classes
**Navigate to live classes page**
- "Open live classes"
- "Live classes"
- "Live classes page"
- "Go to live classes"
- "Join live class"
- "Live sessions"

**Response:** "Opening live classes"

---

### Quizzes
**Navigate to student quizzes page**
- "Open student quizzes"
- "Student quizzes"
- "My quizzes page"
- "Go to student quizzes"
- "Take quiz"
- "Quiz page"

**Response:** "Opening quizzes"

---

### Quiz Rankings
**Navigate to quiz rankings/leaderboard**
- "Open quiz rankings"
- "Quiz rankings"
- "Quiz leaderboard"
- "Go to quiz rankings"
- "Quiz rankings page"
- "Quiz scores"

**Response:** "Opening quiz rankings"

---

### Overall Rankings
**Navigate to overall rankings page**
- "Open overall rankings"
- "Overall rankings"
- "Overall leaderboard"
- "Go to overall rankings"
- "Overall rankings page"
- "My rank"

**Response:** "Opening overall rankings"

---

### Assignments
**Navigate to student assignments page**
- "Open student assignments"
- "Student assignments"
- "My assignments page"
- "Go to student assignments"
- "View assignments"
- "Assignments page"

**Response:** "Opening assignments"

---

## Dashboard Component Reading Commands

### Continue Watching Section
**Read the continue watching section**
- "Continue watching"
- "Resume watching"
- "Continue learning"
- "Open continue watching"
- "Read continue watching"

**Response:** "Reading continue watching section" + full content

---

### Progress Section
**Read your progress information**
- "My progress"
- "Show progress"
- "Read progress"
- "Open progress"
- "Check progress"
- "Progress section"

**Response:** "Reading your progress" + full progress details

---

### Recent Activity Section
**Read recent activity**
- "Recent activity"
- "Show activity"
- "Read activity"
- "My activity"
- "Recent activity section"

**Response:** "Reading recent activity" + activity list

---

### Statistics Section
**Read statistics**
- "Statistics"
- "My statistics"
- "Show statistics"
- "Read statistics"
- "Stats"
- "My stats"

**Response:** "Reading statistics" + stats details

---

## General Navigation Commands (Still Available)

### Dashboard
- "Go to dashboard"
- "Open dashboard"
- "Dashboard"
- "Home"

### Settings
- "Go to settings"
- "Open settings"
- "Settings"

### Leaderboard
- "Go to leaderboard"
- "Open leaderboard"
- "Leaderboard"
- "Rankings"

### Community
- "Go to community"
- "Open community"
- "Community"
- "Discussions"

### Back Navigation
- "Go back"
- "Back"
- "Return"

---

## Reading Commands

### Read Page Headings
- "Read page"
- "Read this page"
- "Read headings"

**Behavior:** Reads only the headings on the current page

### Read Specific Component
- "Read [component name]"
- "Read sidebar"
- "Read recorded classes"
- "Read assignments section"

**Behavior:** Reads all content within that specific component

### Stop Reading
- "Stop reading"
- "Stop"
- "Pause reading"
- "Pause"

---

## Usage Examples

### Example 1: Navigate to Recorded Videos
```
User: "Open recorded videos"
System: "Opening recorded videos"
[Navigates to /student/recorded-videos]
```

### Example 2: Check Progress
```
User: "My progress"
System: "Reading your progress. Overall Progress. 75%. Videos watched: 12 out of 20..."
```

### Example 3: Continue Watching
```
User: "Continue watching"
System: "Reading continue watching section. Item: React Fundamentals. Progress: 75%. Button: Continue..."
```

### Example 4: Navigate and Read
```
User: "Open video lessons"
System: "Opening video lessons"
[Page loads]
User: "Read page"
System: "Reading 6 headings on this page. Video Lessons. Available Videos. Continue Watching..."
```

### Example 5: Quick Component Access
```
User: "Quiz rankings"
System: "Opening quiz rankings"
[Shows quiz leaderboard]
```

---

## Voice Recognition Tips

### Natural Language
The system understands natural variations:
- "Open X" = "Go to X" = "X page"
- "My X" = "Student X" = "X"
- "Show X" = "Read X" = "Open X"

### Component Names
Use simple, descriptive names:
- ✅ "Continue watching"
- ✅ "Recent activity"
- ✅ "Progress"
- ✅ "Statistics"

### Page Names
Multiple ways to say the same thing:
- "Recorded videos" = "Recorded classes"
- "Video lessons" = "Lessons videos"
- "Quiz rankings" = "Quiz leaderboard"

---

## Student Dashboard Sections

When on the dashboard, you can read specific sections:

1. **Continue Watching** - Videos you're currently watching
2. **Recent Activity** - Your recent learning activities
3. **Your Progress** - Overall progress percentage and stats
4. **Statistics** - Detailed learning statistics
5. **Quick Actions** - Buttons to navigate to different pages

---

## Best Practices

### For Navigation
1. Use short commands: "Recorded videos" instead of "Please open the recorded videos page"
2. Be specific: "Quiz rankings" vs just "Rankings"
3. Use natural language: "My progress" works just as well as "Show progress"

### For Reading
1. Start with "Read page" for overview
2. Then drill down: "Read continue watching" for details
3. Stop when needed: "Stop reading"

### For Efficiency
1. Combine navigation + reading:
   - Navigate: "Open video lessons"
   - Then read: "Read page"
2. Use component reading for specific info:
   - "My progress" - Quick progress check
   - "Recent activity" - See what you did recently

---

## Troubleshooting

### Command Not Recognized
If a command doesn't work:
1. Try a variation: "Video lessons" → "Open video lessons"
2. Be more specific: "Rankings" → "Quiz rankings"
3. Use simpler words: "Go to recorded videos"

### Wrong Page Opens
If wrong page opens:
1. Use full name: "Student quizzes" instead of just "Quizzes"
2. Add context: "Quiz rankings page"
3. Be explicit: "Open student assignments"

### Reading Issues
If reading doesn't work:
1. Make sure you're on the right page
2. Use exact component names: "Continue watching" not "Continue watch"
3. Try "Read page" first to hear all headings

---

## Quick Reference Card

**Most Used Student Commands:**
- 📹 "Recorded videos" → Recorded classes page
- 📚 "Video lessons" → Video lessons page
- 🎥 "Live classes" → Live classes page
- 📝 "Student quizzes" → Quizzes page
- 🏆 "Quiz rankings" → Quiz leaderboard
- 📊 "Overall rankings" → Overall leaderboard
- 📋 "Student assignments" → Assignments page
- ▶️ "Continue watching" → Read continue watching section
- 📈 "My progress" → Read progress section
- 📅 "Recent activity" → Read recent activity
- 📊 "Statistics" → Read statistics

**Reading Commands:**
- 📖 "Read page" → Read headings only
- 🔍 "Read [component]" → Read full component
- ⏹️ "Stop reading" → Stop immediately

**Navigation:**
- 🏠 "Dashboard" → Go to dashboard
- ⚙️ "Settings" → Go to settings
- ⬅️ "Go back" → Previous page
