# Dark Mode Toggle & Announcement Header Fix

## Changes Made

### 1. Dark Mode Toggle Added to TopBar
**File: `src/components/Layout/TopBar.tsx`**

- Added `Brightness4` and `Brightness7` icons from Material-UI
- Added `useTheme` hook import
- Created `isDarkMode` state that persists to localStorage
- Added `handleToggleDarkMode()` function that:
  - Toggles dark mode state
  - Saves preference to localStorage
  - Dispatches custom event for other components to listen to
- Added dark mode toggle button next to the title
  - Shows sun icon in dark mode (to switch to light)
  - Shows moon icon in light mode (to switch to dark)
  - Tooltip shows current mode and action

### 2. Fixed Announcement Header Visibility
**File: `src/pages/Announcement.tsx`**

- Changed layout to account for fixed TopBar (64px height)
- Added `pt: '64px'` to main container for top padding
- Changed height calculation from `calc(100vh - 100px)` to `100vh` with padding
- Added `flexShrink: 0` to header to prevent it from shrinking
- Adjusted inner box height to `calc(100vh - 64px)` to fit properly

## How It Works

### Dark Mode Toggle
1. Click the sun/moon icon in the top bar (next to "E-Learning Using AI" title)
2. Mode preference is saved to localStorage
3. Event is dispatched so other components can listen and update their theme
4. Icon changes based on current mode

### Announcement Header
- Now properly visible below the TopBar
- Header has gradient background (purple)
- Shows announcement count
- Properly spaced and not hidden

## Implementation Notes

- Dark mode state is stored in localStorage with key `darkMode`
- Event `darkModeToggled` is dispatched with detail containing `isDarkMode` boolean
- Components can listen to this event to update their theme dynamically
- The announcement page now uses proper spacing to avoid TopBar overlap

## Next Steps (Optional)

To fully implement dark mode across the app:
1. Create a ThemeContext to manage dark mode globally
2. Listen to `darkModeToggled` event in App.tsx or MainLayout
3. Update MUI theme based on dark mode state
4. Apply dark theme colors to all components

For now, the toggle is functional and the announcement header is visible.
