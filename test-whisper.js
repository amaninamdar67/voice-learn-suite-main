import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

const WHISPER_PATH = 'C:\\Users\\amani\\Downloads\\whisper-bin-x64\\Release\\whisper-cli.exe';
const WHISPER_MODEL = 'C:\\Users\\amani\\Downloads\\whisper-bin-x64\\Release\\models\\ggml-tiny.bin';
const PIPER_PATH = 'C:\\Users\\amani\\Downloads\\piper_windows_amd64\\piper\\piper.exe';
const PIPER_MODEL = 'C:\\Users\\amani\\Downloads\\piper_windows_amd64\\piper\\en_US-lessac-medium.onnx';

console.log('🔍 Testing Voice System Setup...\n');

// Check if files exist
console.log('Checking Whisper (Speech-to-Text):');
console.log('  Executable:', fs.existsSync(WHISPER_PATH) ? '✅ Found' : '❌ Not found');
console.log('  Model:', fs.existsSync(WHISPER_MODEL) ? '✅ Found' : '❌ Not found');

console.log('\nChecking Piper (Text-to-Speech):');
console.log('  Executable:', fs.existsSync(PIPER_PATH) ? '✅ Found' : '❌ Not found');
console.log('  Model:', fs.existsSync(PIPER_MODEL) ? '✅ Found' : '❌ Not found');

const allFound = fs.existsSync(WHISPER_PATH) && fs.existsSync(WHISPER_MODEL) && 
                 fs.existsSync(PIPER_PATH) && fs.existsSync(PIPER_MODEL);

if (!allFound) {
  console.log('\n❌ Some files are missing. Please check the paths above.');
  process.exit(1);
}

console.log('\n✅ All files found!');
console.log('\n🎤 Testing Piper text-to-speech...');

// Test Piper
try {
  const testText = 'Hello! This is a test of the Piper text to speech system.';
  const outputFile = 'test-output.wav';
  
  await execAsync(`echo ${testText} | "${PIPER_PATH}" --model "${PIPER_MODEL}" --output_file "${outputFile}"`);
  
  if (fs.existsSync(outputFile)) {
    console.log('✅ Piper test successful! Audio file created:', outputFile);
    console.log('   Play the file to hear the test audio.');
    console.log('\n🚀 Voice system is ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Install voice server dependencies: cd backend && npm install express cors multer');
    console.log('   2. Start voice server: node voice-server.js');
  } else {
    console.log('❌ Piper test failed - no output file created');
  }
} catch (error) {
  console.log('❌ Piper test failed:', error.message);
}
