# Perplexity API Key - Visual Guide

## Where to Find It

### Option 1: From Perplexity Main Site
1. Go to https://www.perplexity.ai/
2. Click your **profile icon** (top right)
3. Select **"Settings"**
4. Look for **"API"** or **"Developer"** in left menu
5. Click **"Create API Key"**

### Option 2: Direct API Dashboard
Go directly to: **https://www.perplexity.ai/api/**

This should show you:
- Your existing API keys (if any)
- A button to create a new key
- Your usage statistics

### Option 3: From Docs (Where You Are Now)
1. Look at the **left sidebar** on the docs page
2. Find **"Generate Auth Token"** or similar
3. Or click your profile icon in top right
4. Select **"API Keys"** or **"Account"**

## What You'll See

When you create a key, you'll get something like:
```
pplx-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Important:** Copy it immediately! You won't see it again.

## Adding to Your Project

### File: `backend/.env`

Find this line:
```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

Replace with your actual key:
```
PERPLEXITY_API_KEY=pplx-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Save the file** and restart your backend.

## Verification

After adding the key, test it:

1. Open AI Tutor in your app
2. Upload an image
3. Send a message
4. Check backend console for:
   - `[Perplexity] API Key check: Present (pplx-...)`
   - `[Perplexity] Response: ...`

If you see these, it's working!

## Common Issues

| Issue | Solution |
|-------|----------|
| "API key not configured" | Check `.env` file has the key |
| "Invalid API key" | Copy the key again, no extra spaces |
| "Rate limit exceeded" | Free tier limit hit, wait 24h or upgrade |
| "Payload too large" | Image is too big, try smaller image |

## Need Help?

1. Check the console for error messages
2. Verify the key starts with `pplx-`
3. Make sure `.env` file is saved
4. Restart the backend server
5. Try a different image (smaller file)
