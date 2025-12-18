# AI Tutor - Troubleshooting Guide

## Error: "Unexpected token '<', '<!DOCTYPE'... is not valid JSON"

This error means **Ollama is returning HTML instead of JSON**. This typically happens when:

1. **Ollama is not running** ❌
2. **Ollama is running on wrong port** ❌
3. **Ollama crashed or is unresponsive** ❌
4. **Firewall/proxy is blocking the connection** ❌

---

## Quick Fix (5 minutes)

### Step 1: Verify Ollama is Running

**Windows**:
```bash
# Check if Ollama process is running
tasklist | findstr ollama

# If not running, start it:
ollama serve
```

**Mac/Linux**:
```bash
# Check if Ollama is running
ps aux | grep ollama

# If not running, start it:
ollama serve
```

### Step 2: Test Ollama Connection

```bash
# Run the test script
node test-ollama-connection.js
```

**Expected output**:
```
✅ Ollama is running!
✅ Found 1 model(s):
   • mistral:latest
✅ Text generation works!
   Response: "Hello"
```

### Step 3: Restart Backend

```bash
# Kill current backend (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test in Browser

1. Open AI Tutor (🤖 icon)
2. Type: "Hello"
3. Click Send
4. Check browser console (F12) for logs

---

## Detailed Troubleshooting

### Issue 1: "Cannot connect to Ollama on port 11434"

**Cause**: Ollama is not running or running on different port

**Solution**:
```bash
# Start Ollama
ollama serve

# Check if it's running on port 11434
curl http://localhost:11434/api/tags

# If you get a response, Ollama is working
```

**If curl fails**:
- Ollama is not running
- Ollama is running on different port
- Firewall is blocking port 11434

---

### Issue 2: "No models found"

**Cause**: Ollama is running but no models are downloaded

**Solution**:
```bash
# Download a model
ollama pull mistral:latest

# Verify it's downloaded
ollama list

# Should show:
# NAME              ID              SIZE      MODIFIED
# mistral:latest    2dfb...         4.1 GB    2 minutes ago
```

---

### Issue 3: "Ollama returned HTML instead of JSON"

**Cause**: Ollama crashed or is returning error page

**Solution**:
```bash
# Kill Ollama
pkill ollama  # Mac/Linux
taskkill /IM ollama.exe /F  # Windows

# Wait 2 seconds
sleep 2

# Restart Ollama
ollama serve

# Check logs for errors
```

---

### Issue 4: "Request timeout - Ollama is taking too long"

**Cause**: 
- Model is too large for your hardware
- Ollama is overloaded
- System is out of RAM

**Solution**:
```bash
# Try a smaller model
ollama pull mistral:7b

# Or use the fastest model
ollama pull neural-chat:latest

# Check system resources
# Windows: Task Manager
# Mac: Activity Monitor
# Linux: top
```

---

### Issue 5: "Model not found" error

**Cause**: Selected model is not downloaded

**Solution**:
```bash
# List available models
ollama list

# Download missing model
ollama pull llava:7b
ollama pull deepseek-r1:1.5b

# Verify
ollama list
```

---

## Browser Console Logs

### What to look for

**Good logs** ✅:
```
[AI Chat] Processing request - Model: mistral:latest, Has Image: false
[AI Chat] Calling Ollama API with model: mistral:latest
[AI Chat] Raw response length: 245
[AI Chat] Response before sanitization: 245 chars
[AI Chat] Response after sanitization: 240 chars
[AI Chat] Final response: The capital of France is Paris...
```

**Bad logs** ❌:
```
[AI Chat] Processing request - Model: mistral:latest, Has Image: false
[AI Chat] Calling Ollama API with model: mistral:latest
[Frontend] Failed to parse response: SyntaxError: Unexpected token '<'
[Frontend] API error: Ollama returned HTML instead of JSON
```

---

## Backend Console Logs

### What to look for

**Good logs** ✅:
```
[AI Chat] Processing request - Model: mistral:latest, Has Image: false
[AI Chat] Calling Ollama API with model: mistral:latest
[AI Chat] Raw response length: 245
[AI Chat] Response before sanitization: 245 chars
[AI Chat] Response after sanitization: 240 chars
[AI Chat] Final response: The capital of France is Paris...
```

**Bad logs** ❌:
```
[AI Chat] Processing request - Model: mistral:latest, Has Image: false
[AI Chat] Calling Ollama API with model: mistral:latest
[AI Chat] Ollama is not responding
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| HTML instead of JSON | Ollama not running | `ollama serve` |
| No models found | Models not downloaded | `ollama pull mistral:latest` |
| Timeout error | Model too large | Use smaller model |
| Connection refused | Wrong port | Check port 11434 |
| Empty response | Model error | Try different model |
| Image not analyzed | LLaVA not downloaded | `ollama pull llava:7b` |

---

## Step-by-Step Debugging

### Step 1: Verify Ollama is Running
```bash
curl http://localhost:11434/api/tags
```
Should return JSON with models list.

### Step 2: Verify Model is Downloaded
```bash
ollama list
```
Should show at least one model.

### Step 3: Test Model Directly
```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral:latest",
    "prompt": "Hello",
    "stream": false
  }'
```
Should return JSON with response field.

### Step 4: Check Backend Logs
```bash
# In terminal where backend is running
# Look for [AI Chat] logs
```

### Step 5: Check Browser Logs
```bash
# Press F12 to open DevTools
# Go to Console tab
# Look for [AI Chat] and [Frontend] logs
```

---

## Performance Optimization

### If responses are slow:

1. **Use faster model**:
   ```bash
   ollama pull neural-chat:latest
   ```

2. **Reduce response length**:
   - Backend already set to 512 tokens (reduced from 1024)

3. **Check system resources**:
   - Ensure 8GB+ RAM available
   - Close other applications
   - Check disk space (models need 4-10GB)

### If responses are inaccurate:

1. **Use more capable model**:
   ```bash
   ollama pull deepseek-r1:1.5b
   ```

2. **Provide more context** in your question

3. **Use image analysis** for visual problems

---

## Port Conflicts

If port 11434 is already in use:

```bash
# Find what's using port 11434
# Windows:
netstat -ano | findstr :11434

# Mac/Linux:
lsof -i :11434

# Kill the process and restart Ollama
```

---

## Firewall Issues

If you're behind a firewall:

1. **Allow port 11434** in firewall settings
2. **Check proxy settings** - Ollama may need proxy configuration
3. **Try localhost only** - Ollama should work on localhost

---

## Database Issues

If sessions are not saving:

1. **Check Supabase connection**:
   - Verify `SUPABASE_URL` in `.env`
   - Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env`

2. **Check database tables**:
   - `ai_tutor_sessions` should exist
   - `ai_tutor_messages` should exist

3. **Check RLS policies**:
   - Users should be able to access their own sessions

---

## Getting Help

When reporting issues, include:

1. **Browser console logs** (F12 → Console)
2. **Backend console logs** (where `npm run dev` is running)
3. **Ollama status** (`ollama list`)
4. **System info** (OS, RAM, disk space)
5. **Steps to reproduce** the issue

---

## Quick Commands Reference

```bash
# Start Ollama
ollama serve

# List models
ollama list

# Download model
ollama pull mistral:latest
ollama pull llava:7b
ollama pull deepseek-r1:1.5b

# Test Ollama
node test-ollama-connection.js

# Restart backend
npm run dev

# Check Ollama health
curl http://localhost:11434/api/tags

# Kill Ollama (if stuck)
pkill ollama  # Mac/Linux
taskkill /IM ollama.exe /F  # Windows
```

---

## Still Not Working?

1. **Restart everything**:
   ```bash
   # Kill Ollama
   pkill ollama
   
   # Kill backend (Ctrl+C)
   
   # Wait 5 seconds
   
   # Start Ollama
   ollama serve
   
   # In new terminal, start backend
   npm run dev
   ```

2. **Clear browser cache**:
   - Press Ctrl+Shift+Delete
   - Clear all data
   - Reload page

3. **Check logs carefully**:
   - Look for exact error message
   - Search this guide for that error
   - Follow the solution

4. **Try test script**:
   ```bash
   node test-ollama-connection.js
   ```

5. **Try different model**:
   - Download: `ollama pull neural-chat:latest`
   - Select from dropdown in AI Tutor
   - Test again

