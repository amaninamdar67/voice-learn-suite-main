# System Configuration Troubleshooting Guide

## Issue: Voice Navigation Not Disabling

### Step 1: Check if Database Table Exists

**You MUST run this SQL in Supabase first:**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the entire content of `database/10_system_config.sql`
4. Click "Run"
5. You should see: "System configuration tables created successfully!"

### Step 2: Verify Table Was Created

Run this query in Supabase SQL Editor:

```sql
SELECT * FROM system_config WHERE config_key = 'features';
```

You should see a row with feature settings.

### Step 3: Check Browser Console

1. Open your app in browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for these messages:
   - `Loaded system config: {chat: true, aiTutor: true, ...}`
   - `System features updated: {chat: true, aiTutor: true, ...}`

### Step 4: Test Feature Toggle

1. Go to System Configuration page
2. Turn OFF "Voice Navigation"
3. Click "Save Configuration"
4. Check console for:
   - `Configuration saved successfully!`
   - `Loaded system config: {...voiceNavigation: false...}`
   - `System features updated: {...voiceNavigation: false...}`
5. Voice Navigator button should disappear from bottom-left

### Common Issues

#### Issue: "relation system_config does not exist"
**Solution:** Run `database/10_system_config.sql` in Supabase

#### Issue: Voice Navigator still shows after disabling
**Possible causes:**
1. Database table not created - Run the SQL migration
2. Browser cache - Hard refresh (Ctrl+Shift+R)
3. Config not loading - Check browser console for errors
4. Backend not running - Restart backend server

#### Issue: "Configuration saved successfully" but nothing changes
**Solution:** 
1. Check browser console for config updates
2. Wait 2-3 seconds for auto-refresh
3. Manually refresh the page
4. Check if backend is running on port 3001

### Debug Checklist

- [ ] Ran `database/10_system_config.sql` in Supabase
- [ ] Verified table exists with SELECT query
- [ ] Backend server is running (http://localhost:3001)
- [ ] Frontend is running (http://localhost:8080 or 5173)
- [ ] Browser console shows "Loaded system config"
- [ ] No errors in browser console
- [ ] Tried hard refresh (Ctrl+Shift+R)

### Manual Test

Open browser console and run:

```javascript
// Check if config context is working
fetch('http://localhost:3001/api/system/config')
  .then(r => r.json())
  .then(d => console.log('Config from API:', d));
```

You should see the current configuration.

### Expected Behavior

When Voice Navigation is **OFF**:
- ❌ No microphone button in bottom-left
- ❌ Cannot use spacebar for voice commands
- ❌ No voice navigation features

When Voice Navigation is **ON**:
- ✅ Microphone button visible in bottom-left
- ✅ Can use spacebar for voice commands
- ✅ Voice navigation works

### Still Not Working?

1. Check backend logs for errors
2. Verify Supabase connection is working
3. Make sure you're logged in as admin
4. Try logging out and back in
5. Clear browser cache completely
6. Restart both frontend and backend servers

### Contact Points

If still having issues, check:
1. Browser console errors (F12 → Console)
2. Backend terminal output
3. Supabase logs (Dashboard → Logs)
