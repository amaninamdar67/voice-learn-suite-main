import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Perplexity API endpoint
const PERPLEXITY_API = 'https://api.perplexity.ai/chat/completions';

// Chat endpoint - Perplexity (text + images)
router.post('/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('[Perplexity] API Key check:', PERPLEXITY_API_KEY ? `Present (${PERPLEXITY_API_KEY.substring(0, 10)}...)` : 'NOT FOUND');
    
    if (!PERPLEXITY_API_KEY) {
      console.error('[Perplexity] API key not configured');
      return res.status(500).json({
        error: 'Perplexity API key not configured',
        details: 'Add PERPLEXITY_API_KEY to .env file',
      });
    }

    console.log(`[Perplexity] Processing request - Has Image: ${!!image}`);

    // Build messages array with proper Perplexity format
    const messages = [];
    
    if (image) {
      // For image analysis, use vision model
      let imageData = image;
      let mediaType = 'image/jpeg';

      // Extract base64 from data URL if needed
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mediaType = matches[1];
          imageData = matches[2];
        }
      }

      // Perplexity vision format - content must be array of objects with type field
      const contentArray = [
        {
          type: 'text',
          text: message,
        },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: imageData,
          },
        },
      ];

      messages.push({
        role: 'user',
        content: contentArray,
      });

      console.log(`[Perplexity] Image data length: ${imageData.length}, MIME type: ${mediaType}`);
    } else {
      // Text only - content should be a string
      messages.push({
        role: 'user',
        content: message,
      });
    }

    const requestBody = {
      model: image ? 'llama-vision-free' : 'llama-3.1-sonar-small-128k-online',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    };

    console.log(`[Perplexity] Calling Perplexity API with model: ${requestBody.model}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    let response;
    try {
      response = await fetch(PERPLEXITY_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - Perplexity is taking too long to respond');
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Perplexity] HTTP ${response.status}:`, errorText.substring(0, 500));
      
      if (response.status === 400) {
        console.error('[Perplexity] Bad request - check request format');
        throw new Error('Invalid request to Perplexity API - check your input format');
      } else if (response.status === 401) {
        throw new Error('Invalid Perplexity API key - check PERPLEXITY_API_KEY in .env');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else if (response.status === 413) {
        throw new Error('Payload too large - file is too big for Perplexity');
      }
      
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('[Perplexity] JSON parse error:', parseError.message);
      throw new Error('Invalid response from Perplexity API');
    }
    
    // Extract response text from Perplexity format
    const responseText = data.choices?.[0]?.message?.content || '';
    
    if (!responseText || responseText.trim().length === 0) {
      console.warn('[Perplexity] Empty response text from model');
      return res.json({
        response: 'The model returned an empty response. Please try again.',
      });
    }
    
    console.log(`[Perplexity] Response: ${responseText.substring(0, 100)}...`);
    
    res.json({
      response: responseText,
      model: requestBody.model,
    });
  } catch (error) {
    console.error('[Perplexity] Error:', error.message);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Perplexity API';
      statusCode = 503;
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Request timeout - Perplexity is not responding quickly enough';
      statusCode = 504;
    } else if (errorMessage.includes('API key')) {
      errorMessage = 'Perplexity API key error - check your configuration';
      statusCode = 401;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: 'Make sure PERPLEXITY_API_KEY is set in .env file',
    });
  }
});

export const initializePerplexityRoutes = (app) => {
  app.use('/api/perplexity', router);
};

export default router;
