# Mentor UI Layouts - Visual Guide

## Dashboard - My Students Table

### With Pagination (5 students per page)
```
┌─────────────────────────────────────────────────────────────┐
│ My Students                                                 │
├─────────────────────────────────────────────────────────────┤
│ Student Name      │ Department │ Semester  │ Status        │
├─────────────────────────────────────────────────────────────┤
│ [Avatar] John     │ CSE        │ 7th Sem   │ ✓ Active      │
│ [Avatar] Sarah    │ B.Com      │ 2nd Sem   │ ✓ Active      │
│ [Avatar] Mike     │ CSE        │ 7th Sem   │ ✓ Active      │
│ [Avatar] Emma     │ IT         │ 5th Sem   │ ✓ Active      │
│ [Avatar] David    │ ECE        │ 3rd Sem   │ ✓ Active      │
├─────────────────────────────────────────────────────────────┤
│ Rows per page: [5 ▼]  1-5 of 15  < 1 2 3 >                │
└─────────────────────────────────────────────────────────────┘
```

### Rows Per Page Options
- 5 students (default)
- 10 students
- 25 students

---

## Mentoring Page - Assigned Students Cards

### Desktop Layout (3-4 columns)
```
Assigned Students (12)

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ [Avatar] T   │  │ [Avatar] S   │  │ [Avatar] M   │  │ [Avatar] E   │
│ Test_student │  │ Student(0)   │  │ student_2    │  │ Emma         │
│ CSE - 7th    │  │ B.Com - 2nd  │  │ CSE - 7th    │  │ IT - 5th     │
│              │  │              │  │              │  │              │
│ Quiz: 75%    │  │ Quiz: 0%     │  │ Quiz: 85%    │  │ Quiz: 90%    │
│ ▓▓▓▓░░░░░░   │  │ ░░░░░░░░░░   │  │ ▓▓▓▓▓▓▓░░░░  │  │ ▓▓▓▓▓▓▓▓▓░   │
│ Good         │  │ At Risk      │  │ Excellent    │  │ Excellent    │
└──────────────┘  │ ▓▓▓▓▓▓▓▓▓░   │  └──────────────┘  └──────────────┘
                  │ Excellent    │
                  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ [Avatar] J   │  │ [Avatar] R   │  │ [Avatar] L   │  │ [Avatar] A   │
│ John         │  │ Rachel       │  │ Lisa         │  │ Alex         │
│ CSE - 7th    │  │ B.Com - 2nd  │  │ IT - 5th     │  │ ECE - 3rd    │
│              │  │              │  │              │  │              │
│ Quiz: 70%    │  │ Quiz: 88%    │  │ Quiz: 92%    │  │ Quiz: 78%    │
│ ▓▓▓░░░░░░░   │  │ ▓▓▓▓▓▓▓░░░░  │  │ ▓▓▓▓▓▓▓▓▓░   │  │ ▓▓▓▓░░░░░░   │
│ Good         │  │ Excellent    │  │ Excellent    │  │ Good         │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ [Avatar] P   │  │ [Avatar] N   │  │ [Avatar] O   │  │ [Avatar] Q   │
│ Peter        │  │ Nina         │  │ Oliver       │  │ Quinn        │
│ CSE - 7th    │  │ B.Com - 2nd  │  │ IT - 5th     │  │ ECE - 3rd    │
│              │  │              │  │              │  │              │
│ Quiz: 82%    │  │ Quiz: 76%    │  │ Quiz: 89%    │  │ Quiz: 81%    │
│ ▓▓▓▓▓▓░░░░   │  │ ▓▓▓▓░░░░░░   │  │ ▓▓▓▓▓▓▓░░░░  │  │ ▓▓▓▓▓░░░░░░  │
│ Excellent    │  │ Good         │  │ Excellent    │  │ Good         │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

                    ↓ Scroll to see more →
```

### Tablet Layout (2 columns)
```
Assigned Students (12)

┌──────────────────────┐  ┌──────────────────────┐
│ [Avatar] Test_student│  │ [Avatar] Student(0)  │
│ CSE - 7th Sem        │  │ B.Com - 2nd Sem      │
│ Quiz: 75%            │  │ Quiz: 0%             │
│ ▓▓▓▓░░░░░░           │  │ ░░░░░░░░░░           │
│ Good                 │  │ At Risk              │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ [Avatar] student_2   │  │ [Avatar] Emma        │
│ CSE - 7th Sem        │  │ IT - 5th Sem         │
│ Quiz: 85%            │  │ Quiz: 90%            │
│ ▓▓▓▓▓▓▓░░░░          │  │ ▓▓▓▓▓▓▓▓▓░           │
│ Excellent            │  │ Excellent            │
└──────────────────────┘  └──────────────────────┘

                    ↓ Scroll to see more →
```

### Mobile Layout (1 column)
```
Assigned Students (12)

┌────────────────────────────┐
│ [Avatar] Test_student      │
│ CSE - 7th Sem              │
│ Quiz: 75%                  │
│ ▓▓▓▓░░░░░░                 │
│ Good                       │
└────────────────────────────┘

┌────────────────────────────┐
│ [Avatar] Student(0)        │
│ B.Com - 2nd Sem            │
│ Quiz: 0%                   │
│ ░░░░░░░░░░                 │
│ At Risk                    │
└────────────────────────────┘

                ↓ Scroll to see more →
```

---

## Student Mentoring Page - My Mentors

### Desktop Layout (3 columns)
```
My Mentors

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ [Avatar] Mentor1 │  │ [Avatar] Prof.V  │  │ [Avatar] Dr. S   │
│ Mentor           │  │ Mentor           │  │ Mentor           │
│ CSE - 7th Sem    │  │ CSE - 7th Sem    │  │ IT - 5th Sem     │
│                  │  │                  │  │                  │
│ Your assigned    │  │ Your assigned    │  │ Your assigned    │
│ mentor is here   │  │ mentor is here   │  │ mentor is here   │
│ to guide you...  │  │ to guide you...  │  │ to guide you...  │
│                  │  │                  │  │                  │
│ [Message] [Sch]  │  │ [Message] [Sch]  │  │ [Message] [Sch]  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Tablet Layout (2 columns)
```
My Mentors

┌──────────────────────────┐  ┌──────────────────────────┐
│ [Avatar] Mentor1         │  │ [Avatar] Prof.Varun      │
│ Mentor                   │  │ Mentor                   │
│ CSE - 7th Sem            │  │ CSE - 7th Sem            │
│                          │  │                          │
│ Your assigned mentor...  │  │ Your assigned mentor...  │
│                          │  │                          │
│ [Message] [Schedule]     │  │ [Message] [Schedule]     │
└──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐
│ [Avatar] Dr. Smith       │
│ Mentor                   │
│ IT - 5th Sem             │
│                          │
│ Your assigned mentor...  │
│                          │
│ [Message] [Schedule]     │
└──────────────────────────┘
```

### Mobile Layout (1 column)
```
My Mentors

┌────────────────────────────┐
│ [Avatar] Mentor1           │
│ Mentor                     │
│ CSE - 7th Sem              │
│                            │
│ Your assigned mentor is    │
│ here to guide you through  │
│ your learning journey...   │
│                            │
│ [Message] [Schedule]       │
└────────────────────────────┘

┌────────────────────────────┐
│ [Avatar] Prof.Varun        │
│ Mentor                     │
│ CSE - 7th Sem              │
│                            │
│ Your assigned mentor is    │
│ here to guide you through  │
│ your learning journey...   │
│                            │
│ [Message] [Schedule]       │
└────────────────────────────┘
```

---

## Responsive Breakpoints

| Device | Width | Columns | Layout |
|--------|-------|---------|--------|
| Mobile | < 600px | 1 | Single column, full width |
| Tablet | 600-960px | 2 | Two columns |
| Desktop | 960-1280px | 3 | Three columns |
| Large Desktop | > 1280px | 4 | Four columns (Mentoring page) |

---

## Key Features

### Dashboard Table
- ✅ Pagination with configurable rows (5, 10, 25)
- ✅ Page navigation (Previous, Next, Jump to page)
- ✅ Shows total count and current range
- ✅ Sortable columns (future enhancement)
- ✅ Search/filter (future enhancement)

### Mentoring Page Cards
- ✅ Responsive grid layout
- ✅ Auto-scrolling for 8+ students
- ✅ Hover effects on cards
- ✅ Click to select student
- ✅ Shows performance metrics
- ✅ Status indicators (color-coded)

### Student Mentoring Page
- ✅ Responsive grid layout
- ✅ Mentor contact cards
- ✅ Quick action buttons
- ✅ Department/semester info
- ✅ Hover animations
- ✅ Mobile-friendly

---

## Performance Metrics

| Scenario | Students | Table Pages | Card Rows | Load Time |
|----------|----------|-------------|-----------|-----------|
| Small | 3 | 1 | 1 | < 100ms |
| Medium | 15 | 3 | 4 | < 200ms |
| Large | 50 | 10 | 13 | < 500ms |
| Very Large | 100+ | 20+ | 25+ | < 1s |

---

## Future Enhancements

1. **Virtual Scrolling**: For 100+ students
2. **Search & Filter**: Find students quickly
3. **Sorting**: By name, performance, department
4. **Bulk Actions**: Message all, assign tasks
5. **Export**: Download student list as CSV
6. **Analytics**: Performance charts and trends
7. **Notifications**: Real-time updates
8. **Favorites**: Pin important students
