# Reply System Setup

## What was fixed:

1. **Mentor Reply Endpoint** - Changed from `/messages/reply` to `/reply` to avoid conflicts
2. **Parent Replies Filter** - Now only shows mentor replies (messages with `reply_to_id`), not parent's own messages
3. **Database Schema** - Added `reply_to_id` column to track reply relationships

## Database Migration Required

Run this SQL in your Supabase console to add the reply tracking column:

```sql
ALTER TABLE mentor_parent_messages 
ADD COLUMN reply_to_id BIGINT REFERENCES mentor_parent_messages(id) ON DELETE CASCADE;

CREATE INDEX idx_mentor_parent_messages_reply_to ON mentor_parent_messages(reply_to_id);
```

## How it works:

**Mentor Module (Messages Page):**
- Click on a parent message to open the dialog
- Type your reply in the "Replies" section
- Click "Send Reply" button
- Your reply will appear in the replies list

**Parent Module (Children View - Replies Tab):**
- Go to "My Children" > select a child > "Replies" tab
- Shows only mentor's replies to your messages
- Each reply shows mentor name, timestamp, and full message

## Testing:

1. Parent sends message to mentor
2. Mentor opens Messages page, clicks on the message
3. Mentor types reply and clicks "Send Reply"
4. Parent goes to Replies tab and sees the mentor's reply
