# How to Get Perplexity API Key - Step by Step

## Quick Steps:

### Step 1: Go to Perplexity Account
1. Click on your **profile icon** (top right corner of Perplexity docs page)
2. Select **"Account"** or **"Settings"**

### Step 2: Find API Keys Section
1. Look for **"API Keys"** or **"Developer"** section in the left sidebar
2. Click on it

### Step 3: Create New API Key
1. Click **"Create New API Key"** or **"Generate API Key"** button
2. Give it a name (e.g., "AI Tutor")
3. Click **"Create"**

### Step 4: Copy the Key
1. Your API key will appear (looks like: `pplx-xxxxxxxxxxxxxxxx`)
2. **Copy it immediately** - you won't see it again!
3. Keep it safe

### Step 5: Add to Your Project
1. Open `backend/.env` in your editor
2. Find this line: `PERPLEXITY_API_KEY=your_perplexity_api_key_here`
3. Replace with your actual key:
   ```
   PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxx
   ```
4. Save the file

### Step 6: Restart Backend
1. Stop your backend server (if running)
2. Start it again
3. Done! Image uploads will now work

## Alternative: Direct Link
If you can't find it in settings, try going directly to:
- https://www.perplexity.ai/settings/api

## Troubleshooting

**Can't find API section?**
- Make sure you're logged in to Perplexity
- Try going to: https://www.perplexity.ai/api/

**Key doesn't work?**
- Double-check you copied it correctly
- No extra spaces or quotes
- Make sure it starts with `pplx-`

**Still having issues?**
- Generate a new key
- Restart the backend
- Check console for error messages

## What's the Free Tier Limit?

Perplexity free tier typically allows:
- Limited requests per day (usually 5-10)
- Good for testing
- No credit card required

If you hit the limit, you can:
1. Wait 24 hours for reset
2. Upgrade to paid tier ($5-20/month)
3. Use text-only queries (Groq is unlimited)
