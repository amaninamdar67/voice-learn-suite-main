AI Tutor Enhanced - Complete Setup Guide

FEATURES IMPLEMENTED

1. Multi-Mode UI
   - Pop-up Mode: Centered floating window (initial)
   - Right-Panel Mode: 45-50% of screen (default after 400ms)
   - Full-Screen Mode: Covers entire screen
   - Reposition button to toggle between modes

2. Chat History
   - Automatically saved to localStorage
   - Persists across sessions
   - Loads instantly on open

3. Voice Features
   - Spacebar toggles mic ON/OFF
   - Voice-to-text input
   - Mic status indicator in input bar
   - Voice command support

4. Text-to-Speech
   - Read button on each AI message
   - Click to start/stop reading
   - Waveform animation indicator
   - Doesn't interrupt UI modes

5. File Upload & Analysis
   - Drag and drop support
   - PDF, Word, text, image support
   - Automatic document analysis
   - Generates: Summary, Key Points, Mistakes, Improvements, Related Concepts

6. Document Card Integration
   - Small AI button on each document card
   - Opens AI Tutor as pop-up
   - Auto-uploads document
   - Begins analysis immediately

7. Notifications
   - Animated pop-ups for:
     - Mic activation/deactivation
     - File uploads
     - Reading start/stop
     - Voice commands
   - Auto-hide after 2 seconds

8. Modern UI
   - Robotic design with blue/purple accents
   - Soft glow effects
   - Smooth animations
   - 3D chat bubbles with shadows
   - Gradient backgrounds

SETUP INSTRUCTIONS

1. Download DeepSeek Model
   ollama pull deepseek-r1:1.5b-qwen-distill

2. Run Ollama
   ollama run deepseek-r1:1.5b-qwen-distill

3. Start Backend
   npm run dev (or your backend start command)

4. Import Components
   - AITutorEnhanced in MainLayout
   - DocumentCardWithAI for document cards
   - useAITutorAnalysis hook for analysis

5. Enable Feature
   - Set aiTutor: true in system config

USAGE

Opening AI Tutor:
- Click the robot icon (bottom-right)
- Click AI button on document cards
- Voice command: "Open AI Tutor"

Switching Modes:
- Click the reposition icon in header
- Cycles: Right-Panel → Pop-up → Full-Screen

Voice Control:
- Press Spacebar to toggle mic
- Speak naturally
- Text appears in input field

Reading Messages:
- Click "Read" button on AI responses
- Click again to stop
- Works in all UI modes

File Upload:
- Click upload icon
- Select file or drag-drop
- AI analyzes automatically

KEYBOARD SHORTCUTS

Spacebar - Toggle microphone (when AI Tutor open)
Enter - Send message
Escape - Close AI Tutor (in pop-up mode)

CUSTOMIZATION

Colors: Edit gradient classes in AITutorEnhanced.tsx
  - from-blue-600 to-purple-600 (main button)
  - from-slate-900 to-slate-900 (background)

Animations: Adjust timing in useEffect hooks
  - 400ms for pop-up to right-panel transition
  - 2000ms for notification auto-hide

Model: Change in backend/server.js
  - model: 'deepseek-r1:1.5b-qwen-distill'

TROUBLESHOOTING

Ollama not connecting:
- Ensure Ollama is running: ollama serve
- Check localhost:11434 is accessible
- Verify model is downloaded: ollama list

Mic not working:
- Check browser permissions
- Ensure HTTPS or localhost
- Test with browser's speech recognition

File upload failing:
- Check file size (max 10MB recommended)
- Verify file format is supported
- Check backend logs

PERFORMANCE NOTES

- DeepSeek-R1 distilled version is faster than full R1
- No thinking phase = instant responses
- Chat history stored locally (no server overhead)
- Voice recognition runs client-side
- TTS uses browser's native speech synthesis

NEXT STEPS

- Add file storage integration
- Implement real document parsing
- Add multi-language support
- Create admin dashboard for analytics
- Add collaborative features
