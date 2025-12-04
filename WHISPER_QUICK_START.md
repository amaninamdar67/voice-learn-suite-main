# 🚀 Whisper Voice Navigation - Quick Start

## You're Almost There!

You already have Whisper downloaded. Just 3 more steps:

## Step 1: Download the Model (2 minutes)

1. Go to: https://huggingface.co/ggerganov/whisper.cpp/tree/main
2. Click on `ggml-base.en.bin` (140MB)
3. Click the download button (↓)
4. Create this folder: `C:\Users\Downloads\whisper-bin-x64\models\`
5. Move the downloaded file there

## Step 2: Install Dependencies (30 seconds)

Open terminal in your project folder:

```bash
npm install multer
```

## Step 3: Test It! (1 minute)

### A. Start the Voice Server

Double-click: `START_WHISPER_VOICE.bat`

You should see:
```
🎤 Whisper Voice Server running on http://localhost:3002
```

### B. Test the Setup

Open `test-whisper.html` in your browser

1. Click "Test Server Connection" - should show ✅
2. Click "Start Recording"
3. Say "dashboard" or "settings"
4. Wait 3 seconds
5. See your transcript!

### C. Use in Your App

In `src/components/Layout/TopBar.tsx`, change line 2:

```typescript
// OLD:
import { useEnhancedVoiceNavigation } from '@/hooks/useEnhancedVoiceNavigation';

// NEW:
import { useWhisperVoiceNavigation as useEnhancedVoiceNavigation } from '@/hooks/useWhisperVoiceNavigation';
```

## That's It!

Now start your app and press SPACEBAR to use voice navigation!

## 🎯 Commands to Try

- "dashboard"
- "settings"
- "courses"
- "quiz"
- "assignments"
- "back"
- "scroll down"
- "help"

## ❓ Problems?

### Server won't start
- Make sure you downloaded the model file
- Check the path: `C:\Users\Downloads\whisper-bin-x64\models\ggml-base.en.bin`

### No transcription
- Grant microphone permission in browser
- Check server is running (green ✅ in test page)

### Want faster/more accurate?
See `WHISPER_VOICE_SETUP.md` for different model options

---

**Need help?** Check the full guide: `WHISPER_VOICE_SETUP.md`
