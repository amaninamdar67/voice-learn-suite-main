# 🎤 START HERE - Alan AI Voice Navigation Setup

## ✅ What's Done:
Your Web Speech API has been **completely replaced** with Alan AI. All buggy code is backed up.

## 🚀 5-Minute Setup:

### Step 1: Create Alan AI Account
1. Open: https://alan.app/
2. Click "Sign Up" (use Google for fastest signup)
3. Create a new project (name: "Voice Learn Suite")

### Step 2: Get SDK Key
1. In Alan Studio, click your project
2. Go to "Integrations" tab
3. Copy the SDK Key (long string like: `abc123...`)

### Step 3: Add Key to .env
Open `.env` file and replace this line:
```
VITE_ALAN_SDK_KEY=your_alan_sdk_key_here
```

With your actual key:
```
VITE_ALAN_SDK_KEY=paste_your_key_here
```

### Step 4: Configure Voice Commands
1. In Alan Studio, click "Scripts" tab
2. Delete all default code
3. Paste this:

```javascript
// Navigation commands
intent('Go to $(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile)', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

intent('Open $(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile)', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

// Hindi support
intent('$(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile) kholo', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

// Help
intent('Help', p => {
    p.play('Try saying: go to dashboard, open lessons, or open videos');
});
```

4. Click "Save" (top right)

### Step 5: Run Your App
```bash
npm run dev
```

### Step 6: Test Voice Navigation
1. Look for **Alan AI button** (bottom right corner - blue circle)
2. Click the button
3. Say: **"go to dashboard"**
4. Should navigate automatically! 🎉

## 🎤 Voice Commands:
- "Go to dashboard"
- "Open lessons"
- "Open videos"
- "Open settings"
- "Open quizzes"
- "Open assignments"
- "Open community"
- "Dashboard kholo" (Hindi)
- "Help"

## 📊 Free Tier Limits:
- **5000 interactions/month**
- For 20 students = 250 commands each
- If you hit limit: Create new account with different email
- Paid plan: $99/month for 50k interactions

## 🐛 Troubleshooting:

### Alan button not showing?
```bash
# Check console for warnings
# Make sure .env has correct key
# Restart dev server
```

### Voice not working?
- Click Alan button first
- Allow microphone permissions in browser
- Speak clearly: "go to dashboard"

### Commands not recognized?
- Check Alan Studio script is saved
- Try: "help" to test
- Speak exact commands: "go to dashboard" not "take me to dashboard"

## 🎯 What You Get:
✅ No more Web Speech API bugs  
✅ No abort errors  
✅ No mic staying on issues  
✅ No feedback loops  
✅ Natural language understanding  
✅ Professional voice responses  
✅ Works in all browsers  
✅ Better echo cancellation  

## 📁 Backup Location:
Your old code is safe in: `src/backup-web-speech-api/`

## 🔗 Resources:
- Alan AI Dashboard: https://alan.app/
- Alan AI Docs: https://alan.app/docs
- Quick Start Guide: `ALAN_AI_QUICK_START.md`
- Full Setup Guide: `ALAN_AI_SETUP_GUIDE.md`

---

**Ready to go!** Just add your SDK key and start testing. 🚀
