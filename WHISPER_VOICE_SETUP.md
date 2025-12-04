# 🎤 Whisper Voice Navigation Setup Guide

## What is This?

This is an **offline, accurate voice navigation system** using OpenAI's Whisper model. It's much more accurate than browser speech recognition and works completely offline!

## ✅ Prerequisites

You already have Whisper downloaded at:
```
C:\Users\Downloads\whisper-bin-x64\Release\main.exe
```

## 📥 Step 1: Download Whisper Model

You need to download the Whisper model file:

1. Go to: https://huggingface.co/ggerganov/whisper.cpp/tree/main
2. Download: `ggml-base.en.bin` (about 140MB)
3. Create folder: `C:\Users\Downloads\whisper-bin-x64\models\`
4. Place the downloaded file there

Your folder structure should look like:
```
C:\Users\Downloads\whisper-bin-x64\
├── Release\
│   └── main.exe  ✓ (you have this)
└── models\
    └── ggml-base.en.bin  ← (download this)
```

## 📦 Step 2: Install Dependencies

Open terminal in your project folder and run:

```bash
npm install multer
```

## 🚀 Step 3: Start the Voice Server

Double-click: `START_WHISPER_VOICE.bat`

Or manually run:
```bash
cd backend
node whisper-voice-server.js
```

You should see:
```
🎤 Whisper Voice Server running on http://localhost:3002
📁 Whisper path: C:\Users\Downloads\whisper-bin-x64\Release\main.exe
```

## 🔧 Step 4: Update Your App

In your React component (e.g., `TopBar.tsx`), replace the import:

**OLD:**
```typescript
import { useEnhancedVoiceNavigation } from '@/hooks/useEnhancedVoiceNavigation';
```

**NEW:**
```typescript
import { useWhisperVoiceNavigation as useEnhancedVoiceNavigation } from '@/hooks/useWhisperVoiceNavigation';
```

## 🎯 How to Use

1. **Start the voice server** (Step 3)
2. **Start your React app** (`npm run dev`)
3. **Press SPACEBAR** or click the mic button
4. **Speak a command** (e.g., "go to dashboard")
5. **Wait 3 seconds** for processing
6. Command executes!

## 🗣️ Available Commands

### Navigation
- "dashboard" / "home"
- "settings"
- "leaderboard" / "rankings"
- "courses" / "videos"
- "quiz" / "quizzes"
- "assignments" / "projects"
- "community"
- "recorded videos"
- "live classes"

### Actions
- "back" / "go back"
- "scroll up" / "scroll down"
- "read page"
- "stop reading"
- "help" / "commands"

## 🔍 Troubleshooting

### Server won't start
- Check if Whisper exists at the path
- Check if model file exists
- Make sure port 3002 is not in use

### No transcription
- Check browser console for errors
- Make sure microphone permission is granted
- Check server logs for Whisper errors

### Slow transcription
- The base.en model is fast (1-2 seconds)
- If too slow, try the tiny.en model instead

## 🎨 Advantages Over Web Speech API

✅ **More Accurate** - Whisper is state-of-the-art
✅ **Works Offline** - No internet needed
✅ **Better with Accents** - Understands various accents
✅ **No Cloud Dependency** - Privacy-friendly
✅ **Consistent** - Same results every time

## 📝 Notes

- Recording happens in 3-second chunks
- There's a 500ms pause between recordings
- Transcription takes 1-2 seconds
- Total cycle: ~4-5 seconds per command

## 🔄 Switching Back to Web Speech API

If you want to go back to the browser's speech recognition:

In `TopBar.tsx`, change back to:
```typescript
import { useEnhancedVoiceNavigation } from '@/hooks/useEnhancedVoiceNavigation';
```

## 🎓 Model Options

You can use different Whisper models:

- `ggml-tiny.en.bin` - Fastest, less accurate (75MB)
- `ggml-base.en.bin` - Good balance (140MB) ← **Recommended**
- `ggml-small.en.bin` - More accurate, slower (460MB)
- `ggml-medium.en.bin` - Very accurate, slow (1.5GB)

Download from: https://huggingface.co/ggerganov/whisper.cpp/tree/main

Update the model path in `backend/whisper-voice-server.js`:
```javascript
const command = `"${WHISPER_PATH}" -m "C:\\Users\\Downloads\\whisper-bin-x64\\models\\ggml-base.en.bin" ...`;
```

## 🎉 You're Ready!

Once you download the model file and start the server, you'll have a powerful offline voice navigation system!
