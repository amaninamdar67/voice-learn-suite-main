# AI Tutor Quick Start Guide

## Prerequisites
You need Ollama installed to use the AI Tutor feature.

### Step 1: Install Ollama
1. Download Ollama from: https://ollama.ai
2. Install it on your system
3. Verify installation by opening terminal/command prompt and running:
   ```bash
   ollama --version
   ```

---

## Starting the AI Tutor

### Option 1: Windows (Easiest)
1. Double-click `START_DEEPSEEK_OLLAMA.bat` in the project root
2. Wait for the model to load (first time takes ~2-3 minutes)
3. You'll see: `Ollama service running on port 11434`
4. Keep this window open while using the AI Tutor

### Option 2: Manual Start (Any OS)
Open terminal/command prompt and run:
```bash
ollama pull deepseek-r1:1.5b
ollama serve
```

---

## Using the AI Tutor

1. Start your application (npm run dev)
2. Start Ollama using one of the methods above
3. Click the 🤖 button in the bottom-right corner
4. Start chatting!

### Features:
- **Chat**: Type questions and get AI responses
- **Voice Input**: Press SPACEBAR to use voice commands
- **Document Analysis**: Upload PDFs/documents for analysis
- **Read Aloud**: Click "Read" to hear AI responses
- **Multiple Modes**: Popup, Right Panel, or Fullscreen

---

## Troubleshooting

### "No response from AI"
**Solution**: Make sure Ollama is running
- Check if the `START_DEEPSEEK_OLLAMA.bat` window is open
- Or run `ollama serve` in terminal

### "Connection refused"
**Solution**: Ollama isn't running on port 11434
- Start Ollama using the batch file or manual command
- Wait 10-15 seconds for it to fully load

### "Model not found"
**Solution**: Pull the model first
```bash
ollama pull deepseek-r1:1.5b
```

### "Out of memory"
**Solution**: 
- Close other applications
- Use a smaller model: `ollama pull deepseek-r1:1b`
- Update backend to use: `deepseek-r1:1b`

### Slow responses
**Solution**: This is normal for local AI models
- First response takes longer as model loads
- Subsequent responses are faster
- Consider using GPU acceleration if available

---

## Model Information

**Current Model**: DeepSeek-R1:1.5B
- **Size**: ~1.5GB
- **RAM Required**: 6GB minimum
- **Speed**: Medium (2-10 seconds per response)
- **Quality**: Good for tutoring and analysis

---

## Advanced: Using Different Models

To use a different model:

1. Pull the model:
   ```bash
   ollama pull <model-name>
   ```

2. Update `backend/server.js` line ~1040:
   ```javascript
   model: 'your-model-name',  // Change this
   ```

3. Restart your backend

**Available models**: https://ollama.ai/library

---

## Performance Tips

1. **Keep Ollama running**: Don't close the service window
2. **First response is slow**: Model loads into memory
3. **Batch requests**: Group multiple questions together
4. **Close other apps**: Free up RAM for better performance
5. **Use GPU**: If available, Ollama will use it automatically

---

## Next Steps

- Explore different chat modes (popup, right panel, fullscreen)
- Try uploading documents for analysis
- Use voice commands for hands-free interaction
- Adjust response quality by changing the model

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify Ollama is running: `ollama list`
3. Check backend logs for errors
4. Ensure port 11434 is not blocked by firewall

