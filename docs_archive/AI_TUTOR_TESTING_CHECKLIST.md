# AI Tutor - Testing Checklist

## Pre-Testing Setup
- [ ] Backend server restarted (`npm run dev`)
- [ ] Ollama running (`ollama serve`)
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible
- [ ] Logged in as Student/Teacher/Mentor/Admin (NOT Parent)

---

## Test 1: Auto-Send Voice Input (2-Second Silence)

**Steps**:
1. [ ] Click AI Tutor button (🤖 icon)
2. [ ] Click microphone button (should turn red)
3. [ ] Speak clearly: "What is photosynthesis?"
4. [ ] Stop speaking and wait 2 seconds
5. [ ] Message should auto-send

**Expected Results**:
- [ ] Microphone button shows active state (red)
- [ ] Console shows `[Auto-Send] Event received`
- [ ] Console shows `[Auto-Send] Triggering send with: What is photosynthesis?`
- [ ] Message appears in chat
- [ ] AI response appears after processing

**If Failed**:
- [ ] Check console for `[Auto-Send]` logs
- [ ] Check if microphone is working (interim results showing?)
- [ ] Check if 2-second timer is firing
- [ ] Verify `inputValueRef.current` has the message

---

## Test 2: Manual Send (Text Input)

**Steps**:
1. [ ] Type in text input: "Explain quantum computing"
2. [ ] Press Enter or click Send button
3. [ ] Wait for response

**Expected Results**:
- [ ] Message appears in chat
- [ ] AI response appears
- [ ] No JSON parse errors in console
- [ ] Response is properly formatted

**If Failed**:
- [ ] Check for `[AI Chat]` logs in backend console
- [ ] Check for JSON parse errors
- [ ] Verify model is selected

---

## Test 3: New Session Creation

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Send a message (text or voice)
3. [ ] Check "Recent" sidebar (click 📋 Recent button)
4. [ ] New session should appear in list

**Expected Results**:
- [ ] Console shows `[AI Tutor] Creating new session with auth header`
- [ ] Console shows `[Sessions] Creating new session for user: {userId}`
- [ ] Console shows `[Sessions] Session created successfully: {sessionId}`
- [ ] Session appears in Recent sidebar with timestamp
- [ ] Session title is first 50 chars of message

**If Failed**:
- [ ] Check for `[Auth]` logs - is token being sent?
- [ ] Check for `[Sessions]` logs - is session being created?
- [ ] Check backend console for errors
- [ ] Verify database tables exist: `ai_tutor_sessions`, `ai_tutor_messages`

---

## Test 4: Load Previous Session

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Click 📋 Recent button
3. [ ] Click on a previous session
4. [ ] Previous messages should load

**Expected Results**:
- [ ] Session is highlighted in sidebar
- [ ] All previous messages appear in chat
- [ ] Messages are in correct order (oldest first)
- [ ] User and AI messages are properly labeled

**If Failed**:
- [ ] Check console for session load errors
- [ ] Verify session ID is being passed correctly
- [ ] Check if messages are being fetched from database

---

## Test 5: Create New Session from Sidebar

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Click 📋 Recent button
3. [ ] Click "+ New" button in sidebar header
4. [ ] Chat should clear
5. [ ] Send a message

**Expected Results**:
- [ ] Chat clears
- [ ] New session is created
- [ ] Message is sent to new session
- [ ] New session appears in sidebar

**If Failed**:
- [ ] Check console for session creation errors
- [ ] Verify "+ New" button is calling `createNewSession()`

---

## Test 6: Image Upload and Auto-Model Switch

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Click image upload button (📷 icon)
3. [ ] Select an image file
4. [ ] Model selector should change to `llava:7b`
5. [ ] Type a question: "What's in this image?"
6. [ ] Send message

**Expected Results**:
- [ ] Image preview appears below input
- [ ] Model selector shows `llava:7b`
- [ ] Image is sent with message
- [ ] AI analyzes image and responds
- [ ] Response is properly formatted

**If Failed**:
- [ ] Check if LLaVA model is downloaded: `ollama list`
- [ ] Check console for `[AI Chat] Image data length:`
- [ ] Check for JSON parse errors
- [ ] Verify image is being encoded as base64

---

## Test 7: Auto-Speech (Hindi Voice Output)

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Verify speaker icon is green (auto-speech ON)
3. [ ] Send a message
4. [ ] Wait for AI response
5. [ ] Response should be read aloud in Hindi

**Expected Results**:
- [ ] Speaker icon is green by default
- [ ] AI response is automatically read in Hindi
- [ ] Audio plays without manual button click
- [ ] Can click "Read (Hindi)" to replay

**If Failed**:
- [ ] Check browser audio permissions
- [ ] Verify speaker is not muted
- [ ] Check if Hindi voice is available on system
- [ ] Try clicking "Read (Hindi)" button manually

---

## Test 8: Fullscreen Mode

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Click expand button (⛶ icon)
3. [ ] Chat should fill entire screen
4. [ ] Click minimize button to exit fullscreen

**Expected Results**:
- [ ] Chat expands to full screen
- [ ] No borders or constraints
- [ ] All buttons still functional
- [ ] Can minimize back to normal view

**If Failed**:
- [ ] Check CSS for fullscreen styling
- [ ] Verify expand/minimize buttons are working

---

## Test 9: Recent Sessions Sidebar

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Create 3-4 different sessions with messages
3. [ ] Click 📋 Recent button
4. [ ] Sidebar should show all sessions
5. [ ] Sessions should be ordered by most recent first

**Expected Results**:
- [ ] Sidebar shows all sessions
- [ ] Sessions ordered by creation date (newest first)
- [ ] Timestamps show relative time (e.g., "2m ago")
- [ ] Can click to load any session
- [ ] Can delete sessions with ✕ button

**If Failed**:
- [ ] Check console for session fetch errors
- [ ] Verify sessions are being saved to database
- [ ] Check if `loadRecentSessions()` is being called

---

## Test 10: Delete Session

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Click 📋 Recent button
3. [ ] Hover over a session
4. [ ] Click ✕ button to delete
5. [ ] Session should disappear from list

**Expected Results**:
- [ ] Delete button appears on hover
- [ ] Session is removed from sidebar
- [ ] If current session is deleted, chat clears
- [ ] Session is soft-deleted (not permanently removed)

**If Failed**:
- [ ] Check console for delete errors
- [ ] Verify delete endpoint is working
- [ ] Check if `is_deleted` flag is being set

---

## Test 11: Model Selection

**Steps**:
1. [ ] Open AI Tutor
2. [ ] Click model dropdown
3. [ ] Select different model (e.g., `deepseek-r1:1.5b`)
4. [ ] Send a message
5. [ ] Response should use selected model

**Expected Results**:
- [ ] Dropdown shows available models
- [ ] Qwen models are filtered out
- [ ] Selected model is used for response
- [ ] Model persists across messages

**If Failed**:
- [ ] Check if models are being fetched from Ollama
- [ ] Verify Qwen filter is working
- [ ] Check if selected model is being sent to backend

---

## Test 12: Access Control (Parent Role)

**Steps**:
1. [ ] Log in as Parent user
2. [ ] Look for AI Tutor button (🤖)
3. [ ] Try to open AI Tutor if button exists

**Expected Results**:
- [ ] AI Tutor button is NOT visible in TopBar
- [ ] If somehow accessed, shows "Access Denied" screen
- [ ] Message: "AI Tutor is not available for Parent accounts"

**If Failed**:
- [ ] Check `hasAccess` logic in AITutorNew.tsx
- [ ] Verify role check in TopBar.tsx
- [ ] Ensure Parent role is correctly identified

---

## Console Log Checklist

**When sending a message, you should see**:
- [ ] `[AI Chat] Processing request - Model: {model}, Has Image: {hasImage}`
- [ ] `[AI Chat] Calling Ollama API...`
- [ ] `[AI Chat] Raw response length: {length}`
- [ ] `[AI Chat] Response before sanitization: {length} chars`
- [ ] `[AI Chat] Response after sanitization: {length} chars`
- [ ] `[AI Chat] Final response: {first100chars}...`

**When creating a session, you should see**:
- [ ] `[AI Tutor] Creating new session with auth header: Authorization`
- [ ] `[Sessions] Creating new session for user: {userId}`
- [ ] `[Sessions] Session created successfully: {sessionId}`
- [ ] `[AI Tutor] New session created: {sessionId}`

**When using auto-send, you should see**:
- [ ] `[Auto-Send] Event received. Current inputValue: {message}`
- [ ] `[Auto-Send] Triggering send with: {message}`

---

## Troubleshooting Quick Reference

| Issue | Check | Solution |
|-------|-------|----------|
| Auto-send not working | Console for `[Auto-Send]` logs | Restart backend, check microphone |
| Session not created | `[Sessions]` logs | Check auth token, verify database |
| JSON parse errors | `[AI Chat] First 300 chars:` | Check Ollama response format |
| Image not analyzed | `[AI Chat] Image data length:` | Verify LLaVA is downloaded |
| No audio output | Browser permissions | Check speaker, enable audio |
| Model not switching | Model dropdown | Verify LLaVA is in available models |
| Access denied | User role | Ensure not logged in as Parent |

---

## Notes

- All timestamps are in browser local time
- Session data persists in Supabase database
- Messages are auto-saved when sent
- Auto-send delay is 2 seconds of silence
- Image data is base64 encoded (may be large)
- LLaVA model is ~4.5GB, ensure disk space

