import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = 3002;

// Enable CORS
app.use(cors());
app.use(express.json());

// Configure multer for audio file uploads
const upload = multer({
  dest: 'temp-audio/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure temp directory exists
if (!fs.existsSync('temp-audio')) {
  fs.mkdirSync('temp-audio');
}

// Whisper executable path
const WHISPER_PATH = 'C:\\Users\\Downloads\\whisper-bin-x64\\Release\\main.exe';

// Transcribe audio using Whisper
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const audioPath = req.file.path;
  const outputPath = audioPath + '.txt';

  try {
    // Run Whisper with tiny model (you already have this!)
    const command = `"${WHISPER_PATH}" -m "C:\\Users\\Downloads\\whisper-bin-x64\\Release\\models\\ggml-tiny.bin" -f "${audioPath}" -otxt -of "${audioPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      // Clean up audio file
      fs.unlinkSync(audioPath);

      if (error) {
        console.error('Whisper error:', error);
        return res.status(500).json({ error: 'Transcription failed', details: stderr });
      }

      // Read transcription
      if (fs.existsSync(outputPath)) {
        const transcript = fs.readFileSync(outputPath, 'utf8').trim();
        fs.unlinkSync(outputPath); // Clean up transcript file
        
        res.json({ transcript });
      } else {
        res.status(500).json({ error: 'Transcription file not found' });
      }
    });
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', whisperPath: WHISPER_PATH });
});

app.listen(PORT, () => {
  console.log(`🎤 Whisper Voice Server running on http://localhost:${PORT}`);
  console.log(`📁 Whisper path: ${WHISPER_PATH}`);
});
