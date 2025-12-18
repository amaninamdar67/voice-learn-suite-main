# Ollama + DeepSeek Setup Instructions

## What is Ollama?
Ollama is a tool that lets you run large language models (like DeepSeek) locally on your computer. This means the AI Tutor works without internet and keeps your data private.

---

## Installation Steps

### Step 1: Download and Install Ollama

1. Go to: https://ollama.ai
2. Click "Download"
3. Choose your operating system (Windows, Mac, or Linux)
4. Run the installer and follow the prompts
5. Restart your computer after installation

### Step 2: Verify Installation

Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:
```bash
ollama --version
```

You should see a version number like `0.1.0` or similar.

---

## Starting the AI Tutor

### Windows Users (Easiest Method)

1. In the project root folder, find `START_DEEPSEEK_OLLAMA.bat`
2. Double-click it
3. A command window will open
4. Wait for it to say "Ollama service running on port 11434"
5. Keep this window open while using the AI Tutor

**First time only**: The model will download (~1.5GB). This takes 2-5 minutes depending on your internet speed.

### Mac/Linux Users

Open Terminal and run:
```bash
ollama pull deepseek-r1:1.5b
ollama serve
```

Wait for it to say the service is running.

---

## Using the AI Tutor

1. Make sure Ollama is running (see above)
2. Start your application: `npm run dev`
3. Click the 🤖 button in the bottom-right corner
4. Start chatting!

### Available Features:
- **Chat**: Ask questions and get AI responses
- **Voice Input**: Press SPACEBAR to use voice commands
- **Document Upload**: Upload PDFs or text files for analysis
- **Read Aloud**: Click "Read" to hear responses
- **Multiple Views**: Popup, Right Panel, or Fullscreen

---

## Troubleshooting

### Problem: "No response from AI" or "Cannot connect to Ollama"

**Solution**: Ollama is not running
- Windows: Double-click `START_DEEPSEEK_OLLAMA.bat` again
- Mac/Linux: Run `ollama serve` in terminal
- Wait 10-15 seconds for it to fully load

### Problem: "Model not found" error

**Solution**: The model hasn't been downloaded yet
- Windows: The batch file will download it automatically
- Mac/Linux: Run `ollama pull deepseek-r1:1.5b`

### Problem: Very slow responses or "out of memory"

**Solution**: Your computer doesn't have enough RAM
- Close other applications
- Try a smaller model: `ollama pull deepseek-r1:1b`
- Update `backend/server.js` line ~1040 to use `deepseek-r1:1b`

### Problem: Ollama won't start

**Solution**: Port 11434 might be in use
- Windows: Run `netstat -ano | findstr :11434` to see what's using it
- Mac/Linux: Run `lsof -i :11434`
- Kill the process or use a different port

### Problem: Download is very slow

**Solution**: This is normal for first-time setup
- The model is ~1.5GB
- Depending on your internet, this can take 5-30 minutes
- Don't close the window during download

---

## Model Information

**Current Model**: DeepSeek-R1:1.5B
- **Size**: ~1.5GB
- **RAM Required**: 6GB minimum (4GB if you close other apps)
- **Speed**: 2-10 seconds per response
- **Quality**: Good for tutoring and document analysis

### Alternative Models

If you want to try different models:

```bash
# Smaller, faster model (1GB)
ollama pull deepseek-r1:1b

# Larger, better quality model (7GB, needs 16GB RAM)
ollama pull deepseek-r1:7b

# Other models
ollama pull llama2
ollama pull mistral
```

To use a different model, update `backend/server.js` line ~1040:
```javascript
model: 'deepseek-r1:1b',  // Change this to your model name
```

---

## Performance Tips

1. **Keep Ollama running**: Don't close the service window
2. **First response is slow**: The model loads into memory on first use
3. **Close other apps**: Free up RAM for better performance
4. **Batch questions**: Group multiple questions together
5. **Use GPU**: If your computer has a GPU, Ollama will use it automatically

---

## Checking if Ollama is Running

### Windows
- Look for the command window with "Ollama service running"
- Or run: `ollama list` in a new command prompt

### Mac/Linux
- Look for the terminal window with the service running
- Or run: `ollama list` in a new terminal

---

## Stopping Ollama

### Windows
- Close the command window

### Mac/Linux
- Press `Ctrl+C` in the terminal

---

## Advanced: Using GPU Acceleration

If your computer has an NVIDIA GPU:

1. Install CUDA from: https://developer.nvidia.com/cuda-downloads
2. Restart your computer
3. Ollama will automatically use GPU

This makes responses 5-10x faster!

---

## Quick Reference

```bash
# Download a model
ollama pull deepseek-r1:1.5b

# List installed models
ollama list

# Run a model interactively
ollama run deepseek-r1:1.5b

# Start the service (for API calls)
ollama serve

# Remove a model
ollama rm deepseek-r1:1.5b

# Check version
ollama --version
```

---

## Support Resources

- Ollama GitHub: https://github.com/ollama/ollama
- Ollama Documentation: https://github.com/ollama/ollama/blob/main/README.md
- Model Library: https://ollama.ai/library
- DeepSeek Models: https://huggingface.co/deepseek-ai

---

## Next Steps

1. Install Ollama
2. Run `START_DEEPSEEK_OLLAMA.bat` (Windows) or `ollama serve` (Mac/Linux)
3. Start your application
4. Click the 🤖 button and start chatting!

Enjoy your AI Tutor! 🚀

