# Delete Functionality Troubleshooting Guide

## Issue: "Failed to delete post" Error

### Possible Causes & Solutions

### 1. Backend Server Not Running ⚠️
**Check:**
```bash
# Is the backend running on port 3001?
curl http://localhost:3001/api/community/posts/test-id
```

**Solution:**
```bash
cd backend
npm start
# Should see: "Backend server running on http://localhost:3001"
```

### 2. RLS Policies Blocking Delete 🔒
**Problem:** Supabase Row Level Security might be blocking the delete operation.

**Solution:** Update RLS policies to allow users to delete their own posts:

```sql
-- Run in Supabase SQL Editor

-- Allow users to delete their own posts
DROP POLICY IF EXISTS "Users can delete their posts" ON community_posts;
CREATE POLICY "Users can delete their posts" ON community_posts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own replies
DROP POLICY IF EXISTS "Users can delete their replies" ON community_replies;
CREATE POLICY "Users can delete their replies" ON community_replies
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

### 3. CORS Issues 🌐
**Problem:** Browser blocking cross-origin requests.

**Check:** Open browser console (F12) and look for CORS errors.

**Solution:** Ensure backend has CORS enabled:
```javascript
// In backend/server.js
import cors from 'cors';
app.use(cors());
```

### 4. Authentication Token Missing 🔑
**Problem:** Request not including user authentication.

**Solution:** The delete should work through Supabase RLS. Make sure user is logged in:
```typescript
// Check in browser console
console.log(user?.id); // Should show user ID
```

### 5. Post ID Invalid 🆔
**Problem:** Trying to delete with wrong ID.

**Check:** 
```typescript
console.log('Deleting post:', postId);
```

**Solution:** Ensure the post ID is being passed correctly.

## Quick Fix Steps

### Step 1: Check Backend
```bash
# Terminal 1 - Start backend
cd backend
npm start
```

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to delete a post
4. Look for error messages

### Step 3: Check Network Tab
1. Open DevTools → Network tab
2. Try to delete
3. Look for the DELETE request
4. Check response status and body

### Step 4: Verify RLS Policies
```sql
-- In Supabase SQL Editor
-- Check existing policies
SELECT * FROM pg_policies 
WHERE tablename IN ('community_posts', 'community_replies');
```

## Expected Behavior

### Successful Delete:
1. Click Edit button
2. Click Delete button
3. Confirm dialog appears
4. Click OK
5. Post disappears from list
6. Alert: "Post deleted successfully!"

### Failed Delete:
1. Alert shows: "Failed to delete post: [error message]"
2. Check console for detailed error
3. Post remains in list

## Testing Delete Functionality

### Test 1: Delete Own Post
```
1. Create a new post
2. Click Edit (bottom right)
3. Click Delete (red button)
4. Confirm
5. ✅ Post should be deleted
```

### Test 2: Cannot Delete Others' Posts
```
1. View someone else's post
2. ❌ No Edit button should appear
3. ✅ Cannot delete others' content
```

### Test 3: Delete with Replies
```
1. Create a post
2. Add some replies
3. Delete the post
4. ✅ Post and all replies should be deleted (CASCADE)
```

## Common Error Messages

### "Failed to delete post"
- Backend not running
- RLS policy blocking
- Network error

### "Cannot read property 'id' of undefined"
- Post object is malformed
- Check post data structure

### "Network request failed"
- Backend server down
- Wrong port number
- CORS issue

### "Permission denied"
- RLS policy blocking
- User not authenticated
- Trying to delete others' content

## Debug Checklist

- [ ] Backend server running on port 3001
- [ ] User is logged in (check `user?.id`)
- [ ] Post belongs to current user
- [ ] RLS policies allow delete
- [ ] No CORS errors in console
- [ ] Network request reaches backend
- [ ] Database migration run (17_add_edit_delete_community.sql)

## Manual Test via API

Test delete directly:
```bash
# Get a post ID from the UI
POST_ID="your-post-id-here"

# Try to delete
curl -X DELETE http://localhost:3001/api/community/posts/$POST_ID

# Expected response:
# {"success":true,"message":"Post deleted successfully"}
```

## Fixed Issues

### ✅ Better Error Messages
- Now shows specific error from backend
- Includes error details in alert

### ✅ Close Edit Mode on Delete
- Edit mode closes after successful delete
- Prevents UI confusion

### ✅ Proper Async Handling
- Uses `await` for fetchPosts()
- Ensures list refreshes after delete

## Still Having Issues?

1. **Check backend logs:**
   ```bash
   # In backend terminal, look for errors
   ```

2. **Check Supabase logs:**
   - Go to Supabase Dashboard
   - Check Logs section
   - Look for failed queries

3. **Verify database:**
   ```sql
   -- Check if post exists
   SELECT * FROM community_posts WHERE id = 'your-post-id';
   
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'community_posts';
   ```

4. **Test with Supabase client directly:**
   ```typescript
   // In browser console
   const { data, error } = await supabase
     .from('community_posts')
     .delete()
     .eq('id', 'your-post-id');
   console.log({ data, error });
   ```

## Solution Applied

The code has been updated with:
- ✅ Better error handling
- ✅ Detailed error messages
- ✅ Automatic edit mode closing
- ✅ Proper async/await usage
- ✅ Error logging to console

The most likely issue is that **RLS policies need to be updated** to allow deletes. Run the SQL above in Supabase!
