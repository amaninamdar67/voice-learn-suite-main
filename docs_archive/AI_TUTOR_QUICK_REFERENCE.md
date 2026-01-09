# AI Tutor - Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

### 1. Install Ollama
Download: https://ollama.ai

### 2. Pull a Model
```bash
ollama pull mistral
```

### 3. Start Ollama
```bash
ollama serve
```

### 4. Use AI Tutor
Click 🤖 icon in top-left corner

---

## 📱 UI Layout

```
┌─────────────────────────────────────────────────────┐
│ 🤖  E-Learning Using AI    [Model ▼] [X]           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  User: What is calculus?                           │
│                                                     │
│  AI: Calculus is a branch of mathematics...        │
│      [Read (Hindi)] [Stop Reading]                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Type here...] [🎤] [📷] [Send]                    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Features at a Glance

| Feature | Icon | How to Use |
|---------|------|-----------|
| **Voice Input** | 🎤 | Click mic, speak in Hindi |
| **Voice Output** | 🔊 | Click "Read (Hindi)" on response |
| **Image Upload** | 📷 | Click image icon, select file |
| **Send Message** | ➤ | Click send or press Enter |
| **Model Select** | ▼ | Choose from dropdown |
| **Close** | ✕ | Click X button |

---

## 💬 Example Conversations

### Example 1: Math Question
```
User: Explain integration
AI: Integration is the reverse of differentiation...
User: [Click Read (Hindi)]
AI: [Reads response in Hindi]
```

### Example 2: Image Analysis
```
User: [Click 📷] [Select diagram.png]
User: What does this diagram show?
AI: This diagram illustrates...
```

### Example 3: Coding Help
```
User: How do I write a loop in Python?
AI: Here's how to write a loop...
User: [Click Read (Hindi)]
```

---

## 🎤 Voice Commands

### Voice Input (Hindi)
1. Click 🎤 icon
2. Speak your question
3. Click Send

**Supported:**
- Hindi (hi-IN)
- English (en-US)

### Voice Output (Hindi)
1. AI responds
2. Click "Read (Hindi)"
3. Listen to response

---

## 📊 Model Comparison

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| neural-chat | ⚡⚡⚡ | ⭐⭐⭐ | Conversations |
| mistral | ⚡⚡ | ⭐⭐⭐⭐ | General |
| codellama | ⚡⚡ | ⭐⭐⭐⭐ | Coding |
| llama2 | ⚡ | ⭐⭐⭐⭐⭐ | Complex topics |

---

## ⚙️ Settings

### Change Language
Edit: `src/components/AITutor/AITutorNew.tsx` (Line 47)
```typescript
recognitionRef.current.lang = 'en-US'; // Change to English
```

### Change Default Model
Edit: `src/components/AITutor/AITutorNew.tsx` (Line 24)
```typescript
const [selectedModel, setSelectedModel] = useState('neural-chat:latest');
```

### Adjust Response Creativity
Edit: `backend/ai-tutor-routes.js` (Line 45)
```javascript
temperature: 0.7, // 0.0 = focused, 1.0 = creative
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| No models | Run: `ollama pull mistral` |
| Slow response | Use: `neural-chat` model |
| Voice not working | Check microphone permissions |
| Connection error | Start Ollama: `ollama serve` |
| Crashes | Restart browser, check RAM |

---

## 📋 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Spacebar | Toggle voice (if enabled) |
| Escape | Close (future) |

---

## 🎓 Best Practices

### For Math Questions
```
✅ Good: "Explain the chain rule in calculus"
❌ Bad: "math"

✅ Good: "How do I solve this equation: 2x + 5 = 13"
❌ Bad: "solve"
```

### For Image Analysis
```
✅ Good: "Explain this circuit diagram"
❌ Bad: "what is this"

✅ Good: "What does this flowchart represent?"
❌ Bad: "diagram"
```

### For Coding Help
```
✅ Good: "How do I write a function in Python?"
❌ Bad: "code"

✅ Good: "Explain how this algorithm works"
❌ Bad: "algorithm"
```

---

## 📁 File Locations

```
Frontend:
- src/components/AITutor/AITutorNew.tsx
- src/components/Layout/TopBar.tsx
- src/App.tsx

Backend:
- backend/ai-tutor-routes.js
- backend/server.js

Documentation:
- AI_TUTOR_README.md
- AI_TUTOR_SETUP.md
- AI_TUTOR_IMPLEMENTATION_SUMMARY.md
```

---

## 🌐 API Endpoint

```
POST /api/ai-tutor/chat

Request:
{
  "message": "Your question",
  "model": "mistral:latest",
  "image": "data:image/png;base64,..." // optional
}

Response:
{
  "response": "AI's answer",
  "model": "mistral:latest"
}
```

---

## 💾 System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Disk**: 10GB free space
- **Processor**: Intel i5 or equivalent
- **Internet**: For initial setup only

---

## 🚨 Common Errors

### Error: "Connection refused"
```
Solution: Start Ollama
$ ollama serve
```

### Error: "No models available"
```
Solution: Pull a model
$ ollama pull mistral
```

### Error: "Microphone not found"
```
Solution: 
1. Check browser permissions
2. Try Chrome/Edge
3. Restart browser
```

---

## 📞 Support

1. Check troubleshooting section
2. Review AI_TUTOR_README.md
3. Check browser console (F12)
4. Restart Ollama and browser

---

## ✨ Tips & Tricks

1. **Faster responses**: Use `neural-chat` model
2. **Better accuracy**: Use `llama2` model
3. **Coding help**: Use `codellama` model
4. **Clear images**: Crop before uploading
5. **Better answers**: Ask specific questions
6. **Save bandwidth**: Use local models only

---

## 🎯 Next Steps

1. ✅ Install Ollama
2. ✅ Pull a model
3. ✅ Start Ollama server
4. ✅ Click 🤖 icon
5. ✅ Start learning!

---

**Happy Learning! 🚀**

For detailed information, see AI_TUTOR_README.md
