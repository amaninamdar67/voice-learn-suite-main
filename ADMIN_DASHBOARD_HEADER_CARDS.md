# Admin Dashboard - Header Live Data Cards

## Layout Update

The "Active Live Classes" and "Active Users" cards have been moved to the top right of the page, beside the main heading.

### New Header Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Admin Dashboard                    🎥 1        👥 0           │
│  System overview and management     Active     Active Users    │
│                                     Live       (24h)           │
│                                     Classes                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Header Layout Details

**Left Side (Title Section)**
- Main heading: "Admin Dashboard" (h4, bold)
- Subtitle: "System overview and management" (body1, secondary color)

**Right Side (Live Data Cards)**
- Two cards in a 2-column grid
- Minimum width: 280px
- Gap between cards: 1.5

**Active Live Classes Card**
- Icon: 🎥 (red background)
- Border: 2px solid #f5576c (red)
- Number color: #f5576c
- Font size: 1.5rem (h6)
- Label: "Active Live Classes"

**Active Users Card**
- Icon: 👥 (purple background)
- Border: 2px solid #667eea (purple)
- Number color: #667eea
- Font size: 1.5rem (h6)
- Label: "Active Users (24h)"

### Styling

**Card Properties**
- Background: white (#fff)
- Border radius: 1
- Padding: 1.5
- Text align: center
- Box shadow: 0 2px 6px with color-specific opacity

**Icon Box**
- Padding: 0.5
- Border radius: 0.75
- Font size: 1.2rem
- Centered display

### Data Flow

```
Backend Endpoints
├── /api/stats/active-users-count → Active Users card
└── /api/stats/ongoing-live-classes-count → Active Live Classes card

Updates every 10 seconds
```

### Responsive Behavior

- On desktop: Cards display side-by-side on the right
- On tablet/mobile: Cards may stack or adjust based on screen width
- Header uses flexbox with space-between for proper alignment

### Content Below Header

After the header section, the page displays:

1. **System Activity Analytics** (Full width)
   - 4 charts in 2x2 grid

2. **Stats & Quick Access** (65% width)
   - 4 stat cards (Domains, Sub-Domain, Students, Teachers)

3. **Recent Activities** (35% width)
   - Scrollable activity list

## Files Modified

- `src/pages/Admin/AdminDashboard.tsx` - Moved live data cards to header

## Visual Hierarchy

1. **Most Important**: Live data cards (top right, prominent)
2. **Important**: System Activity Analytics (full width, charts)
3. **Secondary**: Stats & Quick Access (left side)
4. **Reference**: Recent Activities (right side)

## Benefits

✅ Live metrics visible at a glance
✅ Prominent placement for critical data
✅ Clean header design
✅ Maintains all functionality
✅ Responsive layout
✅ Real-time updates every 10 seconds
