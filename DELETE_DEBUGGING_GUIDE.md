# Delete Functionality Debugging Guide

## Issue
Both parent and mentor pages show error when trying to delete messages:
- Error: `<pre>Cannot DELETE /api/mentor-parent/messages/1</pre>`
- This suggests the DELETE route isn't being recognized

## Changes Made

### 1. Added Test DELETE Endpoint
**File**: `backend/server.js`
- Added `/api/test-delete/:id` endpoint to verify DELETE method works
- Test this first: `curl -X DELETE http://localhost:3001/api/test-delete/123`

### 2. Enhanced Delete Endpoint Logging
**File**: `backend/mentor-parent-messaging.js`
- Added detailed console logging at each step:
  - `[DELETE] Attempting to delete message: {messageId} by user: {userId}`
  - `[DELETE] Message found: {parent_id, mentor_id, is_deleted}`
  - `[DELETE] Unauthorized - user is neither parent nor mentor`
  - `[DELETE] Message deleted successfully: {messageId}`
  - `[DELETE] Error deleting message: {error}`

### 3. Backend Filtering
- All message fetch endpoints now exclude deleted messages with `.eq('is_deleted', false)`
- Endpoints updated:
  - `/mentor-messages/:mentorId`
  - `/conversations/:mentorId/:parentId`
  - `/messages/:messageId/replies`

## Debugging Steps

### Step 1: Test DELETE Method Works
```bash
curl -X DELETE http://localhost:3001/api/test-delete/123
```
Expected response: `{"success":true,"message":"DELETE works","id":"123"}`

### Step 2: Check Backend Logs
When you click delete, check the backend console for:
- `[DELETE] Attempting to delete message: ...`
- Look for any error messages

### Step 3: Verify Message Exists
Check if the message ID is correct and exists in the database

### Step 4: Check User Authorization
Verify the userId being sent matches either parent_id or mentor_id of the message

## Common Issues & Solutions

### Issue: "Cannot DELETE /api/mentor-parent/messages/1"
**Cause**: Route not being recognized
**Solution**: 
1. Restart backend server
2. Check if router is properly registered in server.js
3. Verify express.json() middleware is loaded

### Issue: "Unauthorized: You can only delete your own messages"
**Cause**: userId doesn't match parent_id or mentor_id
**Solution**:
1. Verify user.id is being sent correctly from frontend
2. Check database to confirm message parent_id/mentor_id values
3. Ensure you're logged in as the correct user

### Issue: Message still appears after deletion
**Cause**: Frontend not refreshing data
**Solution**:
1. Check browser console for errors
2. Verify loadParentMessages() is being called
3. Clear browser cache and reload

## Frontend Debugging

### Check Console Logs
Open browser DevTools (F12) and look for:
- `Deleting message: {messageId} User ID: {userId}`
- `Delete response status: 200`
- `Delete success: {data}`

### Verify Request
In Network tab, check the DELETE request:
- URL: `http://localhost:3001/api/mentor-parent/messages/{messageId}`
- Method: DELETE
- Body: `{"userId":"{userId}"}`
- Status: Should be 200

## Files Modified
1. `backend/server.js` - Added test DELETE endpoint
2. `backend/mentor-parent-messaging.js` - Enhanced logging
3. `src/pages/Mentor/MentorMessages.tsx` - Already has logging

## Next Steps
1. Restart backend server
2. Try deleting a message
3. Check backend console for `[DELETE]` logs
4. Check browser console for any errors
5. Report any error messages found
