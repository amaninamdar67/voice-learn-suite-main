import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Groq API endpoint
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

// Chat endpoint - Groq (text only, no images)
router.post('/chat', async (req, res) => {
  try {
    const { message, model = 'llama-3.1-8b-instant' } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('[Groq] API Key check:', GROQ_API_KEY ? `Present (${GROQ_API_KEY.substring(0, 10)}...)` : 'NOT FOUND');
    
    if (!GROQ_API_KEY) {
      console.error('[Groq] API key not configured');
      console.error('[Groq] Available env vars:', Object.keys(process.env).filter(k => k.includes('GROQ') || k.includes('API')));
      return res.status(500).json({
        error: 'Groq API key not configured',
        details: 'Add GROQ_API_KEY to .env file',
      });
    }

    console.log(`[Groq] Processing request - Model: ${model}`);

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: message,
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    };

    console.log(`[Groq] Calling Groq API with model: ${model}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    try {
      response = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - Groq is taking too long to respond');
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Groq] HTTP ${response.status}:`, errorText.substring(0, 200));
      
      if (response.status === 401) {
        throw new Error('Invalid Groq API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('[Groq] JSON parse error:', parseError.message);
      throw new Error('Invalid response from Groq API');
    }
    
    // Extract response text from Groq format
    const responseText = data.choices?.[0]?.message?.content || '';
    
    if (!responseText || responseText.trim().length === 0) {
      console.warn('[Groq] Empty response text from model');
      return res.json({
        response: 'The model returned an empty response. Please try again.',
        model: model,
      });
    }
    
    console.log(`[Groq] Response: ${responseText.substring(0, 100)}...`);
    
    res.json({
      response: responseText,
      model: model,
    });
  } catch (error) {
    console.error('[Groq] Error:', error.message);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Groq API';
      statusCode = 503;
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Request timeout - Groq is not responding quickly enough';
      statusCode = 504;
    } else if (errorMessage.includes('API key')) {
      errorMessage = 'Groq API key error - check your configuration';
      statusCode = 401;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: 'Make sure GROQ_API_KEY is set in .env file',
    });
  }
});

export const initializeGroqRoutes = (app) => {
  app.use('/api/groq', router);
};

export default router;
