// Test the backend Ollama endpoint
const BACKEND_URL = 'http://localhost:3000';

async function testBackendOllama() {
  console.log('Testing backend Ollama endpoint...\n');

  try {
    console.log('Sending request to /api/ollama/chat...');
    const response = await fetch(`${BACKEND_URL}/api/ollama/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is 2+2?',
        model: 'deepseek-r1:1.5b'
      }),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers));

    const text = await response.text();
    console.log(`Response body (first 500 chars): ${text.substring(0, 500)}`);

    try {
      const data = JSON.parse(text);
      console.log('\n✅ Backend is working!');
      console.log(`Response: ${data.response?.substring(0, 100)}...`);
    } catch (e) {
      console.log('\n❌ Backend returned invalid JSON');
      console.log(`Full response: ${text}`);
    }
  } catch (error) {
    console.error('❌ Error connecting to backend');
    console.error(`Error: ${error.message}`);
    console.error('Make sure backend is running on port 3000');
  }
}

testBackendOllama();
