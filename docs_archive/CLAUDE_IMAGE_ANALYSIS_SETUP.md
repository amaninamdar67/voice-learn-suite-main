# Claude Image Analysis Setup - 5 Minutes

## What's New
✅ **Claude Haiku** integration for image/document analysis  
✅ **100k tokens/month free** - plenty for educational use  
✅ **Excellent at explaining**: diagrams, flowcharts, documents, screenshots  
✅ **Works alongside Groq** - Groq for fast text, Claude for images  

## Step 1: Get Claude API Key (2 minutes)

1. Go to: https://console.anthropic.com
2. Sign up or log in
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-`)

## Step 2: Add API Key to .env (1 minute)

Edit `backend/.env` and replace:
```
CLAUDE_API_KEY=your_claude_api_key_here
```

With your actual key:
```
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
```

## Step 3: Restart Backend (1 minute)

Stop and restart your backend server. The Claude routes are now active.

## Step 4: Use Claude for Images (1 minute)

1. Open AI Tutor
2. **Select model**: `claude-3-5-haiku-20241022`
3. **Click image button** 📷 to upload
4. **Type your question** (e.g., "Explain this diagram")
5. **Send** - Claude will analyze the image

## Model Selection Guide

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| `llama-3.1-8b-instant` | Fast text answers | ⚡ Very Fast | Free (Groq) |
| `claude-3-5-haiku-20241022` | Image/doc analysis | 🚀 Fast | Free (100k tokens/month) |
| `deepseek-r1:1.5b` | Local reasoning | 🐢 Slow | Free (Local Ollama) |

## Supported File Types

- **Images**: JPG, PNG, GIF, WebP
- **Documents**: PDF, screenshots
- **Max size**: 20MB per file

## Token Usage

100k tokens/month = approximately:
- **500-1000** short text messages
- **50-100** longer explanations
- **10-20** image analyses

## Troubleshooting

**"Claude API key not configured"**
- Check `backend/.env` has `CLAUDE_API_KEY` set
- Restart backend server
- Check console for errors

**"Invalid Claude API key"**
- Verify key starts with `sk-ant-`
- Check key is copied completely
- Generate new key from console.anthropic.com

**"Rate limit exceeded"**
- You've used all 100k tokens for the month
- Wait until next month or upgrade to paid plan

## What Happened to Gemini?

Gemini API key didn't have access to required models. Claude is better for this use case anyway - faster, more reliable, and better at image analysis.

## What About LLaVA?

LLaVA (Ollama) doesn't properly support images through the current API endpoint. Claude is a much better solution for image analysis.

---

**Ready?** Get your Claude API key and add it to `backend/.env` now!
