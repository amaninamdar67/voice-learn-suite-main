# Implement Claude API - Step by Step

## Why Claude?
- ⚡ Fast (1-3 seconds)
- 🎯 Best for coding & math
- 📸 Excellent image analysis
- 💰 Affordable (~$0.01-0.02 per message)
- 🔒 Secure & reliable

---

## Step 1: Get Claude API Key

### 1.1 Go to Anthropic Console
- Visit: https://console.anthropic.com
- Sign up or log in

### 1.2 Create API Key
- Click "API Keys" in sidebar
- Click "Create Key"
- Copy the key (starts with `sk-ant-`)
- Save it safely

### 1.3 Add to .env
```bash
# In your .env file:
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### 1.4 Set Billing
- Go to Billing section
- Add payment method
- Set usage limits (optional)

---

## Step 2: Install Claude SDK

```bash
npm install @anthropic-ai/sdk
```

---

## Step 3: Create Claude Routes

Create `backend/claude-ai-routes.js`:

```javascript
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Chat endpoint with image support
router.post('/chat', async (req, res) => {
  try {
    const { message, model = 'claude-3-5-sonnet-20241022', image } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[Claude] Processing request - Has Image: ${!!image}`);

    // Build message content
    const content = [];

    // Add image if provided
    if (image) {
      let imageData = image;
      let mediaType = 'image/jpeg';

      // Extract base64 from data URL
      if (image.startsWith('data:')) {
        const match = image.match(/data:([^;]+);base64,(.+)/);
        if (match) {
          mediaType = match[1];
          imageData = match[2];
        }
      }

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageData,
        },
      });

      console.log(`[Claude] Image added - Type: ${mediaType}`);
    }

    // Add text message
    content.push({
      type: 'text',
      text: message,
    });

    // Call Claude API
    console.log(`[Claude] Calling Claude API...`);
    const response = await client.messages.create({
      model: model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    });

    // Extract response
    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'No response generated';

    console.log(`[Claude] Response length: ${responseText.length} chars`);

    res.json({
      response: responseText,
      model: model,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error('[Claude] Error:', error.message);

    let statusCode = 500;
    let errorMessage = error.message;

    if (error.status === 401) {
      errorMessage = 'Invalid Claude API key';
      statusCode = 401;
    } else if (error.status === 429) {
      errorMessage = 'Rate limited - please try again later';
      statusCode = 429;
    } else if (error.status === 400) {
      errorMessage = 'Invalid request - check your input';
      statusCode = 400;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: 'Make sure CLAUDE_API_KEY is set in .env',
    });
  }
});

export const initializeClaudeRoutes = (app) => {
  app.use('/api/claude', router);
};

export default router;
```

---

## Step 4: Update Backend Server

In `backend/server.js`, add:

```javascript
import { initializeClaudeRoutes } from './claude-ai-routes.js';

// ... existing code ...

// Initialize Claude routes
initializeClaudeRoutes(app);
```

---

## Step 5: Update Frontend

Update `src/components/AITutor/AITutorNew.tsx`:

Change the API endpoint from `/api/ai-tutor/chat` to `/api/claude/chat`:

```typescript
// Find this line:
const response = await fetch('/api/ai-tutor/chat', {

// Change to:
const response = await fetch('/api/claude/chat', {
```

---

## Step 6: Update Model Selection

In the component, update available models:

```typescript
const fetchAvailableModels = async () => {
  // Claude models
  const models = [
    'claude-3-5-sonnet-20241022',  // Fastest & best
    'claude-3-opus-20250219',       // Most capable
    'claude-3-haiku-20250307',      // Cheapest
  ];
  setAvailableModels(models);
  setSelectedModel('claude-3-5-sonnet-20241022');
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
3. Should get instant response

### 7.3 Check Logs
```
[Claude] Processing request - Has Image: false
[Claude] Calling Claude API...
[Claude] Response length: 45 chars
```

---

## Step 8: Monitor Usage

### Check API Usage
- Go to: https://console.anthropic.com/usage
- See tokens used
- Monitor costs

### Set Spending Limits
- Go to: https://console.anthropic.com/account/billing/limits
- Set monthly limit
- Get alerts

---

## Pricing

### Claude Models

| Model | Speed | Cost (per 1M tokens) | Best For |
|-------|-------|---------------------|----------|
| Haiku | ⚡⚡⚡⚡⚡ | $0.80 input / $4 output | Budget |
| Sonnet | ⚡⚡⚡⚡ | $3 input / $15 output | Balanced |
| Opus | ⚡⚡⚡ | $15 input / $75 output | Complex |

### Estimated Monthly Cost

**Light Usage** (100 messages/day):
- ~$5-10/month

**Medium Usage** (500 messages/day):
- ~$20-30/month

**Heavy Usage** (1000+ messages/day):
- ~$50-100/month

---

## Troubleshooting

### Error: "Invalid Claude API key"
- Check `.env` file
- Verify key starts with `sk-ant-`
- Regenerate key if needed

### Error: "Rate limited"
- Wait a few minutes
- Check usage at console.anthropic.com
- Upgrade plan if needed

### Error: "Invalid request"
- Check message format
- Verify image is valid base64
- Check model name

### Slow responses
- Claude is usually 1-3 seconds
- Check internet connection
- Try different model

---

## Comparison: Ollama vs Claude

| Feature | Ollama | Claude |
|---------|--------|--------|
| Speed | 5-30s | 1-3s |
| Accuracy | Medium | Excellent |
| Images | Poor | Excellent |
| Coding | Medium | Excellent |
| Math | Medium | Excellent |
| Cost | Free | $0.01-0.02/msg |
| Reliability | Unreliable | 99.9% uptime |
| Setup | Easy | Easy |

---

## Next Steps

1. ✅ Get API key from Anthropic
2. ✅ Add to .env
3. ✅ Install SDK
4. ✅ Create routes
5. ✅ Update backend
6. ✅ Update frontend
7. ✅ Test
8. ✅ Monitor usage

---

## Alternative: Use Groq Instead

If you want faster + cheaper:

```bash
npm install groq-sdk
```

Then follow similar steps but use Groq API instead.

**Groq Benefits**:
- Sub-second responses
- Cheaper ($0.001-0.005 per message)
- Great for Q&A

**Groq Drawbacks**:
- Limited models
- No image support
- Newer service

---

## Support

If you need help:
1. Check error message
2. Look at logs
3. Verify API key
4. Check Anthropic status page
5. Contact Anthropic support

