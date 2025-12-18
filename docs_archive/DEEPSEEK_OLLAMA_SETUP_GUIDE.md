# DeepSeek-R1:1.5B Setup Guide for Ollama

## Overview
DeepSeek-R1:1.5B is a powerful open-source AI model optimized for local deployment. This guide walks you through downloading and running it on Ollama.

---

## Prerequisites
- Ollama installed on your system
- At least 4GB of free disk space (for the model)
- At least 8GB RAM recommended (4GB minimum)
- Internet connection for initial download

---

## Step 1: Verify Ollama Installation

Check if Ollama is installed and running:

```bash
ollama --version
```

If not installed, download from: https://ollama.ai

---

## Step 2: Pull DeepSeek-R1:1.5B Model

Open terminal/command prompt and run:

```bash
ollama pull deepseek-r1:1.5b
```

This command will:
- Download the model (~1.5GB)
- Extract and prepare it for use
- Show progress as it downloads

**Expected output:**
```
pulling manifest
pulling 8934d3bdaf95
pulling 8ee172f3ff5e
pulling 237b0f2f7e5e
verifying sha256 digest
writing manifest
success
```

---

## Step 3: Verify Model Installation

List all installed models:

```bash
ollama list
```

You should see `deepseek-r1:1.5b` in the list.

---

## Step 4: Run the Model

Start the model:

```bash
ollama run deepseek-r1:1.5b
```

This will:
- Load the model into memory
- Start an interactive chat session
- Show a prompt where you can type

**Example interaction:**
```
>>> What is 2+2?
The answer is 4.

>>> Tell me about machine learning
Machine learning is a subset of artificial intelligence...
```

Type `exit` or `quit` to exit the chat.

---

## Step 5: Use with Your Application

### Option A: Direct API Calls

The model runs on `http://localhost:11434` by default.

**Example API call:**
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:1.5b",
  "prompt": "What is AI?",
  "stream": false
}'
```

### Option B: Use in Your Backend

Update your backend code to use DeepSeek instead of other models:

```javascript
// Example: Node.js with Ollama
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'deepseek-r1:1.5b',
    prompt: userMessage,
    stream: false
  })
});

const data = await response.json();
console.log(data.response);
```

### Option C: Keep Running in Background

Start Ollama as a service (it runs on port 11434):

**Windows:**
```bash
ollama serve
```

**Mac/Linux:**
```bash
ollama serve &
```

This keeps the model loaded and ready for API calls.

---

## Step 6: Integration with Your AI Tutor

If you're using the AI Tutor feature in your app:

1. Update `backend/ollama-server.js` to use `deepseek-r1:1.5b`:

```javascript
const modelName = 'deepseek-r1:1.5b';

const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: modelName,
    prompt: userPrompt,
    stream: false,
    temperature: 0.7
  })
});
```

2. Restart your backend server

3. Test the AI Tutor feature in your app

---

## Troubleshooting

### Issue: "Connection refused" error
**Solution**: Make sure Ollama is running
```bash
ollama serve
```

### Issue: Model takes too long to download
**Solution**: This is normal for first-time download. The model is ~1.5GB. Be patient.

### Issue: Out of memory error
**Solution**: 
- Close other applications
- Reduce other processes
- Consider using a smaller model like `deepseek-r1:1b`

### Issue: Model runs slowly
**Solution**:
- This is normal for local models
- Reduce `temperature` parameter for faster responses
- Use GPU acceleration if available

---

## Model Variants Available

DeepSeek offers different sizes:

| Model | Size | Speed | Quality | RAM Needed |
|-------|------|-------|---------|-----------|
| deepseek-r1:1b | ~1GB | Fast | Good | 4GB |
| deepseek-r1:1.5b | ~1.5GB | Medium | Better | 6GB |
| deepseek-r1:7b | ~7GB | Slow | Best | 16GB |

For most use cases, `deepseek-r1:1.5b` is the sweet spot.

---

## Performance Tips

1. **First run is slow**: Model loads into memory on first use
2. **Keep Ollama running**: Don't stop the service between requests
3. **Batch requests**: Group multiple queries together
4. **Adjust temperature**: Lower = more focused, Higher = more creative
5. **Use streaming**: For long responses, enable streaming mode

---

## Verify It's Working

Test with a simple curl command:

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1:1.5b",
    "prompt": "Hello, how are you?",
    "stream": false
  }'
```

You should get a JSON response with the model's answer.

---

## Next Steps

1. Integrate with your AI Tutor feature
2. Test with your application
3. Adjust parameters based on performance
4. Consider using GPU acceleration for faster responses

---

## Resources

- Ollama Documentation: https://github.com/ollama/ollama
- DeepSeek Models: https://huggingface.co/deepseek-ai
- Model Library: https://ollama.ai/library

---

## Quick Reference Commands

```bash
# Pull the model
ollama pull deepseek-r1:1.5b

# Run interactively
ollama run deepseek-r1:1.5b

# List installed models
ollama list

# Remove a model
ollama rm deepseek-r1:1.5b

# Start Ollama service
ollama serve

# Check Ollama version
ollama --version
```
