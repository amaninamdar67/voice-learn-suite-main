# Admin Dashboard - Stat Cards Update

## Overview
Updated the admin dashboard stat cards with a new compact layout, reorganized metrics, and added quick-access navigation functionality.

## Changes Made

### 1. Stat Cards Reorganization

**Old Layout (4 cards):**
- Total Schools
- Total Students
- Total Teachers
- Active Courses

**New Layout (5 cards - Compact):**
- Total Domains (Blue) - Quick Access to Domains Page
- Total Subdomains (Cyan) - Quick Access to Domains Page
- Total Students (Green) - Quick Access to Users Page
- Total Teachers (Orange) - Quick Access to Users Page
- Live Classes (Purple) - Display only

### 2. Card Sizing

**Dimensions:**
- Grid: 5 columns on desktop, 2 columns on tablet, 1 column on mobile
- Card padding: 2px (compact)
- Icon size: Small (reduced from 1.5rem to 0.75rem)
- Typography: h5 (reduced from h4)
- Gap between cards: 2px (reduced from 3px)

**Visual Changes:**
- Smaller icons in colored boxes
- Compact text labels
- Reduced padding and margins
- Half the size of previous cards

### 3. Quick Access Navigation

**Clickable Cards:**
1. **Total Domains** → Navigates to `/admin/domains`
2. **Total Subdomains** → Navigates to `/admin/domains`
3. **Total Students** → Navigates to `/admin/users`
4. **Total Teachers** → Navigates to `/admin/users`

**Non-Clickable Cards:**
- Live Classes (display only)

**Hover Effects:**
- Subtle transform: translateY(-2px)
- Box shadow: 4
- Smooth transition: 0.2s

### 4. Data Sources

**Total Domains:**
- Source: `/api/domains`
- Counts all domains in the system

**Total Subdomains:**
- Source: `/api/domains`
- Filters domains where `parent_domain_id` is not null
- Shows count of subdomains

**Total Students:**
- Source: `/api/users`
- Filters users with role = 'student'

**Total Teachers:**
- Source: `/api/users`
- Filters users with role = 'teacher'

**Live Classes:**
- Source: `/api/lms/live-classes`
- Counts all active live class sessions

### 5. Color Scheme

| Metric | Color | Hex | Icon |
|--------|-------|-----|------|
| Total Domains | Blue | #2196F3 | School |
| Total Subdomains | Cyan | #00BCD4 | School |
| Total Students | Green | #4CAF50 | People |
| Total Teachers | Orange | #FF9800 | Person |
| Live Classes | Purple | #9C27B0 | Videocam |

### 6. Icons

- **Domains**: School icon
- **Subdomains**: School icon
- **Students**: People icon
- **Teachers**: Person icon
- **Live Classes**: Videocam icon

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard                                             │
│ System overview and management                              │
├─────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │Domain│ │Subdom│ │Stud  │ │Teach │ │Live  │              │
│ │  1   │ │  0   │ │  2   │ │  1   │ │  0   │              │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
├─────────────────────────────────────────────────────────────┤
│ System Activity Analytics (70%)  │ Recent Activities (30%)  │
│                                  │                          │
│ [Chart with legend]              │ [Activity Feed]          │
│                                  │                          │
│ [Stats Grid]                     │                          │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (lg and above)
- 5 columns grid
- Full width layout
- All cards visible

### Tablet (md)
- 2 columns grid
- Wraps to 2 rows
- Cards slightly smaller

### Mobile (xs/sm)
- 1 column grid
- Full width cards
- Stacked vertically

## Navigation Implementation

```typescript
const navigate = useNavigate();

// Domain cards
onClick={() => navigate('/admin/domains')}

// User cards
onClick={() => navigate('/admin/users')}
```

## State Management

**Updated State:**
```typescript
const [stats, setStats] = React.useState<StatCard[]>([
  { title: 'Total Domains', value: 0, icon: <School />, color: '#2196F3' },
  { title: 'Total Subdomains', value: 0, icon: <School />, color: '#00BCD4' },
  { title: 'Total Students', value: 0, icon: <People />, color: '#4CAF50' },
  { title: 'Total Teachers', value: 0, icon: <Person />, color: '#FF9800' },
  { title: 'Live Classes', value: 0, icon: <Videocam />, color: '#9C27B0' },
]);
```

**New State:**
```typescript
const [subdomainCount, setSubdomainCount] = React.useState(0);
```

## Data Loading

**Updated `loadDashboardStats()`:**
- Fetches domains and counts subdomains
- Fetches live classes count
- Removed course/lesson count
- Calculates subdomain count from parent_domain_id

## Files Modified

- `src/pages/Admin/AdminDashboard.tsx`
  - Updated stat cards grid to 5 columns
  - Reduced card size and padding
  - Added navigation functionality
  - Changed metrics (domains, subdomains, live classes)
  - Updated data loading logic
  - Added useNavigate hook

## Features

✅ Compact stat cards (half the size)
✅ 5 metrics displayed
✅ Quick access navigation
✅ Hover effects
✅ Responsive design
✅ Real-time data updates
✅ Color-coded metrics
✅ Icon indicators

## User Experience

1. **Quick Overview**: See key metrics at a glance
2. **Quick Navigation**: Click cards to access related pages
3. **Compact Design**: More content visible on single page
4. **Visual Hierarchy**: Color-coded for easy identification
5. **Responsive**: Works on all screen sizes

## Performance

- Minimal re-renders
- Efficient data fetching
- Smooth transitions
- No layout shifts

## Accessibility

- Semantic HTML
- Proper color contrast
- Keyboard navigation support
- Screen reader friendly
- Clear labels

## Future Enhancements

1. **Animated Counters**: Number animation on load
2. **Trend Indicators**: Show up/down trends
3. **Custom Thresholds**: Highlight when metrics exceed limits
4. **Drill-Down**: Click to see detailed breakdowns
5. **Export**: Download stat snapshots
6. **Comparison**: Compare with previous periods
