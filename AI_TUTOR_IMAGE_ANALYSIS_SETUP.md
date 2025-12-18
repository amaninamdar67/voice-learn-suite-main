# AI Tutor Image Analysis Setup

## Current Status
Image analysis is now supported in the AI Tutor. However, for best results with image analysis, you should use a vision-capable model.

## Recommended Vision Models

### 1. **LLaVA 7B** (Best for your specs)
```bash
ollama pull llava:7b
```
- ✅ Excellent image understanding
- ✅ Fast responses (3-5 seconds)
- ✅ Good for flowcharts, diagrams, code screenshots
- ✅ Uses ~4GB memory
- ⭐ **RECOMMENDED**

### 2. **LLaVA 13B** (Better quality, slower)
```bash
ollama pull llava:13b
```
- ✅ Superior image analysis
- ⚠️ Slower (5-8 seconds)
- ⚠️ Uses ~8GB memory
- Use if you have spare resources

### 3. **Bakllava 7B** (Lightweight alternative)
```bash
ollama pull bakllava:7b
```
- ✅ Fast and lightweight
- ⚠️ Lower quality than LLaVA
- ✅ Uses ~3.5GB memory

## How to Use

### 1. Install Vision Model
```bash
ollama pull llava:7b
```

### 2. Restart Backend
```bash
npm run dev
```

### 3. Select Model in AI Tutor
- Open AI Tutor
- Click model dropdown
- Select `llava:7b`
- Upload an image and ask about it

## What Works
- ✅ Flowcharts and diagrams
- ✅ Code screenshots
- ✅ Mathematical equations
- ✅ Graphs and charts
- ✅ Screenshots of UI/UX
- ✅ Handwritten notes (if clear)

## What Doesn't Work Well
- ❌ Very small text
- ❌ Blurry images
- ❌ Complex 3D renderings
- ❌ Very dark/low contrast images

## Tips for Best Results

1. **Clear Images**: Use well-lit, clear images
2. **Specific Questions**: Ask specific questions about the image
3. **Context**: Provide context in your question
4. **Size**: Images should be reasonably sized (not too small)

## Example Prompts

**Good:**
- "Explain this flowchart step by step"
- "What does this code do?"
- "Analyze this diagram and explain the relationships"

**Better:**
- "I'm learning about data structures. Explain this flowchart showing how a binary tree works"
- "This is a Python function. Explain what it does and how it works"

## Troubleshooting

### Image Not Being Analyzed
- Ensure you're using a vision model (llava, bakllava, etc.)
- Check that the image is clear and readable
- Try a different image

### Slow Responses with Images
- This is normal - vision models are slower
- LLaVA 7B: 3-5 seconds
- LLaVA 13B: 5-8 seconds

### Out of Memory
- Close other applications
- Use LLaVA 7B instead of 13B
- Reduce browser tabs

## Current Model Capabilities

| Model | Text | Images | Speed | Memory |
|-------|------|--------|-------|--------|
| mistral:latest | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ | 4GB |
| llava:7b | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 4GB |
| llava:13b | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 8GB |
| deepseek-r1:1.5b | ⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ | 1.5GB |

## Next Steps

1. Install LLaVA 7B: `ollama pull llava:7b`
2. Restart backend: `npm run dev`
3. Test with an image in AI Tutor
4. Provide feedback on quality
