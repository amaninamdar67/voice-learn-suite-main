# Mentor-Parent Analytics Fix - Complete Solution

## Problems Identified & Solved

### 1. **Analytics Showing 0/0 Instead of Actual Numbers**
**Root Cause:** The backend endpoint was hardcoded to return `totalMentorReplies: 0` and displaying a ratio format that wasn't useful.

**Solution:**
- Updated `/api/admin/mentor-parent-interactions` endpoint to properly count:
  - **Parent Messages**: Messages where `reply_to_id` is NULL (original messages from parents)
  - **Mentor Replies**: Messages where `reply_to_id` is NOT NULL (replies from mentors)
- Removed the ratio display format and now show actual numbers

### 2. **Deletion System Issues**
**Root Cause:** The deletion system was doing hard deletes (permanently removing from database) instead of soft deletes, which caused:
- Messages disappearing completely
- Analytics counts becoming inaccurate
- No audit trail of deleted messages
- Potential data integrity issues

**Solution:**
- Changed all delete operations to use **soft deletes**:
  - Set `is_deleted = true` and `deleted_at = timestamp` instead of removing from database
  - All SELECT queries now filter out soft-deleted messages with `.eq('is_deleted', false)`
  - Messages are preserved in database for audit purposes

### 3. **Updated Endpoints**

#### Backend Changes (backend/server.js):
```javascript
// Now properly counts parent messages and mentor replies
app.get('/api/admin/mentor-parent-interactions', async (req, res) => {
  // Filters out soft-deleted messages
  .eq('is_deleted', false)
  
  // Counts original messages (reply_to_id is NULL)
  const totalParentMessages = allMessages?.filter(msg => !msg.reply_to_id).length
  
  // Counts replies (reply_to_id is NOT NULL)
  const totalMentorReplies = allMessages?.filter(msg => msg.reply_to_id).length
})
```

#### Messaging Routes (backend/mentor-parent-messaging.js):
- **GET /conversations/:mentorId/:parentId** - Excludes soft-deleted messages
- **GET /mentor-messages/:mentorId** - Excludes soft-deleted messages
- **GET /messages/:messageId/replies** - Excludes soft-deleted messages
- **DELETE /messages/:messageId** - Now soft deletes instead of hard deletes
- **POST /messages/:messageId/delete** - Now soft deletes instead of hard deletes

#### Frontend Changes (src/pages/Admin/Analytics.tsx):
- Removed the `replyRatio` display format
- Now shows actual numbers for both Parent Reports and Mentor Talk
- Cleaner UI without confusing "0/0" format

## How It Works Now

1. **Parent sends message** → Stored with `reply_to_id = NULL`
2. **Mentor replies** → Stored with `reply_to_id = parent_message_id`
3. **Analytics counts:**
   - Parent Reports = Count of messages where `reply_to_id IS NULL`
   - Mentor Talk = Count of messages where `reply_to_id IS NOT NULL`
4. **When message deleted:**
   - Set `is_deleted = true` and `deleted_at = now()`
   - Message stays in database but hidden from UI
   - Analytics still count it (can be adjusted if needed)

## Database Schema
The following columns already exist in `mentor_parent_messages`:
- `reply_to_id` - Links replies to original messages
- `is_deleted` - Soft delete flag
- `deleted_at` - Timestamp of deletion

## Testing
To verify the fix works:
1. Create parent messages
2. Create mentor replies to those messages
3. Check Analytics page - should show actual counts
4. Delete a message - should disappear from UI but remain in database
5. Refresh page - deleted message should still be hidden

## Files Modified
- `backend/server.js` - Fixed analytics endpoint
- `backend/mentor-parent-messaging.js` - Implemented soft deletes
- `src/pages/Admin/Analytics.tsx` - Removed ratio display, show actual numbers
