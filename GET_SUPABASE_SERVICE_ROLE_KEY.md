# Get Your Supabase Service Role Key

The backend needs the Service Role Key to access the database with admin privileges. Here's how to get it:

## Steps to Get Service Role Key

1. **Go to Supabase Dashboard**
   - Open: https://app.supabase.com
   - Select your project

2. **Navigate to Settings**
   - Click "Settings" in the left sidebar
   - Click "API" in the submenu

3. **Find Service Role Secret**
   - Look for "Service Role Secret" (also called "Service Role Key")
   - Click the eye icon to reveal it
   - Copy the entire key (it's a long JWT token)

4. **Update .env File**
   - Open `.env` in your project root
   - Find the line: `SUPABASE_SERVICE_ROLE_KEY=...`
   - Replace the placeholder with your actual key
   - Save the file

5. **Restart Backend**
   - Stop the backend server (Ctrl+C)
   - Run: `node backend/server.js`
   - The backend should now connect successfully

## Example .env Format

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Verify It Works

After updating the key and restarting:

1. Go to `/link-account` page
2. You should see existing users in the dropdowns
3. If still empty, check browser console for errors

## Troubleshooting

**Still getting "Invalid API key" error?**
- Make sure you copied the ENTIRE key (it's very long)
- Make sure there are no extra spaces before/after the key
- Restart the backend after updating .env
- Check that the key starts with `eyJ` (JWT format)

**Can't find Service Role Secret?**
- Make sure you're in the right project
- Check Settings > API section
- The key should be labeled "Service Role Secret" or "Service Role Key"
- It's different from the "Anon Key" - make sure you copy the right one

**Backend still won't connect?**
- Check the backend console for error messages
- Verify the SUPABASE_URL is correct
- Make sure the key hasn't expired (Supabase keys don't expire, but check if it's valid)
