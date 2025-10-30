#!/usr/bin/env node

/**
 * Ollama Health Check Script
 * Verifies that Ollama is installed, running, and has models available
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function checkOllama() {
	console.log('🔍 Checking Ollama setup...\n');

	// Check if Ollama is running
	console.log('1️⃣  Checking if Ollama is running...');
	try {
		const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
			signal: AbortSignal.timeout(3000)
		});

		if (!response.ok) {
			console.error('❌ Ollama is not responding correctly');
			console.log('\n💡 Try running: ollama serve');
			process.exit(1);
		}

		console.log('✅ Ollama is running!\n');

		// List available models
		const data = await response.json();
		const models = data.models || [];

		console.log('2️⃣  Available models:');
		if (models.length === 0) {
			console.log('❌ No models installed\n');
			console.log('💡 Recommended models for mood journaling:');
			console.log('   ollama pull llama3.2:3b    (Best balance)');
			console.log('   ollama pull llama3.2:1b    (Fastest)');
			console.log('   ollama pull gemma2:2b      (Good quality)\n');
			process.exit(1);
		}

		models.forEach((model) => {
			const sizeGB = (model.size / 1024 / 1024 / 1024).toFixed(2);
			console.log(`   ✅ ${model.name} (${sizeGB} GB)`);
		});

		// Check for recommended models
		console.log('\n3️⃣  Checking recommended models:');
		const recommended = ['llama3.2:3b', 'llama3.2:1b', 'gemma2:2b', 'qwen2.5:3b'];
		const installedRecommended = models.filter((m) =>
			recommended.some((r) => m.name.includes(r.split(':')[0]))
		);

		if (installedRecommended.length > 0) {
			console.log('✅ You have recommended models installed!');
			installedRecommended.forEach((m) => console.log(`   • ${m.name}`));
		} else {
			console.log('⚠️  No recommended models found');
			console.log('   Consider installing: ollama pull llama3.2:3b');
		}

		// Test a model
		console.log('\n4️⃣  Testing model inference...');
		const testModel = models[0].name;
		console.log(`   Using model: ${testModel}`);

		const testResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: testModel,
				prompt: 'Say "Hello" in one word.',
				stream: false
			}),
			signal: AbortSignal.timeout(30000)
		});

		if (!testResponse.ok) {
			console.log('❌ Model test failed');
			process.exit(1);
		}

		const testData = await testResponse.json();
		console.log(`   Response: "${testData.response.trim()}"`);
		console.log('✅ Model inference working!\n');

		console.log('🎉 Ollama setup is complete and working!');
		console.log('\n📝 Next steps:');
		console.log('   1. Go to your app settings');
		console.log('   2. Select "Local (Ollama)" as provider');
		console.log(`   3. Choose model: ${testModel}`);
		console.log('   4. Start chatting with your AI companion!\n');
	} catch (error) {
		if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
			console.error('❌ Cannot connect to Ollama\n');
			console.log('💡 Make sure Ollama is installed and running:');
			console.log('   • Install: https://ollama.com');
			console.log('   • Start: ollama serve');
			console.log(`   • URL: ${OLLAMA_BASE_URL}\n`);
		} else {
			console.error('❌ Error:', error.message);
		}
		process.exit(1);
	}
}

checkOllama();
