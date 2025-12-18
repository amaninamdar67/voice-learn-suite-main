# 🤖 AI Tutor - Complete Guide

## What's New?

A brand new, independent AI Tutor interface with:
- ✅ **Big Icon** in top-left corner (next to project title)
- ✅ **Voice Input** - Speak in Hindi or English
- ✅ **Voice Output** - Responses read aloud in Hindi
- ✅ **Image Analysis** - Upload diagrams, flowcharts, math problems
- ✅ **Large, Readable UI** - Bigger fonts, clear layout
- ✅ **Fast Local Processing** - Uses Ollama (runs on your machine)
- ✅ **1-on-1 Discussion** - Dedicated chat interface

## Quick Start (5 minutes)

### Step 1: Install Ollama
1. Download from https://ollama.ai
2. Install and run the installer
3. Restart your computer

### Step 2: Download a Model
Open Command Prompt and run:
```bash
ollama pull mistral
```

This downloads the Mistral model (~4GB). Other options:
```bash
ollama pull neural-chat    # Faster, good for conversations
ollama pull codellama      # Best for coding questions
```

### Step 3: Start Ollama Server
```bash
ollama serve
```

Keep this window open. You should see:
```
Listening on 127.0.0.1:11434
```

### Step 4: Use AI Tutor
1. Click the big 🤖 icon in the top-left corner
2. Start asking questions!

## Features Explained

### 1. Voice Input (Hindi Support)
```
How it works:
1. Click the microphone icon
2. Speak your question in Hindi or English
3. Your speech is automatically transcribed
4. Click Send
```

**Supported Languages:**
- Hindi (hi-IN) - Default
- English (en-US)
- Can be changed in code

### 2. Voice Output (Hindi Support)
```
How it works:
1. AI responds to your question
2. Click "Read (Hindi)" button
3. Response is read aloud in Hindi
4. Click "Stop Reading" to stop
```

**Note:** Uses browser's native speech synthesis. Quality depends on your system's Hindi voice.

### 3. Image Upload & Analysis
```
Perfect for:
- Mathematical diagrams
- Flowcharts and algorithms
- Circuit diagrams
- Graphs and charts
- Screenshots of problems
- Any academic visual content

How to use:
1. Click the image icon
2. Select an image
3. Ask the AI to explain it
4. Click Send
```

### 4. Model Selection
```
Available models (if installed):
- mistral:latest (Recommended - balanced)
- neural-chat:latest (Fastest)
- codellama:latest (Best for coding)
- llama2:latest (Most accurate)

Switch models anytime from the dropdown menu
```

## UI/UX Improvements

### Large, Readable Text
- **Input field**: 18px font
- **Messages**: 18px font
- **Buttons**: Large, easy to click
- **Spacing**: Generous padding for clarity

### Clean Layout
- Messages clearly separated
- User messages on right (blue)
- AI responses on left (gray)
- Images displayed inline
- Status indicators for loading

### Responsive Design
- Works on desktop
- Fullscreen interface
- Optimized for readability

## File Structure

```
Project Root/
├── src/
│   ├── components/
│   │   ├── AITutor/
│   │   │   ├── AITutorNew.tsx          ← New AI Tutor component
│   │   │   └── AITutorEnhanced.tsx     ← Legacy (can remove)
│   │   └── Layout/
│   │       └── TopBar.tsx              ← Updated with AI icon
│   └── App.tsx                         ← Integrated AI Tutor
│
├── backend/
│   ├── ai-tutor-routes.js              ← AI Tutor API
│   └── server.js                       ← Integrated routes
│
└── Quick Launch/
    └── START_AI_TUTOR.bat              ← Quick start script
```

## API Endpoints

### POST /api/ai-tutor/chat

**Request:**
```json
{
  "message": "Explain this diagram",
  "model": "mistral:latest",
  "image": "data:image/png;base64,..." // optional
}
```

**Response:**
```json
{
  "response": "The diagram shows...",
  "model": "mistral:latest"
}
```

**Error Response:**
```json
{
  "error": "Failed to get AI response",
  "details": "Make sure Ollama is running with: ollama serve"
}
```

## Troubleshooting

### Problem: "No models available"
**Solution:**
1. Make sure Ollama is running: `ollama serve`
2. Check installed models: `ollama list`
3. Pull a model: `ollama pull mistral`

### Problem: Voice input not working
**Solution:**
1. Check browser microphone permissions
2. Ensure microphone is connected
3. Try Chrome or Edge (better support)
4. Check browser console for errors

### Problem: Voice output not working
**Solution:**
1. Check system volume
2. Ensure speakers are connected
3. Try a different browser
4. Check if Hindi voice is installed on system

### Problem: Slow responses
**Solution:**
1. Use a faster model: `neural-chat` or `mistral`
2. Close other applications
3. Check system RAM (need at least 8GB)
4. Reduce image size before uploading

### Problem: "Connection refused" error
**Solution:**
1. Start Ollama: `ollama serve`
2. Wait 5 seconds for server to start
3. Check if port 11434 is available
4. Restart Ollama if needed

## Performance Tips

### For Faster Responses
1. Use `neural-chat` model (fastest)
2. Close unnecessary browser tabs
3. Close other applications
4. Ensure good internet (for initial model download)

### For Better Accuracy
1. Use `llama2` or `dolphin-mixtral` models
2. Ask clear, specific questions
3. Provide context when needed

### For Image Analysis
1. Use smaller images (< 2MB)
2. Crop to relevant area
3. Ensure good image quality
4. Ask specific questions about the image

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Send message |
| Spacebar | Toggle voice input (if enabled) |
| Escape | Close AI Tutor (future) |

## Model Recommendations

### For General Questions
```
neural-chat:latest
- Fastest response time
- Good for conversations
- ~4GB size
```

### For Coding Questions
```
codellama:latest
- Specialized for code
- Explains algorithms well
- ~4GB size
```

### For Math & Science
```
mistral:latest
- Balanced performance
- Good reasoning
- ~4GB size
```

### For Complex Topics
```
llama2:latest
- Most accurate
- Better explanations
- Slower (~10-15s per response)
- ~7GB size
```

## Advanced Configuration

### Change Default Language
Edit `src/components/AITutor/AITutorNew.tsx`:
```typescript
// Line 47: Change language
recognitionRef.current.lang = 'en-US'; // Change to English
```

### Change Default Model
Edit `src/components/AITutor/AITutorNew.tsx`:
```typescript
// Line 24: Change default model
const [selectedModel, setSelectedModel] = useState('neural-chat:latest');
```

### Adjust Response Temperature
Edit `backend/ai-tutor-routes.js`:
```javascript
// Line 45: Adjust creativity (0.0-1.0)
temperature: 0.7, // Lower = more focused, Higher = more creative
```

## Future Enhancements

- [ ] Piper TTS for better voice quality
- [ ] Multi-language support
- [ ] Chat history with database
- [ ] Session management
- [ ] Custom model fine-tuning
- [ ] Real-time streaming responses
- [ ] Code syntax highlighting
- [ ] LaTeX math rendering
- [ ] Export conversations
- [ ] Collaborative sessions

## Support & Issues

### Common Issues
1. **Ollama not starting**: Restart computer, reinstall Ollama
2. **Model download fails**: Check internet connection, try again
3. **Slow responses**: Use faster model, close other apps
4. **Voice not working**: Check browser permissions, try different browser

### Getting Help
1. Check the troubleshooting section above
2. Review Ollama documentation: https://ollama.ai
3. Check browser console for errors (F12)
4. Ensure all services are running

## System Requirements

- **Minimum**: 8GB RAM, 4GB free disk space
- **Recommended**: 16GB RAM, 10GB free disk space
- **Processor**: Intel i5 or equivalent
- **Internet**: For initial model download only

## License & Attribution

- Ollama: https://ollama.ai
- Mistral Model: https://mistral.ai
- Web Speech API: Browser native

---

**Happy Learning! 🚀**

For questions or feedback, check the project documentation or contact the development team.
