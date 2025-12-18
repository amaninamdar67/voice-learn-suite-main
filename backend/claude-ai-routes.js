import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Claude API endpoint
const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

// Chat endpoint - Claude (text + images)
router.post('/chat', async (req, res) => {
  try {
    const { message, model = 'claude-3-5-haiku-20241022', image } = req.body;
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('[Claude] API Key check:', CLAUDE_API_KEY ? `Present (${CLAUDE_API_KEY.substring(0, 10)}...)` : 'NOT FOUND');
    
    if (!CLAUDE_API_KEY) {
      console.error('[Claude] API key not configured');
      return res.status(500).json({
        error: 'Claude API key not configured',
        details: 'Add CLAUDE_API_KEY to .env file. Get it from https://console.anthropic.com',
      });
    }

    console.log(`[Claude] Processing request - Model: ${model}, Has Image: ${!!image}`);

    // Build content array
    const content = [];
    
    // Add image if provided
    if (image) {
      let imageData = image;
      let mediaType = 'image/jpeg';
      
      // Extract base64 and determine media type from data URL
      if (image.startsWith('data:')) {
        const match = image.match(/^data:([^;]+);base64,(.+)$/);
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
      
      console.log(`[Claude] Image added - Type: ${mediaType}, Size: ${imageData.length} bytes`);
    }
    
    // Add text message
    content.push({
      type: 'text',
      text: message,
    });

    const requestBody = {
      model: model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: content,
        }
      ],
    };

    console.log(`[Claude] Calling Claude API with model: ${model}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    try {
      response = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - Claude is taking too long to respond');
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Claude] HTTP ${response.status}:`, errorText.substring(0, 200));
      
      if (response.status === 401) {
        throw new Error('Invalid Claude API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else if (response.status === 400) {
        throw new Error('Invalid request - check your message format');
      }
      
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('[Claude] JSON parse error:', parseError.message);
      throw new Error('Invalid response from Claude API');
    }
    
    // Extract response text from Claude format
    const responseText = data.content?.[0]?.text || '';
    
    if (!responseText || responseText.trim().length === 0) {
      console.warn('[Claude] Empty response text from model');
      return res.json({
        response: 'The model returned an empty response. Please try again.',
        model: model,
      });
    }
    
    console.log(`[Claude] Response: ${responseText.substring(0, 100)}...`);
    
    res.json({
      response: responseText,
      model: model,
    });
  } catch (error) {
    console.error('[Claude] Error:', error.message);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Claude API';
      statusCode = 503;
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Request timeout - Claude is not responding quickly enough';
      statusCode = 504;
    } else if (errorMessage.includes('API key')) {
      errorMessage = 'Claude API key error - check your configuration';
      statusCode = 401;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: 'Get your API key from https://console.anthropic.com',
    });
  }
});

export const initializeClaudeRoutes = (app) => {
  app.use('/api/claude', router);
};

export default router;
