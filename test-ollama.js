// Simple test to verify Ollama is working
const testOllama = async () => {
  try {
    console.log('Testing Ollama connection...');
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: 'Hello, how are you?',
        stream: false,
      })
    });

    console.log('Response status:', response.status);
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed response:', data);
      console.log('Response text:', data.response);
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testOllama();
