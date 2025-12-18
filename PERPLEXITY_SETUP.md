# Perplexity AI Integration Setup

## Overview
Perplexity AI is now integrated as the primary image analysis provider for the AI Tutor. It offers:
- **Free tier available** - No credit card required initially
- **Vision capabilities** - Analyze images, documents, PDFs
- **Fast responses** - Typically <2 seconds
- **Reliable** - Better than Gemini for this use case

## Getting Your Perplexity API Key

### Step 1: Create Account
1. Go to https://www.perplexity.ai/
2. Sign up for a free account (email or Google/GitHub)

### Step 2: Get API Key
1. Visit https://www.perplexity.ai/api/
2. Click "Get API Key" or go to your account settings
3. Create a new API key
4. Copy the key (it will look like: `pplx-...`)

### Step 3: Add to .env
1. Open `backend/.env`
2. Find the line: `PERPLEXITY_API_KEY=your_perplexity_api_key_here`
3. Replace with your actual key: `PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx`
4. Save the file

### Step 4: Restart Backend
The backend will automatically use Perplexity for image analysis when you upload images.

## How It Works

### Text Queries
- Uses **Groq** (llama-3.1-8b-instant)
- Free, unlimited, <1 second response time
- No API key needed (already configured)

### Image/Document Queries
- Uses **Perplexity** (llama-vision-free)
- Free tier available
- Supports: images, PDFs, documents
- Requires PERPLEXITY_API_KEY

## Pricing

### Perplexity Free Tier
- Limited requests per day
- Good for testing and light usage
- No credit card required

### Perplexity Paid Tier
- $5-20/month depending on usage
- Unlimited requests
- Priority support

## Troubleshooting

### "Perplexity API key not configured"
- Check that PERPLEXITY_API_KEY is in `backend/.env`
- Restart the backend server
- Verify the key is correct (starts with `pplx-`)

### "Invalid Perplexity API key"
- Double-check the key in `.env`
- Make sure there are no extra spaces or quotes
- Generate a new key from Perplexity dashboard

### "Rate limit exceeded"
- You've hit the free tier limit
- Wait a few hours or upgrade to paid tier
- Or use text-only queries (Groq) which are unlimited

## Current Setup

| Provider | Use Case | Status | Cost |
|----------|----------|--------|------|
| **Groq** | Text queries | ✅ Working | Free (unlimited) |
| **Perplexity** | Image/document analysis | ⏳ Needs API key | Free tier available |
| Gemini | (Disabled - API key issues) | ❌ Not working | - |
| Claude | (Disabled - requires payment) | ❌ Not working | - |

## Next Steps

1. Get your Perplexity API key
2. Add it to `backend/.env`
3. Restart the backend
4. Try uploading an image in AI Tutor - it should now work!
