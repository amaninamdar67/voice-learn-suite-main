import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Gemini API endpoint - using gemini-1.5-flash (available, good for images and text)
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Chat endpoint - Gemini (text + images)
router.post('/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('[Gemini] API Key check:', GEMINI_API_KEY ? `Present (${GEMINI_API_KEY.substring(0, 10)}...)` : 'NOT FOUND');
    
    if (!GEMINI_API_KEY) {
      console.error('[Gemini] API key not configured');
      console.error('[Gemini] Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
      return res.status(500).json({
        error: 'Gemini API key not configured',
        details: 'Add GEMINI_API_KEY to .env file',
      });
    }

    console.log(`[Gemini] Processing request - Has Image: ${!!image}`);

    // Build request body
    const contents = {
      parts: []
    };

    // Add text part
    contents.parts.push({
      text: message
    });

    // Add image if provided
    if (image) {
      let imageData = image;
      let mimeType = 'image/jpeg';

      // Extract base64 from data URL if needed
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          imageData = matches[2];
        }
      }

      contents.parts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageData
        }
      });

      console.log(`[Gemini] Image data length: ${imageData.length}, MIME type: ${mimeType}`);
    }

    const requestBody = {
      contents: [contents],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    console.log(`[Gemini] Calling Gemini API with request body size: ${JSON.stringify(requestBody).length} bytes`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for large files

    let response;
    try {
      response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - Gemini is taking too long to respond');
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini] HTTP ${response.status}:`, errorText.substring(0, 500));
      
      if (response.status === 400) {
        console.error('[Gemini] Bad request - check request format');
        throw new Error('Invalid request to Gemini API - check your input format');
      } else if (response.status === 401) {
        throw new Error('Invalid Gemini API key - check GEMINI_API_KEY in .env');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else if (response.status === 413) {
        throw new Error('Payload too large - file is too big for Gemini');
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('[Gemini] JSON parse error:', parseError.message);
      throw new Error('Invalid response from Gemini API');
    }
    
    // Extract response text from Gemini format
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!responseText || responseText.trim().length === 0) {
      console.warn('[Gemini] Empty response text from model');
      return res.json({
        response: 'The model returned an empty response. Please try again.',
      });
    }
    
    console.log(`[Gemini] Response: ${responseText.substring(0, 100)}...`);
    
    res.json({
      response: responseText,
      model: 'gemini-pro',
    });
  } catch (error) {
    console.error('[Gemini] Error:', error.message);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Gemini API';
      statusCode = 503;
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Request timeout - Gemini is not responding quickly enough';
      statusCode = 504;
    } else if (errorMessage.includes('API key')) {
      errorMessage = 'Gemini API key error - check your configuration';
      statusCode = 401;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: 'Make sure GEMINI_API_KEY is set in .env file',
    });
  }
});

export const initializeGeminiRoutes = (app) => {
  app.use('/api/gemini', router);
};

export default router;
