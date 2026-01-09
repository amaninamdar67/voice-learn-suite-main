# Fix: "Unexpected token '<', '<!DOCTYPE'... is not valid JSON"

## What This Error Means

Your AI Tutor is receiving **HTML instead of JSON** from Ollama. This means Ollama is either:
- Not running
- Crashed
- Returning an error page

---

## Immediate Fix (Do This Now)

### Step 1: Stop Everything
```bash
# In terminal where backend is running:
Ctrl+C

# In terminal where Ollama is running:
Ctrl+C
```

### Step 2: Kill Any Stuck Processes

**Windows**:
```bash
taskkill /IM ollama.exe /F
taskkill /IM node.exe /F
```

**Mac/Linux**:
```bash
pkill ollama
pkill node
```

### Step 3: Wait 5 Seconds
```bash
# Just wait...
```

### Step 4: Start Ollama Fresh

**Windows**:
```bash
ollama serve
```

**Mac/Linux**:
```bash
ollama serve
```

**Expected output**:
```
time=2024-12-18T10:30:00.000Z level=INFO msg="Listening on 127.0.0.1:11434"
```

### Step 5: In New Terminal, Start Backend
```bash
npm run dev
```

**Expected output**:
```
Backend server running on http://localhost:3001
```

### Step 6: Test in Browser

1. Open http://localhost:3080/dashboard
2. Click 🤖 AI Tutor button
3. Type: "Hello"
4. Click Send
5. Check if it works

---

## If Still Not Working

### Test 1: Verify Ollama is Responding

```bash
# In another terminal:
curl http://localhost:11434/api/tags
```

**Expected response**:
```json
{
  "models": [
    {
      "name": "mistral:latest",
      "modified_at": "2024-12-18T10:00:00.000Z",
      "size": 4294967296,
      "digest": "..."
    }
  ]
}
```

**If you get HTML or error**:
- Ollama crashed
- Go back to Step 1 and restart

### Test 2: Test Model Directly

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral:latest",
    "prompt": "Say hello",
    "stream": false
  }'
```

**Expected response**:
```json
{
  "model": "mistral:latest",
  "created_at": "2024-12-18T10:00:00.000Z",
  "response": "Hello! How can I help you today?",
  "done": true,
  ...
}
```

**If you get HTML**:
- Model is not responding
- Try restarting Ollama

### Test 3: Check Model is Downloaded

```bash
ollama list
```

**Expected output**:
```
NAME              ID              SIZE      MODIFIED
mistral:latest    2dfb...         4.1 GB    2 minutes ago
```

**If no models shown**:
```bash
ollama pull mistral:latest
```

---

## Verify Fix Works

### In Browser Console (F12):

**Good logs** ✅:
```
[AI Chat] Processing request - Model: mistral:latest, Has Image: false
[AI Chat] Calling Ollama API with model: mistral:latest
[AI Chat] Raw response length: 245
[AI Chat] Response before sanitization: 245 chars
[AI Chat] Response after sanitization: 240 chars
[AI Chat] Final response: Hello! How can I help you today?
```

**Bad logs** ❌:
```
[AI Chat] Processing request - Model: mistral:latest, Has Image: false
[AI Chat] Calling Ollama API with model: mistral:latest
[Frontend] Failed to parse response: SyntaxError: Unexpected token '<'
[Frontend] API error: Ollama returned HTML instead of JSON
```

---

## If Still Getting HTML Error

### Option 1: Use Different Model

```bash
# Stop Ollama (Ctrl+C)

# Download different model
ollama pull neural-chat:latest

# Start Ollama again
ollama serve

# In AI Tutor, select neural-chat:latest from dropdown
```

### Option 2: Check Port Conflict

```bash
# Check if port 11434 is in use
# Windows:
netstat -ano | findstr :11434

# Mac/Linux:
lsof -i :11434

# If something is using it, kill it or restart Ollama
```

### Option 3: Restart Computer

Sometimes Ollama gets stuck. A full restart helps:

```bash
# Save your work
# Restart computer
# Start Ollama: ollama serve
# Start backend: npm run dev
# Test in browser
```

---

## Verify Everything is Working

Run this test script:

```bash
node test-ollama-connection.js
```

**Expected output**:
```
✅ Ollama is running!
✅ Found 1 model(s):
   • mistral:latest
✅ Text generation works!
   Response: "Hello"
✅ All tests completed!
```

---

## Summary

The error "Unexpected token '<', '<!DOCTYPE'" means Ollama is not responding correctly.

**Quick fix**:
1. Stop Ollama (Ctrl+C)
2. Stop Backend (Ctrl+C)
3. Wait 5 seconds
4. Start Ollama: `ollama serve`
5. Start Backend: `npm run dev`
6. Test in browser

**If still broken**:
1. Run: `node test-ollama-connection.js`
2. Check output for specific error
3. Follow the troubleshooting guide

---

## Need More Help?

Check: `AI_TUTOR_TROUBLESHOOTING_GUIDE.md`

