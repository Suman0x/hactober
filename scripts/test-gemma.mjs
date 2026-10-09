import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';

// Load .env
const envPaths = ['.env.local', '.env'];
let apiKey = process.env.GEMMA_API_KEY || process.env.GEMINI_API_KEY;
let defaultModel = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

if (!apiKey) {
  for (const envFile of envPaths) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const keyMatch = content.match(/GEMMA_API_KEY=([^\r\n]+)/);
      if (keyMatch && keyMatch[1]) {
        apiKey = keyMatch[1].trim();
      }
      const modelMatch = content.match(/GEMMA_MODEL=([^\r\n]+)/);
      if (modelMatch && modelMatch[1]) {
        defaultModel = modelMatch[1].trim();
      }
    }
  }
}

console.log('----------------------------------------------------');
console.log('🤖  Testing Gemma Free Model Setup');
console.log('----------------------------------------------------');

if (!apiKey) {
  console.error('❌ Error: GEMMA_API_KEY not found in environment or .env file.');
  console.error('👉 Please set GEMMA_API_KEY in hactober/.env');
  process.exit(1);
}

console.log(`🔑 API Key detected: ${apiKey.substring(0, 6)}...${apiKey.slice(-4)}`);
console.log(`📦 Primary Target Model: ${defaultModel}`);
console.log('📡 Contacting Google GenAI service...\n');

const ai = new GoogleGenAI({ apiKey });

async function run() {
  const modelsToTest = [defaultModel];

  for (const model of modelsToTest) {
    console.log(`=== Testing Model: ${model} ===`);
    try {
      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model,
        contents: 'Say "Hello, Gemma is active!" in one sentence.',
        config: { temperature: 0.2 },
      });
      const elapsed = Date.now() - startTime;
      console.log(`✅ Text Generation (${elapsed}ms): "${response.text?.trim()}"`);

      // Test Streaming
      process.stdout.write('   Streaming test: ');
      const stream = await ai.models.generateContentStream({
        model,
        contents: 'Count from 1 to 3',
        config: { temperature: 0.1 },
      });
      for await (const chunk of stream) {
        if (chunk.text) process.stdout.write(chunk.text);
      }
      console.log(' [Done]\n');
    } catch (err) {
      console.warn(`⚠️ Model ${model} encountered an issue: ${err.message}\n`);
    }
  }

  console.log('====================================================');
  console.log('🎉 Gemma models setup verification complete!');
  console.log('====================================================\n');
}

run();
