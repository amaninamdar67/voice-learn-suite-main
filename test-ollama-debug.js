const OLLAMA_URL = 'http://localhost:11434';

async function testOllama() {
  console.log('Testing Ollama connection...\n');

  try {
    // Test 1: Check if Ollama is running
    console.log('1. Testing Ollama health...');
    const healthResponse = await fetch(`${OLLAMA_URL}/api/tags`);
    const healthData = await healthResponse.json();
    console.log('✅ Ollama is running!');
    console.log(`   Available models: ${healthData.models?.length || 0}`);
    if (healthData.models) {
      healthData.models.forEach(m => console.log(`   - ${m.name}`));
    }
  } catch (error) {
    console.error('❌ Ollama is NOT running or not accessible');
    console.error(`   Error: ${error.message}`);
    console.error('   Make sure to run: ollama serve');
    return;
  }

  try {
    // Test 2: Try to generate a response
    console.log('\n2. Testing DeepSeek model...');
    const chatResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: 'Hello, what is 2+2?',
        stream: false,
      }),
    });
    
    const chatData = await chatResponse.json();
    console.log('✅ DeepSeek model is working!');
    console.log(`   Response: ${chatData.response?.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ DeepSeek model error');
    console.error(`   Error: ${error.message}`);
  }
}

testOllama();
