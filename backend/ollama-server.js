import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Ollama API endpoint (default local)
const OLLAMA_URL = 'http://localhost:11434';

// Chat with Ollama
app.post('/chat', async (req, res) => {
  try {
    const { message, model = 'llama3.2', context = [] } = req.body;

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          ...context,
          { role: 'user', content: message }
        ],
        stream: false
      })
    });

    const data = await response.json();
    res.json({ 
      response: data.message.content,
      model: data.model
    });
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});

// Generate content (quiz, summary, etc.)
app.post('/generate', async (req, res) => {
  try {
    const { prompt, model = 'llama3.2' } = req.body;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    const data = await response.json();
    res.json({ 
      response: data.response,
      model: data.model
    });
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
});

// Process voice command with AI
app.post('/process-command', async (req, res) => {
  try {
    const { command, model = 'llama3.2' } = req.body;

    const systemPrompt = `You are a voice navigation assistant for an e-learning platform. 
The user said: "${command}"

Determine what they want to do. Respond with ONLY a JSON object:
{
  "action": "navigate|ask|help|unknown",
  "target": "dashboard|settings|courses|quiz|etc",
  "response": "brief confirmation message"
}

Available pages: dashboard, settings, leaderboard, lessons, courses, quiz, assignments, community, recorded-videos, live-classes`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: systemPrompt,
        stream: false
      })
    });

    const data = await response.json();
    
    try {
      const parsed = JSON.parse(data.response);
      res.json(parsed);
    } catch {
      res.json({ 
        action: 'unknown',
        response: data.response
      });
    }
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ error: 'Failed to process command', details: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    res.json({ 
      status: 'ok', 
      ollama: 'connected',
      models: data.models?.map(m => m.name) || []
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      ollama: 'disconnected',
      message: 'Make sure Ollama is running: ollama serve'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 Ollama AI Server running on http://localhost:${PORT}`);
  console.log(`📡 Connecting to Ollama at ${OLLAMA_URL}`);
});
