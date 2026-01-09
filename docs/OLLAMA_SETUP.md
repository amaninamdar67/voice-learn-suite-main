# Ollama Setup Guide - Local AI for Voice Learn Suite

Complete guide to set up and use Ollama with DeepSeek-R1 model for local AI inference.

---

## What is Ollama?

Ollama is a tool that lets you run large language models locally on your computer. It's:
- **Free** - No API costs
- **Private** - Data stays on your machine
- **Fast** - Runs locally without internet
- **Easy** - Simple command-line interface

---

## Installation

### Windows

1. **Download Ollama**
   - Go to https://ollama.ai/
   - Click "Download for Windows"
   - Run the installer

2. **Verify Installation**
   ```bash
   ollama --version
   ```

### Mac

1. **Download Ollama**
   - Go to https://ollama.ai/
   - Click "Download for Mac"
   - Run the installer

2. **Verify Installation**
   ```bash
   ollama --version
   ```

### Linux

```bash
# Download and install
curl https://ollama.ai/install.sh | sh

# Verify
ollama --version
```

---

## Pull DeepSeek-R1 Model

The project uses **deepseek-r1:1.5b** - a small, fast reasoning model.

### Pull the Model

```bash
ollama pull deepseek-r1:1.5b
```

This downloads the model (~1.5GB). First time takes a few minutes.

### Alternative Models

If you want to try other models:

```bash
# Smaller, faster
ollama pull deepseek-r1:1b

# Larger, more capable
ollama pull deepseek-r1:7b

# General purpose
ollama pull llama2
ollama pull mistral
```

---

## Start Ollama

### Option 1: Command Line

```bash
ollama serve
```

This starts Ollama on `http://localhost:11434`

### Option 2: Background Service

**Windows:**
- Ollama runs as a service automatically after installation
- Check: Open http://localhost:11434/api/tags in browser

**Mac/Linux:**
```bash
# Start as background service
ollama serve &
```

---

## Verify Ollama is Running

### Check Health

```bash
# In terminal
curl http://localhost:11434/api/tags

# Should return JSON with available models
```

### In Browser

Open: http://localhost:11434/api/tags

Should show:
```json
{
  "models": [
    {
      "name": "deepseek-r1:1.5b",
      "modified_at": "2024-01-15T10:00:00Z",
      "size": 1500000000,
      "digest": "..."
    }
  ]
}
```

---

## Configure Voice Learn Suite

### Backend Configuration

The backend automatically detects Ollama on `http://localhost:11434`

**Optional: Custom Ollama URL**

Create/edit `backend/.env`:
```
OLLAMA_API_URL=http://localhost:11434
```

### Frontend Configuration

The AITutorEnhanced component automatically:
1. Detects available models
2. Defaults to `deepseek-r1:1.5b`
3. Falls back to other models if needed

---

## Using Ollama in the App

### Start the Application

**Terminal 1 - Ollama:**
```bash
ollama serve
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
npm run dev
```

### Use AI Tutor

1. Open http://localhost:8080
2. Login
3. Click AI Tutor button (floating icon)
4. Select model: `deepseek-r1:1.5b`
5. Type a question
6. Get response from local Ollama

---

## API Endpoints

### Chat Endpoint

**POST /api/ollama/chat**

```bash
curl -X POST http://localhost:3001/api/ollama/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is photosynthesis?",
    "model": "deepseek-r1:1.5b"
  }'
```

Response:
```json
{
  "response": "Photosynthesis is the process...",
  "model": "deepseek-r1:1.5b",
  "tokens": {
    "prompt": 10,
    "completion": 150
  }
}
```

### Get Available Models

**GET /api/ollama/models**

```bash
curl http://localhost:3001/api/ollama/models
```

### Health Check

**GET /api/ollama/health**

```bash
curl http://localhost:3001/api/ollama/health
```

### Analyze Text

**POST /api/ollama/analyze-text**

```bash
curl -X POST http://localhost:3001/api/ollama/analyze-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The quick brown fox jumps over the lazy dog",
    "instruction": "summarize",
    "model": "deepseek-r1:1.5b"
  }'
```

Instructions: `summarize`, `explain`, `translate`, `analyze`, `correct`, `expand`

### Code Review

**POST /api/ollama/code-review**

```bash
curl -X POST http://localhost:3001/api/ollama/code-review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "language": "javascript",
    "model": "deepseek-r1:1.5b"
  }'
```

---

## Troubleshooting

### Ollama Not Running

**Error:** `ECONNREFUSED` or "Cannot connect to Ollama"

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

### Model Not Found

**Error:** `Model not found` or 404

**Solution:**
```bash
# Pull the model
ollama pull deepseek-r1:1.5b

# List available models
ollama list
```

### Slow Response

**Reason:** Model is running on CPU (not GPU)

**Solution:**
- Use smaller model: `deepseek-r1:1b`
- Or use GPU (see below)

### Enable GPU Acceleration

**NVIDIA GPU (CUDA):**
```bash
# Install NVIDIA CUDA toolkit
# Then Ollama will automatically use GPU
ollama serve
```

**AMD GPU (ROCm):**
```bash
# Install AMD ROCm
# Then Ollama will automatically use GPU
ollama serve
```

**Apple Silicon (Metal):**
- Ollama automatically uses Metal acceleration
- No additional setup needed

---

## Performance Tips

### Model Selection

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| deepseek-r1:1b | 1GB | Very Fast | Good | Quick responses |
| deepseek-r1:1.5b | 1.5GB | Fast | Better | Balanced |
| deepseek-r1:7b | 7GB | Slow | Best | Complex tasks |
| llama2 | 4GB | Medium | Good | General purpose |

### Optimization

1. **Use smaller models** for faster responses
2. **Enable GPU** if available
3. **Increase timeout** for complex queries
4. **Use context** for better responses

---

## Advanced Usage

### Custom Prompts

```javascript
// In backend route
const prompt = `You are a helpful tutor. Answer this question:
${userMessage}

Provide a clear, educational response.`;
```

### Temperature Control

Lower = more focused, Higher = more creative

```javascript
// In ollama-ai-routes.js
temperature: 0.7,  // Adjust 0.0 to 1.0
```

### Context Window

```javascript
// Include previous messages for context
const context = messages.map(m => `${m.role}: ${m.content}`).join('\n');
```

---

## Comparison: Ollama vs Cloud AI

| Feature | Ollama | Groq | Gemini | Claude |
|---------|--------|------|--------|--------|
| Cost | Free | Free | Free | Paid |
| Speed | Medium | Very Fast | Fast | Medium |
| Privacy | Local | Cloud | Cloud | Cloud |
| Setup | Easy | API Key | API Key | API Key |
| Offline | Yes | No | No | No |
| Quality | Good | Good | Excellent | Excellent |

---

## When to Use Ollama

✅ **Use Ollama when:**
- You want free, unlimited AI
- You need privacy (data stays local)
- You have a powerful computer
- You want to learn about LLMs
- You're offline

❌ **Don't use Ollama when:**
- You need the best quality responses
- You have a weak computer
- You need fast responses (use Groq instead)
- You need image analysis (use Gemini)

---

## Next Steps

1. **Install Ollama** from https://ollama.ai/
2. **Pull model:** `ollama pull deepseek-r1:1.5b`
3. **Start Ollama:** `ollama serve`
4. **Start backend:** `cd backend && npm run dev`
5. **Start frontend:** `npm run dev`
6. **Open app:** http://localhost:8080
7. **Use AI Tutor** with local Ollama!

---

## Resources

- **Ollama Website:** https://ollama.ai/
- **Model Library:** https://ollama.ai/library
- **DeepSeek:** https://www.deepseek.com/
- **Documentation:** https://github.com/ollama/ollama

---

**Last Updated:** January 2026
**Version:** 1.0
