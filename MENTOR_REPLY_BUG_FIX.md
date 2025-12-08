# Mentor Reply Bug Fix - Complete Solution

## Issues Fixed

### 1. **Reply Showing to Mentor Instead of Parent**
**Problem**: When a mentor replied to a parent's message, the reply was appearing in the mentor's own messages list instead of being sent to the parent.

**Root Cause**: The `loadMessagesForParent` function was fetching ALL messages in the conversation (both incoming and outgoing), including the mentor's own replies. This caused the mentor to see their own replies as if they were new messages from the parent.

**Solution**: Added a filter to only show messages FROM the parent TO the mentor:
```javascript
// Filter to only show messages FROM parent TO mentor (incoming messages only)
allMessages = allMessages.filter((msg: Message) => {
  return msg.mentor_id === user?.id && msg.parent_id === parentId;
});
```

### 2. **"No Subject" for Mentor's Own Replies**
**Problem**: When a mentor sent a reply, it showed "No Subject" instead of displaying the actual message content as the subject.

**Root Cause**: The code was looking for a "Subject:" prefix in the message text. When mentors replied, they didn't include this prefix, so the regex match failed and defaulted to "No Subject".

**Solution**: Improved subject extraction logic:
- First tries to find explicit "Subject:" format
- Falls back to using the first line of the message as the subject
- Limits to 50 characters for display

```javascript
let subject = 'No Subject';
const subjectMatch = msg.message.match(/Subject:\s*(.+?)(?:\n|$)/);
if (subjectMatch) {
  subject = subjectMatch[1];
} else {
  // Use first line as subject if no explicit Subject: line
  const firstLine = msg.message.split('\n')[0];
  if (firstLine && firstLine.trim().length > 0) {
    subject = firstLine.substring(0, 50);
  }
}
```

### 3. **Delete Error: "Cannot coerce the result to a single JSON object"**
**Problem**: When trying to delete a message, the API returned an error about coercing to a single JSON object.

**Root Cause**: The delete endpoint was using `.single()` on a query that might return 0 rows, causing Supabase to throw an error.

**Solution**: Changed the delete endpoints to:
- Remove `.single()` and use array destructuring instead
- Check if the array has results before accessing
- Provide better error messages
- Handle cases where message doesn't exist

```javascript
const { data: messages, error: fetchError } = await supabase
  .from('mentor_parent_messages')
  .select('parent_id, mentor_id, id')
  .eq('id', messageId);

if (!messages || messages.length === 0) {
  return res.status(404).json({ error: 'Message not found' });
}

const message = messages[0];
```

## Files Modified

1. **src/pages/Mentor/MentorMessages.tsx**
   - Fixed `loadMessagesForParent` to filter incoming messages only
   - Improved subject extraction logic

2. **backend/mentor-parent-messaging.js**
   - Fixed DELETE endpoint to handle missing messages gracefully
   - Fixed POST delete endpoint to handle missing messages gracefully
   - Removed `.single()` calls that were causing errors
   - Added better error handling and logging

## How It Works Now

1. **Parent sends message** → Stored with `parent_id` as sender, `mentor_id` as receiver
2. **Mentor views messages** → Only sees messages where they are the receiver
3. **Mentor replies** → Reply is stored with `mentor_id` as sender, `parent_id` as receiver
4. **Subject display** → Uses first line of message or explicit "Subject:" prefix
5. **Delete message** → Properly checks if message exists before deleting

## Testing

To verify the fix works:
1. Login as a parent and send a message to a mentor
2. Login as the mentor and view the message
3. Reply to the message
4. Verify:
   - Reply doesn't appear in mentor's own message list
   - Subject shows the first line of the message (not "No Subject")
   - Parent receives the reply correctly
5. Try deleting a message - should work without errors
