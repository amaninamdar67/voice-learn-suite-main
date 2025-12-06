# Ollama Troubleshooting Guide

## Error: "Failed to execute 'json' on 'Response'"

This error means Ollama is returning something that's not valid JSON.

### Causes & Solutions:

#### 1. Ollama is not running
**Check:**
```bash
# Windows/Mac/Linux
ollama list
```

**Fix:**
```bash
ollama serve
```

Keep this terminal open while using the app.

---

#### 2. Model is not installed
**Check:**
```bash
ollama list
```

You should see `deepseek-r1:1.5b` in the list.

**Fix:**
```bash
ollama pull deepseek-r1:1.5b
```

Wait for download to complete (2-5 minutes first time).

---

#### 3. Ollama is loading the model
**Symptom:** First request times out or fails

**Fix:** Wait 10-15 seconds and try again. The model loads into memory on first use.

---

#### 4. Port 11434 is blocked or in use
**Check (Windows):**
```bash
netstat -ano | findstr :11434
```

**Check (Mac/Linux):**
```bash
lsof -i :11434
```

**Fix:** 
- If something is using port 11434, kill it or use a different port
- Check firewall settings

---

#### 5. Ollama crashed or stopped
**Check:**
```bash
ollama list
```

If this fails, Ollama is not running.

**Fix:**
```bash
ollama serve
```

---

## Testing Ollama Directly

Run this to test if Ollama is working:

```bash
node test-ollama.js
```

You should see:
```
Testing Ollama connection...
Response status: 200
Raw response: {"model":"deepseek-r1:1.5b","created_at":"...","response":"...","done":true}
```

---

## Common Issues

### Issue: "Cannot connect to Ollama"
→ Ollama is not running on port 11434
→ Run: `ollama serve`

### Issue: "Model not found"
→ Model is not installed
→ Run: `ollama pull deepseek-r1:1.5b`

### Issue: "Unexpected end of JSON input"
→ Ollama returned invalid JSON
→ Check Ollama logs for errors
→ Restart Ollama: `ollama serve`

### Issue: "Timeout"
→ Model is loading (first request)
→ Wait 10-15 seconds and try again
→ Or increase timeout in backend/server.js

### Issue: "Out of memory"
→ Close other applications
→ Use smaller model: `ollama pull deepseek-r1:1b`

---

## Debugging Steps

1. **Verify Ollama is running:**
   ```bash
   ollama list
   ```

2. **Check model is installed:**
   ```bash
   ollama list | grep deepseek
   ```

3. **Test Ollama directly:**
   ```bash
   node test-ollama.js
   ```

4. **Check backend logs:**
   - Look for error messages in terminal where you ran `npm run dev`

5. **Check browser console:**
   - Open DevTools (F12)
   - Look for error messages in Console tab

---

## Quick Fixes

**Ollama not responding:**
```bash
# Stop Ollama (Ctrl+C in terminal)
# Wait 5 seconds
ollama serve
```

**Model seems broken:**
```bash
ollama rm deepseek-r1:1.5b
ollama pull deepseek-r1:1.5b
```

**Port conflict:**
```bash
# Find what's using port 11434
netstat -ano | findstr :11434

# Kill the process (Windows)
taskkill /PID <PID> /F
```

---

## Still Having Issues?

1. Check that `ollama serve` is running in a terminal
2. Verify model is installed: `ollama list`
3. Test directly: `node test-ollama.js`
4. Check backend logs for error messages
5. Restart everything:
   - Stop Ollama (Ctrl+C)
   - Stop app (Ctrl+C)
   - Start Ollama: `ollama serve`
   - Start app: `npm run dev`

---

## Performance Tips

- **First response is slow:** Normal - model loads into memory
- **Subsequent responses are faster:** Model stays loaded
- **Close other apps:** Free up RAM for better performance
- **Use GPU:** If available, Ollama uses it automatically

