# Implement Groq API - Fastest & Cheapest

## Why Groq?
- ⚡⚡⚡⚡⚡ FASTEST (sub-second responses!)
- 💰 CHEAPEST (~$0.001-0.005 per message)
- 🎯 Great for coding & Q&A
- 🔒 Secure & reliable
- 📊 Perfect for high-volume usage

---

## Step 1: Get Groq API Key

### 1.1 Go to Groq Console
- Visit: https://console.groq.com
- Sign up or log in

### 1.2 Create API Key
- Click "API Keys" in sidebar
- Click "Create New API Key"
- Copy the key
- Save it safely

### 1.3 Add to .env
```bash
# In your .env file:
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

### 1.4 Set Billing (Optional)
- Groq has free tier
- Add payment for higher limits

---

## Step 2: Install Groq SDK

```bash
npm install groq-sdk
```

---

## Step 3: Create Groq Routes

Create `backend/groq-ai-routes.js`:

```javascript
import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, model = 'mixtral-8x7b-32768' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[Groq] Processing request - Model: ${model}`);

    // Call Groq API
    console.log(`[Groq] Calling Groq API...`);
    const startTime = Date.now();

    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      model: model,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const responseTime = Date.now() - startTime;
    const responseText = response.choices[0].message.content;

    console.log(`[Groq] Response in ${responseTime}ms - Length: ${responseText.length} chars`);

    res.json({
      response: responseText,
      model: model,
      responseTime: responseTime,
      usage: {
        input_tokens: response.usage.prompt_tokens,
        output_tokens: response.usage.completion_tokens,
      },
    });
  } catch (error) {
    console.error('[Groq] Error:', error.message);

    let statusCode = 500;
    let errorMessage = error.message;

    if (error.status === 401) {
      errorMessage = 'Invalid Groq API key';
      statusCode = 401;
    } else if (error.status === 429) {
      errorMessage = 'Rate limited - please try again later';
      statusCode = 429;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: 'Make sure GROQ_API_KEY is set in .env',
    });
  }
});

export const initializeGroqRoutes = (app) => {
  app.use('/api/groq', router);
};

export default router;
```

---

## Step 4: Update Backend Server

In `backend/server.js`, add:

```javascript
import { initializeGroqRoutes } from './groq-ai-routes.js';

// ... existing code ...

// Initialize Groq routes
initializeGroqRoutes(app);
```

---

## Step 5: Update Frontend

Update `src/components/AITutor/AITutorNew.tsx`:

Change the API endpoint:

```typescript
// Find this line:
const response = await fetch('/api/ai-tutor/chat', {

// Change to:
const response = await fetch('/api/groq/chat', {
```

---

## Step 6: Update Model Selection

In the component, update available models:

```typescript
const fetchAvailableModels = async () => {
  // Groq models
  const models = [
    'mixtral-8x7b-32768',      // Fastest & best
    'llama-3.1-70b-versatile', // Most capable
    'llama-3.1-8b-instant',    // Cheapest
  ];
  setAvailableModels(models);
  setSelectedModel('mixtral-8x7b-32768');
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
3. Should get response in < 1 second!

### 7.3 Check Logs
```
[Groq] Processing request - Model: mixtral-8x7b-32768
[Groq] Calling Groq API...
[Groq] Response in 234ms - Length: 45 chars
```

---

## Groq Models

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| Llama 3.1 8B | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | $ | Budget |
| Mixtral 8x7B | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $$ | Balanced |
| Llama 3.1 70B | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$$ | Complex |

---

## Pricing

### Groq Pricing (per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| Llama 3.1 8B | $0.05 | $0.10 |
| Mixtral 8x7B | $0.27 | $0.81 |
| Llama 3.1 70B | $0.59 | $0.79 |

### Estimated Monthly Cost

**Light Usage** (100 messages/day):
- ~$1-2/month

**Medium Usage** (500 messages/day):
- ~$5-10/month

**Heavy Usage** (1000+ messages/day):
- ~$10-20/month

---

## Advantages Over Ollama

| Feature | Ollama | Groq |
|---------|--------|------|
| Speed | 5-30s | <1s |
| Accuracy | Medium | Good |
| Coding | Medium | Good |
| Math | Medium | Good |
| Cost | Free | $0.001-0.005/msg |
| Reliability | Unreliable | 99.9% uptime |
| Setup | Easy | Easy |

---

## Limitations

### No Image Support
Groq doesn't support images. For image analysis, use Claude instead.

### Limited Models
Only 3 models available (but they're excellent).

### Newer Service
Groq is newer than OpenAI/Claude, but very reliable.

---

## Hybrid Approach: Groq + Claude

**Best of both worlds**:

```javascript
// Use Groq for fast text responses
if (!image) {
  // Use Groq (faster, cheaper)
  const response = await fetch('/api/groq/chat', { ... });
} else {
  // Use Claude for images
  const response = await fetch('/api/claude/chat', { ... });
}
```

---

## Troubleshooting

### Error: "Invalid Groq API key"
- Check `.env` file
- Verify key starts with `gsk_`
- Regenerate key if needed

### Error: "Rate limited"
- Groq has generous free tier
- Wait a few minutes
- Upgrade plan if needed

### Slow responses
- Groq is usually <1 second
- Check internet connection
- Try different model

### Model not found
- Check model name spelling
- Use one of the 3 available models

---

## Comparison: Groq vs Claude vs Ollama

| Feature | Ollama | Groq | Claude |
|---------|--------|------|--------|
| Speed | 🐢 5-30s | ⚡ <1s | ⚡⚡ 1-3s |
| Accuracy | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Images | ⭐ | ❌ | ⭐⭐⭐⭐⭐ |
| Coding | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Math | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Cost | Free | $ | $$ |
| Reliability | ❌ | ✅ | ✅ |

---

## Next Steps

1. ✅ Get API key from Groq
2. ✅ Add to .env
3. ✅ Install SDK
4. ✅ Create routes
5. ✅ Update backend
6. ✅ Update frontend
7. ✅ Test
8. ✅ Monitor usage

---

## Recommendation

**Use Groq if**:
- You want fastest responses
- You want cheapest option
- You don't need image analysis
- You have high volume

**Use Claude if**:
- You need image analysis
- You want best accuracy
- You can spend more
- You need complex reasoning

**Use Hybrid if**:
- You want best of both
- You can manage multiple APIs
- You want optimal cost/performance

---

## Support

If you need help:
1. Check error message
2. Look at logs
3. Verify API key
4. Check Groq status page
5. Contact Groq support

