# 🎤 Complete Commands Guide

## 🚀 Startup Commands

### Start All Servers:

**Terminal 1 - Main App:**
```bash
npm run dev
```

**Terminal 2 - AI Tutor (Ollama):**
```bash
cd backend
node ollama-server.js
```
OR double-click: `START_AI_TUTOR.bat`

**Terminal 3 - Whisper Voice (Optional):**
```bash
cd backend
node whisper-voice-server.js
```
OR double-click: `START_WHISPER_VOICE.bat`

---

## 🗣️ Voice Navigation Commands

### Basic Navigation:
- "dashboard" / "home"
- "settings"
- "leaderboard" / "rankings"
- "lessons" / "study materials"
- "courses" / "videos"
- "quiz" / "quizzes"
- "assignments" / "projects"
- "community"
- "AI tutor" / "tutor"

### Student Pages:
- "recorded videos" / "recorded classes"
- "live classes"
- "quiz rankings"
- "overall rankings"

### Actions:
- "back" / "go back"
- "scroll up" / "go up"
- "scroll down" / "go down"
- "read page"
- "stop reading"
- "help" / "commands"

---

## 🤖 AI Tutor Features

### Opening AI Tutor:
1. Click blue robot button (bottom-right)
2. Say "AI Tutor"
3. Click "AI Tutor" in sidebar

### Position Modes:
- **Center** (default) - Modal in middle
- **Right** - Docked to right side
- **Left** - Docked to left side
- **Fullscreen** - Takes full screen

Click the arrow button (→) to cycle through positions:
Center → Right → Left → Fullscreen → Center

### Stop AI Speaking:
- Click the 🔇 button (appears when AI is speaking)
- Or say "stop reading"

### Voice Input:
- Click microphone button
- Speak your question
- AI transcribes and responds

### Model Selection:
Choose from dropdown:
- qwen2.5:7b - Recommended (best balance)
- qwen3:30b - Best quality (slower)
- qwen3:8b - Good quality
- qwen3:4b - Fastest

---

## 📋 Quick Reference

### Servers to Run:

| Server | Command | Port | Purpose |
|--------|---------|------|---------|
| Main App | `npm run dev` | 5173 | Your app |
| AI Tutor | `node ollama-server.js` | 3003 | Ollama AI |
| Whisper | `node whisper-voice-server.js` | 3002 | Voice (optional) |
| Ollama | `ollama serve` | 11434 | AI models |

### Keyboard Shortcuts:

| Key | Action |
|-----|--------|
| SPACEBAR | Toggle voice navigation |
| ESC | Close AI Tutor modal |
| ENTER | Send message in AI Tutor |

### Voice Commands Quick List:

```
Navigation:
- dashboard
- settings  
- courses
- quiz
- assignments
- AI tutor

Actions:
- back
- scroll down
- scroll up
- help
```

---

## 🎯 AI Tutor Usage

### Ask Questions:
- "Explain photosynthesis"
- "What is the Pythagorean theorem?"
- "How does gravity work?"

### Get Practice:
- "Quiz me on World War 2"
- "Create practice problems"
- "Test my knowledge"

### Study Help:
- "Summarize this chapter"
- "Give me examples"
- "How should I study?"

---

## 🔧 Troubleshooting

### AI Tutor shows "Failed to fetch":
```bash
# Start Ollama server
cd backend
node ollama-server.js
```

### Voice navigation not working:
- Press SPACEBAR to toggle
- Grant microphone permission
- Check browser console for errors

### Ollama not responding:
```bash
# Check if Ollama is running
ollama list

# If not, start it
ollama serve
```

---

## 📊 System Status Check

### Check All Services:

```bash
# Check main app
curl http://localhost:5173

# Check AI server
curl http://localhost:3003/health

# Check Ollama
curl http://localhost:11434/api/tags

# Check Whisper (if using)
curl http://localhost:3002/health
```

---

## 🎨 UI Controls

### AI Tutor Modal:

| Button | Action |
|--------|--------|
| → | Cycle position (center→right→left→fullscreen) |
| 🔇 | Stop AI speaking |
| 🗑️ | Clear chat history |
| ✕ | Close modal |
| 🎤 | Voice input |
| ➤ | Send message |

### Position Cycle:
1. **Center** - Modal in middle (default)
2. **Right** - Docked to right edge
3. **Left** - Docked to left edge
4. **Fullscreen** - Full screen mode
5. Back to **Center**

---

## 🎊 Complete Setup

### One-Time Setup:
1. Install Ollama: https://ollama.com
2. Download model: `ollama pull qwen2.5:7b`
3. (Optional) Download Whisper model

### Every Time You Start:
1. Start Ollama (usually auto-starts)
2. Start AI server: `START_AI_TUTOR.bat`
3. Start your app: `npm run dev`
4. Done! 🚀

---

## 📝 Summary

**Servers Running:**
- ✅ Main app (port 5173)
- ✅ AI Tutor (port 3003)
- ✅ Ollama (port 11434)

**Features:**
- ✅ Voice navigation (SPACEBAR)
- ✅ AI Tutor (floating button)
- ✅ 4 position modes (center/right/left/fullscreen)
- ✅ Stop speaking button
- ✅ Voice input/output
- ✅ Multiple AI models

**Ready to use!** 🎉
