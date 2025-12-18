# ✅ Alan AI Setup Checklist

## Pre-Setup (Already Done ✅)
- [x] Backed up Web Speech API code to `src/backup-web-speech-api/`
- [x] Installed `@alan-ai/alan-sdk-web` package
- [x] Created `useAlanAI` hook
- [x] Updated MainLayout.tsx
- [x] Simplified TopBar.tsx
- [x] Added .env placeholder
- [x] Created documentation

## Your Setup Tasks (5 minutes)

### ☐ Step 1: Create Alan AI Account (2 min)
1. [ ] Go to https://alan.app/
2. [ ] Click "Sign Up" (use Google/GitHub for faster signup)
3. [ ] Verify email if needed
4. [ ] Log in to Alan Studio

### ☐ Step 2: Create Project (30 sec)
1. [ ] Click "+ New Project"
2. [ ] Name: "Voice Learn Suite"
3. [ ] Click "Create"

### ☐ Step 3: Get SDK Key (30 sec)
1. [ ] Click on your project
2. [ ] Go to "Integrations" tab
3. [ ] Copy the SDK Key (long string)

### ☐ Step 4: Add Key to .env (30 sec)
1. [ ] Open `.env` file in your project
2. [ ] Find line: `VITE_ALAN_SDK_KEY=your_alan_sdk_key_here`
3. [ ] Replace with: `VITE_ALAN_SDK_KEY=your_actual_key`
4. [ ] Save file

### ☐ Step 5: Configure Voice Commands (1 min)
1. [ ] In Alan Studio, click "Scripts" tab
2. [ ] Delete all default code
3. [ ] Copy script from below
4. [ ] Paste into editor
5. [ ] Click "Save" (top right)

**Script to copy:**
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

### ☐ Step 6: Test (1 min)
1. [ ] Open terminal
2. [ ] Run: `npm run dev`
3. [ ] Open browser to localhost:5173
4. [ ] Look for blue Alan button (bottom right)
5. [ ] Click button
6. [ ] Say: "go to dashboard"
7. [ ] Should navigate! ✅

## Verification Checklist

### ☐ Visual Check
- [ ] Alan button visible (bottom right corner)
- [ ] Button is blue circle with microphone icon
- [ ] No voice controls in TopBar (clean UI)

### ☐ Functionality Check
- [ ] Click Alan button → turns red
- [ ] "Listening..." indicator appears
- [ ] Say "go to dashboard" → navigates
- [ ] Say "open lessons" → navigates
- [ ] Say "help" → Alan responds

### ☐ Browser Console Check
- [ ] No errors about missing SDK key
- [ ] No Web Speech API errors
- [ ] Alan commands logged when spoken

## Test Commands

Try these to verify everything works:

### English Commands:
- [ ] "Go to dashboard"
- [ ] "Open lessons"
- [ ] "Open videos"
- [ ] "Open settings"
- [ ] "Open quizzes"

### Hindi Commands:
- [ ] "Dashboard kholo"
- [ ] "Lessons kholo"

### Help:
- [ ] "Help"

## Troubleshooting

### Problem: No Alan button visible
**Solution:**
1. [ ] Check .env has correct SDK key
2. [ ] Restart dev server: `npm run dev`
3. [ ] Check browser console for errors
4. [ ] Clear browser cache

### Problem: Button visible but not working
**Solution:**
1. [ ] Click button to activate
2. [ ] Allow microphone permissions
3. [ ] Check Alan Studio script is saved
4. [ ] Try saying "help"

### Problem: Commands not recognized
**Solution:**
1. [ ] Speak clearly and slowly
2. [ ] Use exact commands: "go to dashboard"
3. [ ] Check Alan Studio script matches above
4. [ ] Try refreshing page

## Success Criteria

You're done when:
- [x] Alan button visible bottom right
- [x] Button responds to clicks
- [x] Voice commands navigate correctly
- [x] No console errors
- [x] Hindi commands work
- [x] Help command responds

## Usage Tracking

Check your usage in Alan Studio:
- Dashboard → Interactions
- Free tier: 5000/month
- Current usage: _____ / 5000

## Next Steps After Setup

Once working:
1. [ ] Test with students
2. [ ] Monitor usage in Alan Studio
3. [ ] Add more commands if needed
4. [ ] Consider paid plan if usage high

## Support Resources

- **Quick Start:** `START_HERE_ALAN_AI.md`
- **Visual Guide:** `ALAN_AI_VISUAL_GUIDE.md`
- **Full Guide:** `ALAN_AI_SETUP_GUIDE.md`
- **Alan Docs:** https://alan.app/docs
- **Alan Dashboard:** https://alan.app/

---

## 🎉 Ready to Start?

Follow the checklist above. Should take 5 minutes total!

**Current Status:** Code ready ✅ | SDK key needed ⏳
