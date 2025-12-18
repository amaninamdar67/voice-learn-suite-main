# 🚀 Complete Setup Guide - Voice + AI

## ✅ What's Ready

You now have:
- ✅ Voice navigation (SPACEBAR)
- ✅ AI Tutor with Ollama (floating modal)
- ✅ 4 position modes (center/right/left/fullscreen)
- ✅ Stop speaking button
- ✅ Voice input/output

## 🎯 Quick Start (2 Commands!)

### Option 1: Automatic (Easiest)
```bash
# Start AI server
START_ALL_SERVERS.bat

# Start your app (in another terminal)
npm run dev
```

### Option 2: Manual
**Terminal 1:**
```bash
cd backend
node ollama-server.js
```

**Terminal 2:**
```bash
npm run dev
```

That's it! 🎉

---

## 🎮 How to Use

### AI Tutor:
1. **Look for blue robot button** (bottom-right corner)
2. **Click it** - Modal opens in center
3. **Type or speak** your question
4. **AI responds** with text and voice

### Position Controls:
Click the arrow button (→) in modal header to cycle:
- **Center** → **Right** → **Left** → **Fullscreen** → Center

### Stop AI Speaking:
- Click **🔇 button** (appears when AI is speaking)
- Or close the modal

### Voice Navigation:
- Press **SPACEBAR** anywhere
- Say commands like "dashboard", "courses", "AI tutor"

---

## 🗣️ Voice Commands

### Navigation:
```
"dashboard"      → Go to dashboard
"settings"       → Open settings
"courses"        → Open video lessons
"quiz"           → Open quizzes
"assignments"    → Open assignments
"AI tutor"       → Open AI Tutor
"back"           → Go back
```

### Actions:
```
"scroll down"    → Scroll page
"scroll up"      → Scroll up
"read page"      → Read headings
"stop reading"   → Stop reading
"help"           → List commands
```

---

## 🤖 AI Tutor Examples

### Ask Questions:
- "Explain Newton's laws"
- "What is photosynthesis?"
- "How do I solve quadratic equations?"

### Get Practice:
- "Quiz me on World War 2"
- "Create math practice problems"
- "Test my knowledge of biology"

### Study Help:
- "Summarize this topic"
- "Give me examples"
- "How should I study for exams?"

---

## 📊 System Architecture

```
Your Browser
    ↓
React App (port 5173)
    ├─ Voice Navigation (Web Speech API)
    └─ AI Tutor Button
         ↓
    AI Server (port 3003)
         ↓
    Ollama (port 11434)
         ↓
    Qwen Models (local)
```

---

## 🎨 UI Features

### AI Tutor Modal:

**Header:**
- 🤖 AI Tutor title
- → Position toggle (center/right/left/fullscreen)
- 🔇 Stop speaking (when AI is talking)
- 🗑️ Clear chat
- ✕ Close

**Body:**
- Model selector dropdown
- Suggested questions (chips)
- Chat messages
- User/AI avatars

**Footer:**
- Text input
- 🎤 Voice input button
- ➤ Send button

### Floating Button:
- Blue circular button
- Robot icon
- Bottom-right corner
- Always visible
- Tooltip on hover

---

## 🔧 Position Modes

### 1. Center (Default)
- Modal in middle of screen
- 80% height
- Medium width
- Good for focused chat

### 2. Right Side
- Docked to right edge
- Full height
- 400px width
- Good for multitasking

### 3. Left Side
- Docked to left edge
- Full height
- 400px width
- Alternative view

### 4. Fullscreen
- Takes entire screen
- Maximum space
- Best for long conversations

---

## 🎯 Models Available

From your Ollama:
- **qwen2.5:7b** ⭐ Recommended (best balance)
- **qwen3:30b** 🚀 Best quality (slower)
- **qwen3:8b** ⚡ Good quality
- **qwen3:4b** ⚡⚡ Fastest

---

## 🆘 Troubleshooting

### "Failed to fetch" error:
```bash
# Start AI server
cd backend
node ollama-server.js

# OR
START_AI_TUTOR.bat
```

### AI not responding:
```bash
# Check Ollama is running
ollama list

# If not, start it
ollama serve
```

### Voice not working:
- Grant microphone permission
- Check browser supports Web Speech API
- Try Chrome/Edge

### Can't stop AI speaking:
- Click 🔇 button in modal header
- Or close the modal
- Or refresh page

---

## 📝 File Structure

```
backend/
├── ollama-server.js          ← AI server
├── whisper-voice-server.js   ← Voice server (optional)
└── server.js                 ← Main server

src/
├── components/
│   └── AITutor/
│       ├── AITutorModal.tsx  ← Floating modal
│       └── AITutorFab.tsx    ← Floating button
├── hooks/
│   ├── useOllamaChat.ts      ← AI chat hook
│   └── useEnhancedVoiceNavigation.ts ← Voice nav
└── components/Layout/
    └── MainLayout.tsx        ← Includes FAB

Startup Scripts:
├── START_AI_TUTOR.bat        ← Start AI server
├── START_WHISPER_VOICE.bat   ← Start Whisper (optional)
└── START_ALL_SERVERS.bat     ← Start everything
```

---

## ✨ Features Summary

### Voice Navigation:
- ✅ Press SPACEBAR to toggle
- ✅ Speak commands
- ✅ Navigate hands-free
- ✅ Works immediately

### AI Tutor:
- ✅ Floating button (always visible)
- ✅ 4 position modes
- ✅ Voice input/output
- ✅ Stop speaking button
- ✅ Multiple AI models
- ✅ Chat history
- ✅ Suggested questions

### Integration:
- ✅ Voice command to open AI Tutor
- ✅ Sidebar menu item
- ✅ Floating button
- ✅ Works on all pages

---

## 🎊 You're Ready!

Everything is set up and working! Just:

1. **Servers are running** ✅
2. **Refresh your browser**
3. **Look for blue robot button** (bottom-right)
4. **Click and start chatting!**

Or say **"AI Tutor"** to open it with voice! 🎤

---

## 📚 Documentation

- **This file** - Complete commands
- **AI_TUTOR_COMPLETE.md** - AI Tutor details
- **AI_TUTOR_FLOATING_UI.md** - UI features
- **VOICE_COMMANDS_COMPLETE.md** - Voice commands
- **ALL_FIXED_NOW.md** - Recent fixes

---

**Need help?** Just ask the AI Tutor! It can explain how to use itself! 😊
