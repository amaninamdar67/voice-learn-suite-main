# Mentor Dashboard - Testing Guide

## Issue Found
The backend server is not running. The mentor dashboard endpoints require the backend to be active.

## Steps to Test

### 1. Start the Backend Server
```bash
cd backend
npm start
# or
node server.js
```

The server should output:
```
Backend server running on http://localhost:3001
```

### 2. Test the Mentor Endpoint Manually
Once the server is running, test the endpoint:

```bash
# Using PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/mentor/students/YOUR_MENTOR_ID" -Method Get
$response.Content | ConvertFrom-Json | Format-List
```

Replace `YOUR_MENTOR_ID` with an actual mentor user ID from your database.

### 3. Expected Response
```json
{
  "students": [
    {
      "id": "uuid",
      "full_name": "Student Name",
      "email": "student@example.com",
      "department": "Computer Science",
      "semester": "Fall 2024"
    }
  ],
  "totalSessions": 0,
  "averageRating": 0
}
```

### 4. Check Browser Console
Once the backend is running and you navigate to the Mentor Dashboard:
- The error "Failed to load mentor data" should disappear
- The dashboard should display the stats cards with real data
- The "My Students" table should show assigned students

## Troubleshooting

### If you still see 404 errors:
1. Verify the backend server is running on port 3001
2. Check that `backend/mentor-routes.js` exists
3. Check the backend console for any error messages
4. Restart the backend server

### If the dashboard shows "No students assigned yet":
This is normal if:
- No mentor-student links exist in the database
- The mentor user ID doesn't have any linked students
- You need to create mentor-student links via the Admin > Mentor-Student Linking page

## Files Modified
- `src/pages/Mentor/MentorDashboard.tsx` - Updated to fetch real data
- `backend/mentor-routes.js` - New file with mentor endpoints
- `backend/server.js` - Added mentor routes initialization

## Next Steps
1. Start the backend server
2. Test the endpoint manually
3. Verify the dashboard loads without errors
4. Create test mentor-student links if needed
