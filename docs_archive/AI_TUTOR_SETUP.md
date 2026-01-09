# AI Tutor Setup Guide

## Overview
The new AI Tutor is a dedicated, independent interface for 1-on-1 discussions with AI. It features:
- **Big Icon**: Located in the top-left corner next to the project title
- **Voice Input**: Hindi language support (voice-to-text)
- **Voice Output**: Hindi language support (text-to-speech)
- **Image Analysis**: Upload diagrams, flowcharts, or any academic images for explanation
- **Large, Readable UI**: Bigger fonts and clear layout for better readability
- **Fast Responses**: Uses local Ollama models for quick processing

## Features

### 1. Voice-to-Text (Hindi)
- Click the microphone icon to start recording
- Speak in Hindi or English
- Your speech is automatically transcribed
- Default language: Hindi (hi-IN)

### 2. Text-to-Speech (Hindi)
- Click "Read (Hindi)" button on any AI response
- The response is read aloud in Hindi
- Uses browser's native speech synthesis with Hindi voice

### 3. Image Upload & Analysis
- Click the image icon to upload diagrams, flowcharts, or academic images
- Ask the AI to explain the image
- Perfect for:
  - Mathematical diagrams
  - Flowcharts and algorithms
  - Circuit diagrams
  - Graphs and charts
  - Any academic visual content

### 4. Model Selection
- Dropdown menu to select different AI models
- Default: `mistral:latest`
- Available models depend on what's installed in Ollama

## Setup Requirements

### 1. Install Ollama
Download from: https://ollama.ai

### 2. Pull a Model
```bash
ollama pull mistral
# or for faster responses:
ollama pull neural-chat
# or for coding:
ollama pull codellama
```

### 3. Start Ollama Server
```bash
ollama serve
```
The server will run on `http://localhost:11434`

### 4. Backend Setup
The AI Tutor routes are already integrated in `backend/server.js`:
- Endpoint: `/api/ai-tutor/chat`
- Accepts: `message`, `model`, `image` (optional)
- Returns: AI response

## Usage

### Opening AI Tutor
1. Click the big 🤖 icon in the top-left corner (next to project title)
2. The AI Tutor interface opens in fullscreen

### Asking Questions
1. Type your question in the input field
2. Or click the microphone to speak (Hindi supported)
3. Click Send or press Enter

### Explaining Images
1. Click the image icon
2. Select an image (diagram, flowchart, etc.)
3. Type your question or ask to explain the image
4. Click Send

### Reading Responses
1. Click "Read (Hindi)" button on any AI response
2. The response is read aloud in Hindi
3. Click "Stop Reading" to stop

## Supported Models

### Fast & Lightweight
- `neural-chat:latest` - Best for conversations
- `mistral:latest` - Good balance of speed and quality

### Better Quality
- `llama2:latest` - More accurate but slower
- `dolphin-mixtral:latest` - Excellent reasoning

### Specialized
- `codellama:latest` - Best for coding questions
- `llava:latest` - For image understanding (if available)

## Keyboard Shortcuts
- **Enter**: Send message
- **Spacebar** (in voice nav): Toggle voice input

## Troubleshooting

### "No models available" error
- Make sure Ollama is running: `ollama serve`
- Check if models are installed: `ollama list`
- Pull a model: `ollama pull mistral`

### Voice input not working
- Check browser permissions for microphone
- Ensure microphone is connected
- Try a different browser (Chrome/Edge work best)

### Voice output not working
- Check system volume
- Ensure text-to-speech is enabled in browser
- Try a different browser

### Slow responses
- Use a faster model: `neural-chat` or `mistral`
- Close other applications
- Check system resources

## File Structure
```
src/components/AITutor/
├── AITutorNew.tsx          # Main AI Tutor component
└── AITutorEnhanced.tsx     # Legacy component (can be removed)

backend/
├── ai-tutor-routes.js      # AI Tutor API endpoints
└── server.js               # Main server (integrated)

src/components/Layout/
└── TopBar.tsx              # Updated with AI Tutor icon
```

## API Endpoint

### POST /api/ai-tutor/chat
Request:
```json
{
  "message": "Explain this diagram",
  "model": "mistral:latest",
  "image": "data:image/png;base64,..." // optional
}
```

Response:
```json
{
  "response": "The diagram shows...",
  "model": "mistral:latest"
}
```

## Performance Tips

1. **Use smaller models** for faster responses:
   - `neural-chat` (4GB)
   - `mistral` (4GB)

2. **Disable unnecessary features** if running slow:
   - Close other applications
   - Reduce browser tabs

3. **For image analysis**:
   - Use smaller images (< 2MB)
   - Crop to relevant area only

## Future Enhancements
- [ ] Piper TTS integration for better voice quality
- [ ] Multi-language support
- [ ] Chat history persistence
- [ ] Session management
- [ ] Custom model fine-tuning
- [ ] Real-time streaming responses
