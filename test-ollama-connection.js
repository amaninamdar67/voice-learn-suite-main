#!/usr/bin/env node

/**
 * Test Ollama Connection
 * 
 * This script tests if Ollama is running and responding correctly
 * Run with: node test-ollama-connection.js
 */

import fetch from 'node-fetch';

const OLLAMA_URL = 'http://localhost:11434';

async function testConnection() {
  console.log('🔍 Testing Ollama Connection...\n');

  // Test 1: Check if Ollama is running
  console.log('1️⃣  Checking if Ollama is running on port 11434...');
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ Ollama is running!\n');
    } else {
      console.log(`❌ Ollama returned status ${response.status}\n`);
      return;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to Ollama on port 11434`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Make sure Ollama is running with: ollama serve\n`);
    return;
  }

  // Test 2: List available models
  console.log('2️⃣  Fetching available models...');
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log(`✅ Found ${data.models.length} model(s):\n`);
      data.models.forEach(model => {
        console.log(`   • ${model.name}`);
      });
      console.log();
    } else {
      console.log('❌ No models found. Download one with: ollama pull mistral:latest\n');
      return;
    }
  } catch (error) {
    console.log(`❌ Error fetching models: ${error.message}\n`);
    return;
  }

  // Test 3: Test a simple request
  console.log('3️⃣  Testing simple text generation...');
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral:latest',
        prompt: 'Say hello in one word',
        stream: false,
      }),
      timeout: 30000
    });

    if (!response.ok) {
      console.log(`❌ API returned status ${response.status}`);
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 200)}\n`);
      return;
    }

    const data = await response.json();
    
    if (data.response) {
      console.log('✅ Text generation works!');
      console.log(`   Response: "${data.response.trim()}"\n`);
    } else {
      console.log('❌ No response from model\n');
      return;
    }
  } catch (error) {
    console.log(`❌ Error testing text generation: ${error.message}\n`);
    return;
  }

  // Test 4: Check for LLaVA (image support)
  console.log('4️⃣  Checking for LLaVA model (image support)...');
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    
    const hasLLaVA = data.models?.some(m => m.name.includes('llava'));
    
    if (hasLLaVA) {
      console.log('✅ LLaVA is available for image analysis\n');
    } else {
      console.log('⚠️  LLaVA not found. Download with: ollama pull llava:7b\n');
    }
  } catch (error) {
    console.log(`❌ Error checking for LLaVA: ${error.message}\n`);
  }

  console.log('✅ All tests completed!');
  console.log('\nNext steps:');
  console.log('1. Restart your backend: npm run dev');
  console.log('2. Open the AI Tutor and try sending a message');
  console.log('3. Check browser console (F12) for logs');
}

testConnection().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
