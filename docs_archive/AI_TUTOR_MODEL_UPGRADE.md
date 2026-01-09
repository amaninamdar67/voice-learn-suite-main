# AI Tutor Model Upgrade Guide

## Current Setup
- **Default Model**: Llama 2 (recommended)
- **Fallback Model**: Mistral 7B
- **Purpose**: Detailed explanations, image analysis, flowchart understanding

## Why Llama 2?
✅ **Faster responses** - Better optimized for speed  
✅ **Detailed explanations** - Excellent at breaking down complex concepts  
✅ **Image analysis** - Can analyze diagrams and flowcharts  
✅ **Educational focus** - Trained to be helpful for learning  
✅ **Lower resource usage** - Runs smoothly on 11th Gen i5 + 16GB RAM  

## Installation Steps

### 1. Pull Llama 2 Model
```bash
ollama pull llama2:latest
```

### 2. Verify Installation
```bash
ollama list
```
You should see `llama2:latest` in the list.

### 3. Test the Model
```bash
ollama run llama2:latest "Explain what is programming in two lines"
```

## Model Comparison

| Feature | Llama 2 | Mistral 7B | Mistral 7B Instruct |
|---------|---------|-----------|-------------------|
| Speed | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Quality | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Image Analysis | ✅ | ✅ | ✅ |
| Memory Usage | 4GB | 4GB | 4GB |
| Best For | Education | General | Instructions |

## Switching Models

### In Frontend
The model selector dropdown in the AI Tutor header allows you to switch between available models:
1. Click the model dropdown
2. Select your preferred model
3. New messages will use the selected model

### Available Models
- `llama2:latest` - Recommended for education
- `mistral:latest` - Good general-purpose model
- `neural-chat:latest` - Optimized for conversations (if installed)

## Performance Tips

### For Faster Responses
1. Use `llama2:latest` (default)
2. Keep other applications closed
3. Ensure Ollama is running: `ollama serve`

### For Better Explanations
1. Ask specific questions
2. Upload relevant images for analysis
3. Use the voice input for natural questions

### For Image Analysis
1. Upload clear, well-lit images
2. Ask specific questions about the image
3. Llama 2 excels at analyzing:
   - Flowcharts
   - Diagrams
   - Code screenshots
   - Mathematical equations
   - Graphs and charts

## Troubleshooting

### Model Not Appearing in Dropdown
- Ensure model is pulled: `ollama pull llama2:latest`
- Restart Ollama: `ollama serve`
- Refresh the browser

### Slow Responses
- Check if other processes are using CPU
- Reduce browser tabs open
- Ensure Ollama has enough memory

### Out of Memory Error
- Close other applications
- Reduce number of browser tabs
- Consider using a smaller model

## Advanced Configuration

### Custom Model Parameters
Edit `backend/ai-tutor-routes.js` to adjust:
- `temperature`: 0.6 (lower = more focused, higher = more creative)
- `top_p`: 0.85 (diversity of responses)
- `num_predict`: 1024 (max response length)

### Example: More Creative Responses
```javascript
temperature: 0.8,  // Increase for more varied responses
top_p: 0.95,
```

### Example: Faster Responses
```javascript
num_predict: 512,  // Shorter responses = faster
temperature: 0.5,  // More focused
```

## Next Steps

1. ✅ Pull Llama 2: `ollama pull llama2:latest`
2. ✅ Restart Ollama: `ollama serve`
3. ✅ Refresh browser
4. ✅ Test with an image or complex question
5. ✅ Adjust model parameters if needed

## Support

For issues:
1. Check browser console (F12) for errors
2. Check Ollama logs: `ollama serve` output
3. Verify model is installed: `ollama list`
4. Ensure backend is running: Check server logs
