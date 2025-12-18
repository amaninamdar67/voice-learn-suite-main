# Implement Hybrid AI - Best of Both Worlds

## Strategy

Use **Groq for fast text** + **Claude for images & complex tasks**

### Benefits
- ⚡ Sub-second responses for text (Groq)
- 📸 Excellent image analysis (Claude)
- 💰 Optimal cost (~$0.005-0.01 per message)
- 🎯 Best accuracy for complex tasks
- 🔄 Automatic fallback

---

## Architecture

```
User Question
    ↓
Has Image?
    ├─ YES → Use Claude (image support)
    └─ NO → Use Groq (faster, cheaper)
```

---

## Step 1: Setup Both APIs

### 1.1 Get Groq API Key
- Visit: https://console.groq.com
- Create API key
- Add to .env: `GROQ_API_KEY=gsk_...`

### 1.2 Get Claude API Key
- Visit: https://console.anthropic.com
- Create API key
- Add to .env: `CLAUDE_API_KEY=sk-ant-...`

### 1.3 Install Both SDKs
```bash
npm install groq-sdk @anthropic-ai/sdk
```

---

## Step 2: Create Hybrid Routes

Create `backend/hybrid-ai-routes.js`:

```javascript
import express from 'express';
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Hybrid chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, model, image } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[Hybrid] Processing request - Has Image: ${!!image}`);

    // Route to appropriate AI
    if (image) {
      // Use Claude for images
      console.log('[Hybrid] Routing to Claude (image support)');
      return await handleClaude(message, image, res);
    } else {
      // Use Groq for text (faster, cheaper)
      console.log('[Hybrid] Routing to Groq (faster, cheaper)');
      return await handleGroq(message, model, res);
    }
  } catch (error) {
    console.error('[Hybrid] Error:', error.message);
    res.status(500).json({
      error: error.message,
      details: 'Make sure both API keys are set in .env',
    });
  }
});

// Handle Groq requests
async function handleGroq(message, model, res) {
  try {
    console.log('[Groq] Calling Groq API...');
    const startTime = Date.now();

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      model: model || 'mixtral-8x7b-32768',
      max_tokens: 1024,
      temperature: 0.7,
    });

    const responseTime = Date.now() - startTime;
    const responseText = response.choices[0].message.content;

    console.log(`[Groq] Response in ${responseTime}ms`);

    res.json({
      response: responseText,
      model: model || 'mixtral-8x7b-32768',
      provider: 'groq',
      responseTime: responseTime,
      usage: {
        input_tokens: response.usage.prompt_tokens,
        output_tokens: response.usage.completion_tokens,
      },
    });
  } catch (error) {
    console.error('[Groq] Error:', error.message);
    throw error;
  }
}

// Handle Claude requests
async function handleClaude(message, image, res) {
  try {
    console.log('[Claude] Calling Claude API...');
    const startTime = Date.now();

    // Build content
    const content = [];

    // Add image
    let imageData = image;
    let mediaType = 'image/jpeg';

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

    // Add message
    content.push({
      type: 'text',
      text: message,
    });

    // Call Claude
    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    });

    const responseTime = Date.now() - startTime;
    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'No response generated';

    console.log(`[Claude] Response in ${responseTime}ms`);

    res.json({
      response: responseText,
      model: 'claude-3-5-sonnet-20241022',
      provider: 'claude',
      responseTime: responseTime,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error('[Claude] Error:', error.message);
    throw error;
  }
}

export const initializeHybridRoutes = (app) => {
  app.use('/api/hybrid', router);
};

export default router;
```

---

## Step 3: Update Backend Server

In `backend/server.js`, add:

```javascript
import { initializeHybridRoutes } from './hybrid-ai-routes.js';

// ... existing code ...

// Initialize Hybrid routes
initializeHybridRoutes(app);
```

---

## Step 4: Update Frontend

Update `src/components/AITutor/AITutorNew.tsx`:

Change the API endpoint:

```typescript
// Find this line:
const response = await fetch('/api/ai-tutor/chat', {

// Change to:
const response = await fetch('/api/hybrid/chat', {
```

---

## Step 5: Update Model Selection

In the component, update available models:

```typescript
const fetchAvailableModels = async () => {
  // Hybrid models
  const models = [
    'mixtral-8x7b-32768',      // Groq - fastest
    'llama-3.1-70b-versatile', // Groq - most capable
    'llama-3.1-8b-instant',    // Groq - cheapest
  ];
  setAvailableModels(models);
  setSelectedModel('mixtral-8x7b-32768');
};
```

---

## Step 6: Test

### 6.1 Restart Backend
```bash
npm run dev
```

### 6.2 Test Text (Should use Groq)
1. Open AI Tutor
2. Type: "What is 2+2?"
3. Should get response in <1 second
4. Check logs: `[Hybrid] Routing to Groq`

### 6.3 Test Image (Should use Claude)
1. Upload an image
2. Type: "What's in this image?"
3. Should get response in 1-3 seconds
4. Check logs: `[Hybrid] Routing to Claude`

---

## Cost Optimization

### Text Questions (Groq)
- Cost: ~$0.001-0.005 per message
- Speed: <1 second
- Quality: Good

### Image Analysis (Claude)
- Cost: ~$0.01-0.02 per message
- Speed: 1-3 seconds
- Quality: Excellent

### Estimated Monthly Cost

**Light Usage** (100 text + 20 image/day):
- ~$3-5/month

**Medium Usage** (500 text + 100 image/day):
- ~$10-15/month

**Heavy Usage** (1000+ text + 200+ image/day):
- ~$20-30/month

---

## Monitoring

### Check Usage

**Groq**:
- Visit: https://console.groq.com/usage

**Claude**:
- Visit: https://console.anthropic.com/usage

### Set Alerts

**Groq**:
- Set spending limit in console

**Claude**:
- Set spending limit in console

---

## Fallback Strategy

If one API fails, fallback to the other:

```javascript
async function handleGroq(message, model, res) {
  try {
    // Try Groq
    const response = await groq.chat.completions.create({...});
    // ... return response
  } catch (error) {
    console.warn('[Groq] Failed, falling back to Claude');
    // Fallback to Claude
    return await handleClaude(message, null, res);
  }
}
```

---

## Performance Comparison

### Text Questions
| Provider | Speed | Cost | Quality |
|----------|-------|------|---------|
| Groq | <1s | $0.001 | Good |
| Claude | 1-3s | $0.01 | Excellent |
| Ollama | 5-30s | Free | Medium |

### Image Analysis
| Provider | Speed | Cost | Quality |
|----------|-------|------|---------|
| Claude | 1-3s | $0.02 | Excellent |
| Groq | N/A | N/A | No support |
| Ollama | 10-30s | Free | Poor |

---

## Advantages

✅ **Fastest text responses** (Groq)
✅ **Best image analysis** (Claude)
✅ **Optimal cost** (~$0.005-0.01/msg)
✅ **Automatic routing**
✅ **Fallback support**
✅ **Best of both worlds**

---

## Disadvantages

❌ **Requires 2 API keys**
❌ **Slightly more complex**
❌ **Need to manage 2 services**

---

## Comparison: All Options

| Feature | Ollama | Groq | Claude | Hybrid |
|---------|--------|------|--------|--------|
| Speed | 🐢 | ⚡⚡⚡⚡⚡ | ⚡⚡⚡ | ⚡⚡⚡⚡ |
| Accuracy | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Images | ⭐ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Cost | Free | $ | $$ | $$ |
| Reliability | ❌ | ✅ | ✅ | ✅ |
| Setup | Easy | Easy | Easy | Medium |

---

## Recommendation

**Use Hybrid if**:
- You want best performance
- You need image analysis
- You can manage 2 APIs
- You want optimal cost
- You want reliability

**Use Groq if**:
- You only need text
- You want cheapest option
- You want fastest responses

**Use Claude if**:
- You need image analysis
- You want best accuracy
- You can spend more

**Use Ollama if**:
- You have no budget
- You need offline capability

---

## Next Steps

1. ✅ Get both API keys
2. ✅ Add to .env
3. ✅ Install both SDKs
4. ✅ Create hybrid routes
5. ✅ Update backend
6. ✅ Update frontend
7. ✅ Test text (Groq)
8. ✅ Test images (Claude)
9. ✅ Monitor usage

---

## Support

If you need help:
1. Check error message
2. Look at logs
3. Verify both API keys
4. Check both service status pages
5. Contact support

