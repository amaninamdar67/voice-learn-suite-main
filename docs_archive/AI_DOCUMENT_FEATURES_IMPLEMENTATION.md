# AI Document Features - Implementation Guide

## ✅ COMPLETED

### 1. Permission-Based Viewing (Student Side)
- Added `permission` field to Lesson interface
- Updated `handleDownload` to check permission
- "View Only" → Opens in new tab, no download
- "Allow Download" → Opens in new tab, can download

### 2. Analyze Document Button
- Added `handleAnalyzeDocument` function
- Dispatches event to open AI Tutor
- Passes document details to AI Tutor

---

## 🔄 TO IMPLEMENT

### 3. Update Lesson Card UI (Add Buttons)

**Location:** `src/pages/Lessons.tsx` - Card component

**Add these buttons to each lesson card:**

```tsx
<Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
  {/* View/Download Button */}
  <Button
    variant="contained"
    startIcon={lesson.permission === 'view_only' ? <Visibility /> : <Download />}
    onClick={() => handleDownload(lesson)}
  >
    {lesson.permission === 'view_only' ? 'View' : 'Download'}
  </Button>

  {/* Analyze Document Button */}
  <Button
    variant="outlined"
    startIcon={<Psychology />}
    onClick={() => handleAnalyzeDocument(lesson)}
  >
    Analyze with AI
  </Button>
</Box>
```

---

### 4. Update AI Tutor Component

**Location:** `src/components/AITutor/AITutorChat.tsx`

**Add document analysis capability:**

```tsx
// Add state for document analysis
const [analyzingDocument, setAnalyzingDocument] = useState(false);
const [documentData, setDocumentData] = useState<any>(null);

// Listen for analyze document event
useEffect(() => {
  const handleAnalyze = (event: any) => {
    const { document } = event.detail;
    setOpen(true);
    analyzeDocument(document);
  };
  
  window.addEventListener('open-ai-tutor', handleAnalyze);
  return () => window.removeEventListener('open-ai-tutor', handleAnalyze);
}, []);

// Analyze document function
const analyzeDocument = async (document: any) => {
  setAnalyzingDocument(true);
  
  try {
    // Call backend API to analyze document
    const response = await fetch('http://localhost:3001/api/ai/analyze-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentUrl: document.url }),
    });
    
    const data = await response.json();
    
    // Display analysis in chat
    const analysisMessage = {
      id: Date.now().toString(),
      text: `📄 Document Analysis: ${document.title}\n\n` +
            `📝 Summary: ${data.summary}\n\n` +
            `🔑 Key Points:\n${data.keyPoints.join('\n')}\n\n` +
            `📚 Topics: ${data.topics.join(', ')}\n\n` +
            `💡 Keywords: ${data.keywords.join(', ')}`,
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, analysisMessage]);
    setDocumentData(data);
    
  } catch (error) {
    console.error('Error analyzing document:', error);
  } finally {
    setAnalyzingDocument(false);
  }
};
```

**Add Read Aloud button:**

```tsx
<Button
  startIcon={<VolumeUp />}
  onClick={() => speak(documentData.fullText)}
>
  Read Aloud
</Button>
```

---

### 5. Backend API - Document Analysis

**Location:** `backend/server.js`

**Add AI document analysis endpoint:**

```javascript
// ==================== AI DOCUMENT ANALYSIS ====================

app.post('/api/ai/analyze-document', async (req, res) => {
  try {
    const { documentUrl } = req.body;
    
    // For now, return mock data
    // In production, integrate with OpenAI API or similar
    
    const analysis = {
      fullText: "Sample document text...",
      summary: "This document covers the fundamentals of...",
      keyPoints: [
        "Point 1: Introduction to the topic",
        "Point 2: Main concepts explained",
        "Point 3: Practical applications",
        "Point 4: Conclusion and takeaways"
      ],
      topics: ["Topic A", "Topic B", "Topic C"],
      keywords: ["keyword1", "keyword2", "keyword3", "keyword4"]
    };
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Summarize document
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { documentText, length } = req.body; // length: 'short' or 'detailed'
    
    // Mock summary
    const summary = length === 'short' 
      ? "Brief summary of the document..."
      : "Detailed summary covering all major points...";
    
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate quiz from document
app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const { documentText, questionCount, questionType } = req.body;
    
    // Mock quiz generation
    const quiz = {
      questions: [
        {
          type: 'mcq',
          question: 'What is the main topic of this document?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A'
        },
        {
          type: 'true_false',
          question: 'The document discusses advanced concepts.',
          correctAnswer: true
        },
        {
          type: 'fill_blank',
          question: 'The key concept is _____.',
          correctAnswer: 'important term'
        }
      ]
    };
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 6. AI Tutor - Handle User Questions

**Add command recognition in AI Tutor:**

```tsx
const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = {
    id: Date.now().toString(),
    text: input,
    sender: 'user',
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setIsLoading(true);

  try {
    // Check for special commands
    if (input.toLowerCase().includes('summarize')) {
      const length = input.toLowerCase().includes('detailed') ? 'detailed' : 'short';
      await handleSummarize(length);
    } else if (input.toLowerCase().includes('quiz') || input.toLowerCase().includes('mcq')) {
      await handleGenerateQuiz(input);
    } else if (input.toLowerCase().includes('explain section')) {
      await handleExplainSection(input);
    } else {
      // Regular AI response
      await handleRegularQuery(input);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};

const handleSummarize = async (length: 'short' | 'detailed') => {
  const response = await fetch('http://localhost:3001/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      documentText: documentData.fullText,
      length 
    }),
  });
  
  const data = await response.json();
  
  setMessages(prev => [...prev, {
    id: Date.now().toString(),
    text: `📝 ${length === 'short' ? 'Short' : 'Detailed'} Summary:\n\n${data.summary}`,
    sender: 'ai',
    timestamp: new Date(),
  }]);
};

const handleGenerateQuiz = async (query: string) => {
  // Extract question count from query
  const match = query.match(/(\d+)/);
  const count = match ? parseInt(match[1]) : 10;
  
  const response = await fetch('http://localhost:3001/api/ai/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      documentText: documentData.fullText,
      questionCount: count,
      questionType: 'mixed'
    }),
  });
  
  const data = await response.json();
  
  // Format quiz for display
  let quizText = `📋 Generated Quiz (${data.questions.length} questions):\n\n`;
  data.questions.forEach((q, i) => {
    quizText += `${i + 1}. ${q.question}\n`;
    if (q.options) {
      q.options.forEach((opt, j) => {
        quizText += `   ${String.fromCharCode(65 + j)}. ${opt}\n`;
      });
    }
    quizText += '\n';
  });
  
  setMessages(prev => [...prev, {
    id: Date.now().toString(),
    text: quizText,
    sender: 'ai',
    timestamp: new Date(),
  }]);
};
```

---

## 🚀 PRODUCTION INTEGRATION

### For Real AI (OpenAI API):

1. **Install OpenAI SDK:**
```bash
npm install openai
```

2. **Add to backend:**
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Real document analysis
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are a document analyzer. Extract key points, topics, and keywords."
    },
    {
      role: "user",
      content: `Analyze this document: ${documentText}`
    }
  ],
});
```

---

## 📝 TESTING CHECKLIST

- [ ] Run SQL migration: `database/08_lesson_permissions.sql`
- [ ] Teacher uploads document with "View Only"
- [ ] Student sees "View" button (not "Download")
- [ ] Student clicks "View" → Opens in new tab
- [ ] Teacher uploads document with "Allow Download"
- [ ] Student sees "Download" button
- [ ] Student clicks "Analyze with AI" → AI Tutor opens
- [ ] AI Tutor shows document analysis
- [ ] "Read Aloud" button works
- [ ] User asks "Summarize" → Gets summary
- [ ] User asks "Create 10 MCQs" → Gets quiz

---

## ⚡ QUICK START

1. Run SQL migration in Supabase
2. Add buttons to Lesson cards (Step 3)
3. Update AI Tutor component (Step 4)
4. Add backend endpoints (Step 5)
5. Test with mock data
6. Integrate real AI later

---

**Current Status:** Foundation complete, UI updates needed
**Next Step:** Add buttons to lesson cards and update AI Tutor UI
