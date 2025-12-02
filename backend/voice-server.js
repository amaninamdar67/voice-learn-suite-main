import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for audio uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuration - Update these paths if you installed elsewhere
const WHISPER_PATH = 'C:\\Users\\amani\\Downloads\\whisper-bin-x64\\Release\\whisper-cli.exe';
const WHISPER_MODEL = 'C:\\Users\\amani\\Downloads\\whisper-bin-x64\\Release\\models\\ggml-tiny.bin';
const PIPER_PATH = 'C:\\Users\\amani\\Downloads\\piper_windows_amd64\\piper\\piper.exe';
const PIPER_MODEL = 'C:\\Users\\amani\\Downloads\\piper_windows_amd64\\piper\\en_US-lessac-medium.onnx';

// Health check
app.get('/api/voice/health', (req, res) => {
  res.json({ 
    status: 'ok',
    whisper: fs.existsSync(WHISPER_PATH),
    piper: fs.existsSync(PIPER_PATH),
    timestamp: new Date().toISOString()
  });
});

// Speech to Text (Whisper)
app.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const audioPath = req.file.path;
  
  try {
    console.log('Transcribing audio:', audioPath);
    
    const { stdout, stderr } = await execAsync(
      `"${WHISPER_PATH}" -m "${WHISPER_MODEL}" -f "${audioPath}" --no-timestamps`
    );
    
    // Clean up uploaded file
    fs.unlinkSync(audioPath);
    
    const text = stdout.trim();
    console.log('Transcription:', text);
    
    res.json({ 
      text,
      success: true 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    
    // Clean up on error
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    
    res.status(500).json({ 
      error: 'Transcription failed',
      details: error.message 
    });
  }
});

// Text to Speech (Piper)
app.post('/api/voice/speak', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  const outputFile = path.join(__dirname, 'uploads', `speech_${Date.now()}.wav`);
  const inputFile = path.join(__dirname, 'uploads', `input_${Date.now()}.txt`);
  
  try {
    console.log('Generating speech for:', text);
    
    // Write text to file (safer than echo for special characters)
    fs.writeFileSync(inputFile, text, 'utf8');
    
    // Generate speech
    await execAsync(
      `type "${inputFile}" | "${PIPER_PATH}" --model "${PIPER_MODEL}" --output_file "${outputFile}"`
    );
    
    // Clean up input file
    fs.unlinkSync(inputFile);
    
    // Send audio file
    res.sendFile(outputFile, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up output file after sending
      setTimeout(() => {
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('Speech generation error:', error);
    
    // Clean up on error
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    
    res.status(500).json({ 
      error: 'Speech generation failed',
      details: error.message 
    });
  }
});

// AI Chat (Ollama)
app.post('/api/ai/chat', async (req, res) => {
  const { message, model = 'qwen2.5:7b' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    console.log('AI Query:', message);
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: message,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Ollama API error');
    }

    const data = await response.json();
    console.log('AI Response:', data.response);
    
    res.json({ 
      response: data.response,
      success: true 
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'AI chat failed',
      details: error.message,
      hint: 'Make sure Ollama is running: ollama serve'
    });
  }
});

// Combined: Voice Question → AI → Voice Answer
app.post('/api/voice/ask-ai', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const audioPath = req.file.path;
  
  try {
    // Step 1: Transcribe voice to text
    const { stdout } = await execAsync(
      `"${WHISPER_PATH}" -m "${WHISPER_MODEL}" -f "${audioPath}" --no-timestamps`
    );
    const question = stdout.trim();
    console.log('Question:', question);
    
    // Clean up audio
    fs.unlinkSync(audioPath);
    
    // Step 2: Get AI response
    const aiResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b',
        prompt: question,
        stream: false
      })
    });
    
    const aiData = await aiResponse.json();
    const answer = aiData.response;
    console.log('Answer:', answer);
    
    // Step 3: Convert answer to speech
    const outputFile = path.join(__dirname, 'uploads', `answer_${Date.now()}.wav`);
    const inputFile = path.join(__dirname, 'uploads', `text_${Date.now()}.txt`);
    
    fs.writeFileSync(inputFile, answer, 'utf8');
    await execAsync(
      `type "${inputFile}" | "${PIPER_PATH}" --model "${PIPER_MODEL}" --output_file "${outputFile}"`
    );
    fs.unlinkSync(inputFile);
    
    // Send response
    res.json({
      question,
      answer,
      audioUrl: `/audio/${path.basename(outputFile)}`,
      success: true
    });
    
    // Serve audio file
    app.get(`/audio/${path.basename(outputFile)}`, (req, res) => {
      res.sendFile(outputFile, () => {
        setTimeout(() => {
          if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        }, 5000);
      });
    });
  } catch (error) {
    console.error('Voice AI error:', error);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    res.status(500).json({ 
      error: 'Voice AI failed',
      details: error.message 
    });
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🎤 Voice Server running on http://localhost:${PORT}`);
  console.log('📝 Endpoints:');
  console.log('  POST /api/voice/transcribe - Speech to Text');
  console.log('  POST /api/voice/speak - Text to Speech');
  console.log('  POST /api/ai/chat - AI Chat');
  console.log('  POST /api/voice/ask-ai - Voice → AI → Voice');
  console.log('  GET  /api/voice/health - Health Check');
});
