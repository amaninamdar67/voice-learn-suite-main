# AI Quiz Generator - Implementation Guide

## Overview
Automatically generate quizzes from uploaded documents (PDF, DOC, images) using AI analysis.

## Architecture

### 1. Document Processing Pipeline
```
Upload Document → Extract Text → AI Analysis → Generate Questions → Review & Edit → Save Quiz
```

### 2. Technology Stack Options

#### Option A: OpenAI GPT-4 (Recommended)
- **Pros**: Best quality, handles images via GPT-4 Vision
- **Cons**: Requires API key, costs per request
- **Cost**: ~$0.01-0.03 per quiz generation

#### Option B: Google Gemini
- **Pros**: Free tier available, good quality
- **Cons**: Rate limits on free tier

#### Option C: Open Source (Llama 2/3)
- **Pros**: Free, private
- **Cons**: Requires hosting, lower quality

## Implementation Steps

### Phase 1: Backend API Setup

1. **Install Dependencies**
```bash
npm install openai pdf-parse mammoth tesseract.js
```

2. **Create AI Service** (`backend/ai-quiz-service.js`)
- Text extraction from PDFs
- OCR for images
- AI prompt engineering
- Question generation

3. **API Endpoints**
- `POST /api/ai/analyze-document` - Upload & analyze
- `POST /api/ai/generate-quiz` - Generate questions
- `GET /api/ai/quiz-status/:id` - Check generation status

### Phase 2: Frontend Integration

1. **Upload Interface**
- Drag & drop document upload
- File type validation (PDF, DOC, DOCX, JPG, PNG)
- Progress indicator

2. **AI Generation UI**
- Loading animation during processing
- Preview generated questions
- Edit/modify questions before saving
- Regenerate individual questions

3. **Quiz Editor**
- Review AI-generated questions
- Add/remove/edit questions
- Adjust difficulty levels
- Set correct answers

## Features

### Core Features
✅ PDF text extraction
✅ Image OCR (text from images)
✅ AI question generation (MCQ, True/False, Short Answer)
✅ Difficulty level detection
✅ Topic identification
✅ Answer key generation

### Advanced Features
🔄 Multi-language support
🔄 Question quality scoring
🔄 Duplicate question detection
🔄 Bloom's taxonomy classification
🔄 Adaptive difficulty adjustment

## AI Prompt Strategy

### Question Generation Prompt
```
Analyze the following educational content and generate {count} quiz questions.

Content: {extracted_text}

Requirements:
- Generate {count} multiple-choice questions
- Each question should have 4 options (A, B, C, D)
- Mark the correct answer
- Vary difficulty levels (Easy, Medium, Hard)
- Cover different topics from the content
- Questions should test understanding, not just memorization

Format each question as JSON:
{
  "question": "Question text",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "A",
  "difficulty": "medium",
  "topic": "Topic name",
  "explanation": "Why this is the correct answer"
}
```

## Security & Privacy

1. **API Key Management**
   - Store OpenAI API key in environment variables
   - Never expose in frontend code
   - Rotate keys regularly

2. **Content Privacy**
   - Don't store uploaded documents permanently
   - Delete after processing
   - Option to use local AI models for sensitive content

3. **Rate Limiting**
   - Limit quiz generations per teacher (e.g., 10/day)
   - Prevent abuse
   - Queue system for high load

## Cost Estimation

### OpenAI GPT-4 Pricing
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Average quiz (10 questions): ~2K tokens = $0.18

### Monthly Costs (100 teachers)
- 10 quizzes/teacher/month = 1,000 quizzes
- Cost: ~$180/month

## Implementation Code Structure

```
backend/
├── ai-quiz-service.js       # Main AI service
├── document-processor.js    # PDF/DOC/Image processing
├── quiz-generator.js        # Question generation logic
└── routes/
    └── ai-routes.js         # API endpoints

frontend/
└── src/
    ├── pages/Teacher/
    │   └── AIQuizGenerator.tsx
    └── components/
        ├── DocumentUploader.tsx
        ├── QuizPreview.tsx
        └── QuestionEditor.tsx
```

## Usage Flow

1. **Teacher uploads document**
   - Select file (PDF, DOC, image)
   - Set quiz parameters (number of questions, difficulty)
   - Click "Generate Quiz"

2. **AI Processing**
   - Extract text from document
   - Analyze content
   - Generate questions using AI
   - Show progress (30-60 seconds)

3. **Review & Edit**
   - Preview generated questions
   - Edit any question
   - Regenerate specific questions
   - Add custom questions

4. **Save Quiz**
   - Save to database
   - Make available to students
   - Track usage and effectiveness

## Alternative: Simple Rule-Based Generator

If AI integration is too complex initially, start with:

1. **Keyword Extraction**
   - Identify important terms
   - Generate definition questions

2. **Template-Based Questions**
   - "What is {term}?"
   - "Define {concept}"
   - "True or False: {statement}"

3. **Manual Enhancement**
   - Teacher reviews and improves
   - Builds question bank over time

## Next Steps

1. Choose AI provider (OpenAI recommended)
2. Set up API keys
3. Implement document processing
4. Create AI service
5. Build frontend interface
6. Test with sample documents
7. Deploy and monitor

## Resources

- OpenAI API: https://platform.openai.com/docs
- PDF Parse: https://www.npmjs.com/package/pdf-parse
- Tesseract OCR: https://www.npmjs.com/package/tesseract.js
- Mammoth (DOCX): https://www.npmjs.com/package/mammoth
