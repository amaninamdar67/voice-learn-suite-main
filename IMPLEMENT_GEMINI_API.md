# Implement Gemini API - Step by Step

## Why Gemini?
- ✅ **FREE tier** - 60 requests/minute
- 📸 **Image support** - Excellent image analysis
- 🎯 **High accuracy** - Best quality responses
- ⚡ **Fast** - 1-3 seconds
- 🔒 **Reliable** - Google's infrastructure
- 💰 **No credit card** - Completely free

---

## Step 1: Get Gemini API Key

### 1.1 Go to Google AI Studio
- Visit: https://ai.google.dev
- Click "Get API Key"

### 1.2 Create API Key
- Click "Create API Key"
- Select or create a project
- Copy the key
- Save it safely

### 1.3 Add to .env
```bash
# In your .env file:
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxx
```

---

## Step 2: Install Gemini SDK

```bash
npm install @google/generative-ai
```

---

## Step 3: Create Gemini Routes

Create `backend/gemini-ai-routes.js`:

```javascript
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint with image support
router.post('/chat', async (req, res) => {
  try {
    const { message, model = 'gemini-1.5-flash', image } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[Gemini] Processing request - Model: ${model}, Has Image: ${!!image}`);

    // Get the model
    const geminiModel = genAI.getGenerativeModel({ model: model });

    // Build content
    const content = [];

    // Add image if provided
    if (image) {
      let imageData = image;
      let mimeType = 'image/jpeg';

      // Extract base64 from data URL
      if (image.startsWith('data:')) {
        const match = image.match(/data:([^;]+);base64,(.+)/);
        if (match) {
          mimeType = match[1];
          imageData = match[2];
        }
      }

      content.push({
        inlineData: {
          mimeType: mimeType,
          data: imageData,
        },
      });

      console.log(`[Gemini] Image added - Type: ${mimeType}`);
    }

    // Add text message
    content.push(message);

    // Call Gemini API
    console.log(`[Gemini] Calling Gemini API...`);
    const startTime = Date.now();

    const response = await geminiModel.generateContent(content);
    const responseTime = Date.now() - startTime;

    // Extract response text
    const responseText = response.response.text();

    console.log(`[Gemini] Response in ${responseTime}ms - Length: ${responseText.length} chars`);

    res.json({
      response: responseText,
      model: model,
      responseTime: responseTime,
    });
  } catch (error) {
    console.error('[Gemini] Error:', error.message);

    let statusCode = 500;
    let errorMessage = error.message;

    if (error.message.includes('API key')) {
      errorMessage = 'Invalid Gemini API key';
      statusCode = 401;
    } else if (error.message.includes('429')) {
      errorMessage = 'Rate limited - please try again later';
      statusCode = 429;
    } else if (error.message.includes('400')) {
      errorMessage = 'Invalid request - check your input';
      statusCode = 400;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: 'Make sure GEMINI_API_KEY is set in .env',
    });
  }
});

export const initializeGeminiRoutes = (app) => {
  app.use('/api/gemini', router);
};

export default router;
```

---

## Step 4: Update Backend Server

In `backend/server.js`, add:

```javascript
import { initializeGeminiRoutes } from './gemini-ai-routes.js';

// ... existing code ...

// Initialize Gemini routes
initializeGeminiRoutes(app);
```

---

## Step 5: Update Frontend

Update `src/components/AITutor/AITutorNew.tsx`:

Change the API endpoint from `/api/ai-tutor/chat` to `/api/gemini/chat`:

```typescript
// Find this line:
const response = await fetch('/api/ai-tutor/chat', {

// Change to:
const response = await fetch('/api/gemini/chat', {
```

---

## Step 6: Update Model Selection

In the component, update available models:

```typescript
const fetchAvailableModels = async () => {
  // Gemini models
  const models = [
    'gemini-1.5-flash',      // Fastest & best
    'gemini-1.5-pro',        // Most capable
    'gemini-2.0-flash',      // Latest
  ];
  setAvailableModels(models);
  setSelectedModel('gemini-1.5-flash');
};
```

---

## Step 7: Test

### 7.1 Restart Backend
```bash
npm run dev
```

### 7.2 Test in Browser
1. Open AI Tutor
2. Type: "What is 2+2?"
3. Should get response in 1-3 seconds

### 7.3 Test Image Analysis
1. Upload an image
2. Type: "What's in this image?"
3. Should get analysis in 1-3 seconds

### 7.4 Check Logs
```
[Gemini] Processing request - Model: gemini-1.5-flash, Has Image: false
[Gemini] Calling Gemini API...
[Gemini] Response in 1234ms - Length: 45 chars
```

---

## Gemini Models

| Model | Speed | Accuracy | Best For |
|-------|-------|----------|----------|
| gemini-1.5-flash | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Everything |
| gemini-1.5-pro | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Complex |
| gemini-2.0-flash | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Latest |

---

## Pricing

### Gemini FREE Tier
- **Limit**: 60 requests/minute
- **Cost**: FREE forever
- **No credit card**: Yes
- **Expiration**: Never

### Gemini PAID Tier
- **Cost**: $0.075 per 1M input tokens / $0.30 per 1M output tokens
- **Limit**: None (pay as you go)

---

## Rate Limits

### FREE Tier
```
Per minute:    60 requests
Per second:    1 request
Per day:       ~86,400 requests
Per month:     ~2.6M requests
```

### PAID Tier
```
Per minute:    Unlimited
Per second:    Unlimited
Per day:       Unlimited
Per month:     Unlimited (pay as you go)
```

---

## Troubleshooting

### Error: "Invalid Gemini API key"
- Check `.env` file
- Verify key is correct
- Regenerate key if needed

### Error: "Rate limited"
- You've exceeded 60 requests/minute
- Wait a minute and retry
- Upgrade to paid tier for unlimited

### Error: "Invalid request"
- Check message format
- Verify image is valid base64
- Check model name

### Slow responses
- Gemini is usually 1-3 seconds
- Check internet connection
- Try different model

---

## Comparison: Groq vs Gemini

| Feature | Groq | Gemini |
|---------|------|--------|
| **Speed** | <1s | 1-3s |
| **Accuracy** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Images** | ❌ | ✅ |
| **Rate Limit** | Unlimited | 60/min |
| **Cost** | FREE | FREE |
| **Best For** | Q&A, speed | Images, accuracy |

---

## Hybrid: Groq + Gemini

### Use Groq for:
- Q&A questions
- Coding problems
- Math explanations
- **Cost**: FREE (unlimited)

### Use Gemini for:
- Image analysis
- Complex reasoning
- Document analysis
- **Cost**: FREE (60/min)

### Setup
- Follow: `IMPLEMENT_HYBRID_AI.md`

---

## Next Steps

1. ✅ Get API key from Google AI Studio
2. ✅ Add to .env
3. ✅ Install SDK
4. ✅ Create routes
5. ✅ Update backend
6. ✅ Update frontend
7. ✅ Test
8. ✅ Monitor usage

---

## Support

If you need help:
1. Check error message
2. Look at logs
3. Verify API key
4. Check Google AI Studio
5. Contact Google support

