import axios from 'axios';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const DEFAULT_MODEL = 'deepseek-r1:1.5b';

/**
 * Initialize Ollama AI routes
 * Handles local AI inference using Ollama with DeepSeek model
 */
export function initializeOllamaRoutes(app) {
  /**
   * POST /api/ollama/chat
   * Send a message to Ollama for processing
   * 
   * Request body:
   * {
   *   message: string,
   *   model: string (optional, defaults to deepseek-r1:1.5b),
   *   context: string (optional, for context-aware responses)
   * }
   */
  app.post('/api/ollama/chat', async (req, res) => {
    try {
      const { message, model = DEFAULT_MODEL, context } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Build the prompt with context if provided
      let prompt = message;
      if (context) {
        prompt = `Context: ${context}\n\nQuestion: ${message}`;
      }

      console.log(`[Ollama] Sending to model: ${model}`);
      console.log(`[Ollama] Prompt: ${prompt.substring(0, 100)}...`);

      // Call Ollama API
      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
      }, {
        timeout: 120000, // 2 minute timeout for long responses
      });

      const aiResponse = response.data.response || '';

      console.log(`[Ollama] Response received: ${aiResponse.substring(0, 100)}...`);

      res.json({
        response: aiResponse,
        model: model,
        tokens: {
          prompt: response.data.prompt_eval_count || 0,
          completion: response.data.eval_count || 0,
        },
      });
    } catch (error) {
      console.error('[Ollama] Error:', error.message);

      // Check if Ollama is not running
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Ollama service is not running',
          message: 'Please start Ollama with: ollama serve',
          details: error.message,
        });
      }

      // Check if model is not available
      if (error.response?.status === 404) {
        return res.status(404).json({
          error: 'Model not found',
          message: `Model "${req.body.model || DEFAULT_MODEL}" is not available. Pull it with: ollama pull ${req.body.model || DEFAULT_MODEL}`,
          details: error.message,
        });
      }

      res.status(500).json({
        error: 'Failed to get response from Ollama',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/ollama/models
   * Get list of available models in Ollama
   */
  app.get('/api/ollama/models', async (req, res) => {
    try {
      console.log('[Ollama] Fetching available models...');

      const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, {
        timeout: 10000,
      });

      const models = response.data.models?.map((m) => ({
        name: m.name,
        size: m.size,
        digest: m.digest,
        modified_at: m.modified_at,
      })) || [];

      console.log(`[Ollama] Found ${models.length} models`);

      res.json({
        models: models,
        available: models.length > 0,
      });
    } catch (error) {
      console.error('[Ollama] Error fetching models:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Ollama service is not running',
          message: 'Please start Ollama with: ollama serve',
          models: [],
          available: false,
        });
      }

      res.status(500).json({
        error: 'Failed to fetch models from Ollama',
        message: error.message,
        models: [],
        available: false,
      });
    }
  });

  /**
   * POST /api/ollama/pull-model
   * Pull a model from Ollama registry
   * 
   * Request body:
   * {
   *   model: string (e.g., "deepseek-r1:1.5b")
   * }
   */
  app.post('/api/ollama/pull-model', async (req, res) => {
    try {
      const { model } = req.body;

      if (!model || model.trim().length === 0) {
        return res.status(400).json({ error: 'Model name is required' });
      }

      console.log(`[Ollama] Pulling model: ${model}`);

      // Note: This is a long-running operation
      // In production, you might want to use webhooks or polling
      const response = await axios.post(
        `${OLLAMA_API_URL}/api/pull`,
        { name: model },
        { timeout: 600000 } // 10 minute timeout
      );

      console.log(`[Ollama] Model pulled successfully: ${model}`);

      res.json({
        success: true,
        model: model,
        message: `Model ${model} pulled successfully`,
      });
    } catch (error) {
      console.error('[Ollama] Error pulling model:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Ollama service is not running',
          message: 'Please start Ollama with: ollama serve',
        });
      }

      res.status(500).json({
        error: 'Failed to pull model',
        message: error.message,
      });
    }
  });

  /**
   * POST /api/ollama/analyze-text
   * Analyze text with specific instructions
   * 
   * Request body:
   * {
   *   text: string,
   *   instruction: string (e.g., "summarize", "explain", "translate"),
   *   model: string (optional)
   * }
   */
  app.post('/api/ollama/analyze-text', async (req, res) => {
    try {
      const { text, instruction = 'analyze', model = DEFAULT_MODEL } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const instructionMap = {
        summarize: 'Provide a concise summary of the following text:',
        explain: 'Explain the following text in simple terms:',
        translate: 'Translate the following text to English:',
        analyze: 'Analyze the following text:',
        correct: 'Correct grammar and spelling in the following text:',
        expand: 'Expand on the following text with more details:',
      };

      const prompt = `${instructionMap[instruction] || instructionMap.analyze}\n\n${text}`;

      console.log(`[Ollama] Analyzing text with instruction: ${instruction}`);

      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
      }, {
        timeout: 120000,
      });

      res.json({
        response: response.data.response || '',
        instruction: instruction,
        model: model,
      });
    } catch (error) {
      console.error('[Ollama] Error analyzing text:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Ollama service is not running',
          message: 'Please start Ollama with: ollama serve',
        });
      }

      res.status(500).json({
        error: 'Failed to analyze text',
        message: error.message,
      });
    }
  });

  /**
   * POST /api/ollama/code-review
   * Review code with AI
   * 
   * Request body:
   * {
   *   code: string,
   *   language: string (optional, e.g., "javascript", "python"),
   *   model: string (optional)
   * }
   */
  app.post('/api/ollama/code-review', async (req, res) => {
    try {
      const { code, language = 'javascript', model = DEFAULT_MODEL } = req.body;

      if (!code || code.trim().length === 0) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const prompt = `Review the following ${language} code and provide suggestions for improvement, potential bugs, and best practices:\n\n\`\`\`${language}\n${code}\n\`\`\``;

      console.log(`[Ollama] Reviewing ${language} code`);

      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
      }, {
        timeout: 120000,
      });

      res.json({
        review: response.data.response || '',
        language: language,
        model: model,
      });
    } catch (error) {
      console.error('[Ollama] Error reviewing code:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Ollama service is not running',
          message: 'Please start Ollama with: ollama serve',
        });
      }

      res.status(500).json({
        error: 'Failed to review code',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/ollama/health
   * Check if Ollama is running and healthy
   */
  app.get('/api/ollama/health', async (req, res) => {
    try {
      const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, {
        timeout: 5000,
      });

      res.json({
        status: 'healthy',
        running: true,
        models_available: response.data.models?.length || 0,
      });
    } catch (error) {
      console.warn('[Ollama] Health check failed:', error.message);

      res.status(503).json({
        status: 'unhealthy',
        running: false,
        error: error.message,
        message: 'Ollama is not running. Start it with: ollama serve',
      });
    }
  });
}
