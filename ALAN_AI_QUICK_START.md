# Alan AI Quick Start - 5 Minutes Setup

## ✅ What We Did:
1. ✅ Backed up your Web Speech API code to `src/backup-web-speech-api/`
2. ✅ Installed Alan AI SDK (`@alan-ai/alan-sdk-web`)
3. ✅ Replaced voice navigation with Alan AI
4. ✅ Removed all buggy Web Speech API controls

## 🚀 Setup Steps (5 minutes):

### Step 1: Create Alan AI Account (2 min)
1. Go to https://alan.app/
2. Click "Sign Up" (use Google/GitHub for faster signup)
3. Create a new project (name it "Voice Learn Suite")

### Step 2: Get Your SDK Key (1 min)
1. In Alan Studio dashboard, click your project
2. Click "Integrations" tab
3. Copy the SDK Key (looks like: `abc123def456...`)

### Step 3: Add Key to .env (30 seconds)
Open `.env` file and replace:
```
VITE_ALAN_SDK_KEY=your_alan_sdk_key_here
```
With your actual key:
```
VITE_ALAN_SDK_KEY=abc123def456...
```

### Step 4: Configure Voice Commands in Alan Studio (1.5 min)
1. In Alan Studio, click "Scripts" tab
2. Delete the default code
3. Paste this script:

```javascript
// Navigation commands
intent('Go to $(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile)', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

intent('Open $(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile)', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

// Hindi navigation
intent('$(PAGE dashboard|settings|lessons|videos|quizzes|assignments|community|profile) kholo', p => {
    p.play({command: 'navigate', page: p.PAGE.value});
});

// Help
intent('What can you do', p => {
    p.play('I can help you navigate. Say go to dashboard, open settings, or open lessons');
});

intent('Help', p => {
    p.play('Try saying: go to dashboard, open lessons, or open videos');
});
```

4. Click "Save" (top right)

### Step 5: Test It! (30 seconds)
1. Run: `npm run dev`
2. Look for Alan AI button (bottom right corner)
3. Click the button and say: **"go to dashboard"**
4. Should navigate automatically!

## 🎤 Voice Commands You Can Use:
- "Go to dashboard"
- "Open lessons"
- "Open videos"
- "Go to settings"
- "Open quizzes"
- "Dashboard kholo" (Hindi)
- "Help"

## 📊 Usage Limits:
- **Free tier:** 5000 interactions/month
- **For 20 students:** ~250 commands each (plenty!)
- **If you hit limit:** Create new account with different email
- **Paid plan:** $99/month for 50,000 interactions

## 🔄 Want Your Old System Back?
All your Web Speech API code is backed up in:
```
src/backup-web-speech-api/
```

Just copy the files back if needed.

## 🐛 Troubleshooting:

**Alan button not showing?**
- Check .env has correct SDK key
- Restart dev server: `npm run dev`
- Check browser console for errors

**Voice not working?**
- Click the Alan button first
- Allow microphone permissions
- Check Alan Studio script is saved

**Commands not recognized?**
- Speak clearly: "go to dashboard"
- Check Alan Studio script matches above
- Try: "help" to test if Alan is listening

## 🎉 Benefits Over Web Speech API:
- ✅ No more abort errors
- ✅ No mic staying on issues
- ✅ No feedback loops
- ✅ Natural language understanding
- ✅ Better echo cancellation
- ✅ Works in all browsers
- ✅ Professional voice responses

Enjoy your bug-free voice navigation! 🚀
