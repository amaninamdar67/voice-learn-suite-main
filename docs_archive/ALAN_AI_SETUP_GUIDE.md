# Alan AI Setup Guide

## Step 1: Create Alan AI Account

1. Go to https://alan.app/
2. Sign up for free account
3. Create a new project
4. Copy your SDK Key (looks like: `abc123def456...`)

## Step 2: Add SDK Key to .env

Add this line to your `.env` file:
```
VITE_ALAN_SDK_KEY=your_sdk_key_here
```

## Step 3: Configure Voice Commands in Alan Studio

In Alan Studio (alan.app dashboard), add this script:

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

// Sidebar toggle
intent('Toggle sidebar', p => {
    p.play({command: 'toggleSidebar'});
});

intent('Sidebar $(ACTION open|close)', p => {
    p.play({command: p.ACTION.value === 'open' ? 'openSidebar' : 'closeSidebar'});
});

// Reading content
intent('Read this page', p => {
    p.play({command: 'readPage'});
});

intent('Stop reading', p => {
    p.play({command: 'stopReading'});
});

// Help
intent('What can you do', p => {
    p.play('I can help you navigate. Say "go to dashboard", "open settings", or "read this page"');
});

intent('Help', p => {
    p.play('Try saying: go to dashboard, open lessons, toggle sidebar, or read this page');
});
```

## Step 4: Usage Limits

- Free tier: 5000 interactions/month
- If you hit the limit, you can create a new account (use different email)
- Or upgrade to paid plan ($99/month for 50k interactions)

## Step 5: Testing

1. Start your app: `npm run dev`
2. Look for Alan AI button (bottom right)
3. Click and say: "go to dashboard"
4. Should navigate automatically

## Backup Location

Your old Web Speech API code is backed up in:
`src/backup-web-speech-api/`

You can restore it anytime if needed.
