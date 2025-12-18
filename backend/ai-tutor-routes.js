import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Ollama API endpoint
const OLLAMA_API = 'http://localhost:11434/api/generate';

// Helper function to check if Ollama is running
async function checkOllamaHealth() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Chat endpoint with image support
router.post('/chat', async (req, res) => {
  try {
    const { message, model = 'mistral:latest', image } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[AI Chat] Processing request - Model: ${model}, Has Image: ${!!image}`);

    // Check if Ollama is running
    const ollamaHealthy = await checkOllamaHealth();
    if (!ollamaHealthy) {
      console.error('[AI Chat] Ollama is not responding');
      return res.status(503).json({
        error: 'Ollama service is not available',
        details: 'Make sure Ollama is running with: ollama serve',
      });
    }

    // Build the prompt - simpler version for better compatibility
    let prompt = message;
    
    if (image) {
      // For image analysis, use simpler prompt
      prompt = `Analyze this image and answer: ${message}`;
    }

    let requestBody = {
      model: model,
      prompt: prompt,
      stream: false,
      temperature: 0.6,
      top_p: 0.85,
      top_k: 40,
      num_predict: 512, // Reduced from 1024 for faster responses
    };

    // Only add images if model supports it (LLaVA)
    if (image && model.includes('llava')) {
      // Extract base64 from data URL if needed
      let imageData = image;
      if (image.startsWith('data:')) {
        imageData = image.split(',')[1];
      }
      requestBody.images = [imageData];
      console.log(`[AI Chat] Image data length: ${imageData.length}`);
    }

    // Call Ollama API
    console.log(`[AI Chat] Calling Ollama API with model: ${model}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    try {
      response = await fetch(OLLAMA_API, {
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
        throw new Error('Request timeout - Ollama is taking too long to respond');
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Chat] HTTP ${response.status}:`, errorText.substring(0, 200));
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    let data;
    let rawText;
    try {
      rawText = await response.text();
      console.log(`[AI Chat] Raw response length: ${rawText.length}`);
      
      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Empty response from Ollama');
      }
      
      // Check if response looks like HTML (error from Ollama)
      if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
        console.error('[AI Chat] Received HTML instead of JSON - Ollama may not be running properly');
        throw new Error('Ollama returned HTML instead of JSON - service may be misconfigured');
      }
      
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('[AI Chat] JSON parse error:', parseError.message);
      console.error('[AI Chat] First 300 chars:', rawText?.substring(0, 300));
      throw new Error('Invalid response from AI model - Ollama may not be running');
    }
    
    // Extract response text
    let responseText = data.response || data.text || '';
    
    if (!responseText || responseText.trim().length === 0) {
      console.warn('[AI Chat] Empty response text from model');
      responseText = 'The model returned an empty response. Please try again.';
    } else {
      console.log(`[AI Chat] Response before sanitization: ${responseText.length} chars`);
      
      // Sanitize response
      responseText = responseText
        // Remove control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove HTML entities
        .replace(/&[a-zA-Z0-9#]+;/g, '')
        // Remove replacement characters
        .replace(/[\uFFFD\uFEFF]/g, '')
        // Collapse multiple spaces
        .replace(/ +/g, ' ')
        .trim();
      
      console.log(`[AI Chat] Response after sanitization: ${responseText.length} chars`);
    }
    
    console.log(`[AI Chat] Final response: ${responseText.substring(0, 100)}...`);
    
    res.json({
      response: responseText,
      model: model,
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error.message);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Ollama. Make sure it\'s running on port 11434';
      statusCode = 503;
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Request timeout - Ollama is not responding quickly enough';
      statusCode = 504;
    } else if (errorMessage.includes('HTML')) {
      errorMessage = 'Ollama service error - received invalid response';
      statusCode = 502;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: 'Make sure Ollama is running with: ollama serve',
    });
  }
});

export const initializeAITutorRoutes = (app) => {
  app.use('/api/ai-tutor', router);
};

export default router;
