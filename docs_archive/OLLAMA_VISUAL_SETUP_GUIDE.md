# Ollama Setup - Visual Guide

## Step 1: Download Ollama

```
Visit: https://ollama.ai
         ↓
    Click "Download"
         ↓
    Choose your OS (Windows/Mac/Linux)
         ↓
    Run the installer
         ↓
    Restart your computer
```

---

## Step 2: Verify Installation

### Windows:
```
Open Command Prompt
         ↓
Type: ollama --version
         ↓
You should see: ollama version 0.1.0 (or similar)
```

### Mac/Linux:
```
Open Terminal
         ↓
Type: ollama --version
         ↓
You should see: ollama version 0.1.0 (or similar)
```

---

## Step 3: Start Ollama

### Windows (Easiest):
```
Project Root Folder
         ↓
Find: START_DEEPSEEK_OLLAMA.bat
         ↓
Double-click it
         ↓
Command window opens
         ↓
Wait for: "Ollama service running on port 11434"
         ↓
Keep window open ✓
```

### Mac/Linux:
```
Open Terminal
         ↓
Type: ollama pull deepseek-r1:1.5b
         ↓
Wait for download (2-5 minutes first time)
         ↓
Type: ollama serve
         ↓
Wait for: "Ollama service running"
         ↓
Keep terminal open ✓
```

---

## Step 4: Start Your Application

```
Open another Command Prompt/Terminal
         ↓
Navigate to project folder
         ↓
Type: npm run dev
         ↓
Application starts on http://localhost:5173
```

---

## Step 5: Use AI Tutor

```
Application is running
         ↓
Look for 🤖 button (bottom-right corner)
         ↓
Click it
         ↓
AI Tutor opens
         ↓
Type your question
         ↓
Click Send or press Enter
         ↓
Get AI response! ✓
```

---

## What's Happening Behind the Scenes

```
You type a question
         ↓
Frontend sends to: http://localhost:3001/api/ai-tutor/chat
         ↓
Backend receives message
         ↓
Backend sends to: http://localhost:11434/api/generate
         ↓
Ollama (running locally) processes with DeepSeek model
         ↓
Ollama returns response
         ↓
Backend sends response back to frontend
         ↓
You see the answer! ✓
```

---

## File Structure

```
Your Project
├── START_DEEPSEEK_OLLAMA.bat          ← Windows: Double-click this
├── OLLAMA_SETUP_INSTRUCTIONS.md       ← Detailed guide
├── AI_TUTOR_QUICK_START.md            ← Quick reference
├── AI_TUTOR_SETUP_SUMMARY.txt         ← This summary
├── backend/
│   └── server.js                      ← API endpoints
└── src/
    └── components/
        └── AITutor/
            └── AITutorEnhanced.tsx    ← Frontend component
```

---

## Ports Used

```
Your Application:     http://localhost:5173
Backend Server:       http://localhost:3001
Ollama Service:       http://localhost:11434
```

Make sure these ports are not blocked by your firewall!

---

## First Time Setup Timeline

```
1. Download Ollama:           5 minutes
2. Install Ollama:            2 minutes
3. Restart computer:          1 minute
4. Run START_DEEPSEEK_OLLAMA: 2-5 minutes (downloads model)
5. Start application:         1 minute
6. First AI response:         5-10 seconds (model loads)
7. Subsequent responses:      2-5 seconds

Total: ~20-30 minutes first time
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to Ollama"
```
Problem: Ollama not running
Solution: 
  Windows → Double-click START_DEEPSEEK_OLLAMA.bat
  Mac/Linux → Run: ollama serve
```

### Issue: "Model not found"
```
Problem: Model downloading
Solution: Wait 2-5 minutes for download to complete
```

### Issue: "Out of memory"
```
Problem: Not enough RAM
Solution: 
  1. Close other applications
  2. Use smaller model: deepseek-r1:1b
  3. Update backend/server.js line ~1040
```

### Issue: Very slow responses
```
Problem: Normal for local AI
Solution: 
  1. First response is slower (model loads)
  2. Subsequent responses are faster
  3. Close other apps to free RAM
```

---

## Checking Status

### Is Ollama running?

**Windows:**
```
Look for the command window with "Ollama service running"
OR
Open Command Prompt and type: ollama list
```

**Mac/Linux:**
```
Look for the terminal with "Ollama service running"
OR
Open Terminal and type: ollama list
```

### Is the backend running?

```
Check terminal where you ran: npm run dev
Should show: "Backend server running on http://localhost:3001"
```

### Is the application running?

```
Open browser and go to: http://localhost:5173
Should see your application
```

---

## Performance Tips

1. **Keep Ollama running** - Don't close the service window
2. **Close other apps** - Free up RAM for better performance
3. **First response is slow** - Model loads into memory
4. **Subsequent responses are faster** - Model stays loaded
5. **Use GPU** - If available, Ollama uses it automatically

---

## Next Steps

1. ✓ Install Ollama
2. ✓ Run START_DEEPSEEK_OLLAMA.bat (Windows) or ollama serve (Mac/Linux)
3. ✓ Run npm run dev
4. ✓ Click 🤖 button
5. ✓ Start chatting!

---

## Need Help?

- **Ollama Issues**: https://github.com/ollama/ollama
- **DeepSeek Models**: https://huggingface.co/deepseek-ai
- **Model Library**: https://ollama.ai/library

Enjoy your AI Tutor! 🚀

