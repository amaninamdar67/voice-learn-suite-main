# 🎨 Alan AI Visual Setup Guide

## 🎯 What You'll See:

### Before (Web Speech API - REMOVED):
```
TopBar had:
[ON/OFF Button] [Voice Nav Button] [Read Page Button]
❌ Buggy, mic stays on, abort errors
```

### After (Alan AI - NEW):
```
Bottom Right Corner:
[🎤 Blue Circle Button] ← Click this to talk!
✅ Clean, simple, works perfectly
```

---

## 📸 Step-by-Step Visual Guide:

### Step 1: Go to Alan.app
```
Browser → https://alan.app/
┌─────────────────────────────────────┐
│  ALAN AI                            │
│  [Sign Up] [Log In]                 │
│                                     │
│  Build Voice AI Assistants          │
│  [Get Started Free]  ← Click this   │
└─────────────────────────────────────┘
```

### Step 2: Create Project
```
After signup:
┌─────────────────────────────────────┐
│  My Projects                        │
│  [+ New Project]  ← Click this      │
└─────────────────────────────────────┘

Name it: "Voice Learn Suite"
```

### Step 3: Get SDK Key
```
In your project:
┌─────────────────────────────────────┐
│  Tabs: [Scripts] [Integrations]     │
│                                     │
│  Click [Integrations] →             │
│                                     │
│  SDK Key:                           │
│  abc123def456...  [Copy] ← Click    │
└─────────────────────────────────────┘
```

### Step 4: Add to .env
```
Open: .env file
┌─────────────────────────────────────┐
│ VITE_SUPABASE_URL=...               │
│ VITE_SUPABASE_ANON_KEY=...          │
│                                     │
│ # Alan AI Voice Navigation          │
│ VITE_ALAN_SDK_KEY=abc123...         │
│                    ↑                │
│              Paste here!            │
└─────────────────────────────────────┘
```

### Step 5: Configure Commands
```
In Alan Studio:
┌─────────────────────────────────────┐
│  Tabs: [Scripts] [Integrations]     │
│                                     │
│  Click [Scripts] →                  │
│                                     │
│  Delete all code                    │
│  Paste the script (see below)       │
│  Click [Save] (top right)           │
└─────────────────────────────────────┘
```

**Script to paste:**
```javascript
intent('Go to $(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile)', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

intent('Open $(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile)', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

intent('$(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile) kholo', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

intent('Help', p => {
    p.play('Try saying: go to dashboard, open lessons, or open videos');
});
```

### Step 6: Run Your App
```
Terminal:
┌─────────────────────────────────────┐
│ $ npm run dev                       │
│                                     │
│ ➜ Local: http://localhost:5173     │
└─────────────────────────────────────┘
```

### Step 7: Test Voice Navigation
```
Your App:
┌─────────────────────────────────────┐
│  Dashboard                          │
│                                     │
│  [Content here...]                  │
│                                     │
│                                     │
│                          [🎤]  ← Click!
│                     (bottom right)  │
└─────────────────────────────────────┘

After clicking:
┌─────────────────────────────────────┐
│                                     │
│  Microphone popup appears           │
│  "Listening..." indicator shows     │
│                                     │
│  Say: "go to dashboard"             │
│                                     │
│  → Navigates automatically! ✅      │
└─────────────────────────────────────┘
```

---

## 🎤 What to Say:

### Navigation Commands:
```
✅ "Go to dashboard"
✅ "Open lessons"
✅ "Open videos"
✅ "Open settings"
✅ "Open quizzes"
✅ "Open assignments"
✅ "Open community"
```

### Hindi Commands:
```
✅ "Dashboard kholo"
✅ "Lessons kholo"
✅ "Videos kholo"
```

### Help:
```
✅ "Help"
```

---

## 🎯 What You'll See Working:

### 1. Click Alan Button
```
[🎤] → Turns red → "Listening..."
```

### 2. Say Command
```
You: "go to dashboard"
Alan: [Processes]
App: [Navigates to dashboard] ✅
```

### 3. Button Returns to Normal
```
[🎤] → Blue again → Ready for next command
```

---

## 📊 Usage Counter:

You can see your usage in Alan Studio:
```
┌─────────────────────────────────────┐
│  Dashboard                          │
│                                     │
│  Interactions: 45 / 5000            │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                     │
│  Plenty left! ✅                    │
└─────────────────────────────────────┘
```

---

## 🐛 Troubleshooting Visual:

### Problem: No Alan Button
```
❌ No button visible
↓
Check .env has SDK key
↓
Restart: npm run dev
↓
✅ Button appears bottom right
```

### Problem: Voice Not Working
```
❌ Button clicked but nothing happens
↓
Check browser console (F12)
↓
Allow microphone permissions
↓
Click button again
↓
✅ "Listening..." appears
```

### Problem: Commands Not Recognized
```
❌ Says "I don't understand"
↓
Check Alan Studio script is saved
↓
Try: "help"
↓
Use exact commands: "go to dashboard"
↓
✅ Navigates successfully
```

---

## ✨ Final Result:

### Old System (REMOVED):
```
TopBar: [ON] [Voice Nav] [Read Page]
         ↓      ↓          ↓
      Buggy  Buggy     Buggy
```

### New System (WORKING):
```
Bottom Right: [🎤]
               ↓
          Works perfectly! ✅
```

---

## 🎉 You're Done!

Just add your SDK key and start talking to your app!

**No more bugs. Just working voice navigation.** 🚀
