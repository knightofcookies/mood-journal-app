# Ollama Local AI Setup

This guide will help you set up Ollama for running local AI models with your mood journal app.

## What is Ollama?

Ollama is a lightweight tool for running large language models locally. Unlike Xenova transformers, Ollama supports:

- **Real models**: Llama 3.2, Gemma 2, Qwen, Phi, and more
- **Better performance**: Optimized for CPU and GPU inference
- **Easy management**: Simple CLI for downloading and managing models
- **Privacy**: All inference happens on your machine

## Installation

### macOS

```bash
# Download and install from the website
# Visit: https://ollama.com

# Or use Homebrew
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows

Download the installer from https://ollama.com

## Starting Ollama

Ollama runs as a background service:

```bash
# macOS/Linux - usually starts automatically
ollama serve

# Check if it's running
curl http://localhost:11434/api/tags
```

## Recommended Models

### Small & Fast (Good for most use cases)

```bash
# Llama 3.2 3B (Default) - Best balance
ollama pull llama3.2:3b

# Llama 3.2 1B - Fastest, lowest memory
ollama pull llama3.2:1b

# Gemma 2 2B - Google's efficient model
ollama pull gemma2:2b
```

### Medium (Better quality, more resources)

```bash
# Qwen 2.5 7B - Excellent performance
ollama pull qwen2.5:7b

# Llama 3.2 8B - Meta's balanced model
ollama pull llama3.2:8b
```

### Large (Best quality, requires powerful hardware)

```bash
# Qwen 2.5 14B - High quality
ollama pull qwen2.5:14b

# Llama 3.1 8B - Latest from Meta
ollama pull llama3.1:8b
```

## Configuration

### Default Settings

The app uses these defaults:

- **Base URL**: `http://localhost:11434`
- **Default Model**: `llama3.2:3b`

### Custom Configuration

Create a `.env` file and add:

```bash
# Custom Ollama endpoint (if running remotely or different port)
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Custom model for sentiment analysis (default: gemma2:2b)
OLLAMA_SENTIMENT_MODEL=gemma2:2b
```

**Note**: Sentiment analysis also works without Ollama using a built-in fallback system.

## Using Local Models in the App

1. **Install Ollama** (see above)
2. **Pull a model**:
   ```bash
   ollama pull llama3.2:3b
   ```
3. **Navigate to AI Settings** in your app
4. **Select "Local (Ollama)"** as your provider
5. **Choose a model** or use the default `llama3.2:3b`
6. **Start chatting!**

## Changing Models

You can change models in the AI settings page. The app will use whatever model you specify. Make sure to pull it first:

```bash
# Check available models
ollama list

# Pull a new model
ollama pull <model-name>

# Example: Pull Gemma 2
ollama pull gemma2:2b
```

## Troubleshooting

### "Ollama is not running"

```bash
# Start Ollama
ollama serve

# Or on macOS/Linux with systemd
sudo systemctl start ollama
```

### "Model not found"

```bash
# List installed models
ollama list

# Pull the model
ollama pull llama3.2:3b
```

### Slow Performance

- Use smaller models (1B-3B parameters)
- Close other applications
- Consider using a cloud provider (Groq is free and fast!)

### Out of Memory

- Use a smaller model:
  ```bash
  ollama pull llama3.2:1b
  ```
- Or switch to a cloud provider

## Comparing Options

| Provider           | Cost      | Speed     | Quality   | Privacy      | Setup  |
| ------------------ | --------- | --------- | --------- | ------------ | ------ |
| **Ollama (Local)** | Free      | Medium    | Good      | 100% Private | Medium |
| **Groq**           | Free      | Very Fast | Excellent | Cloud        | Easy   |
| **OpenAI**         | Paid      | Fast      | Best      | Cloud        | Easy   |
| **Gemini**         | Free tier | Fast      | Excellent | Cloud        | Easy   |

## Recommendations

- **For Privacy**: Use Ollama with `llama3.2:3b`
- **For Speed**: Use Groq (free, cloud-based)
- **For Quality**: Use OpenAI GPT-4o-mini
- **For Free + Quality**: Use Groq or Gemini

## Model Selection Guide

### For Journaling/Mood Tracking:

- **Best Overall**: `llama3.2:3b` or `qwen2.5:3b`
- **Fastest**: `llama3.2:1b`
- **Most Empathetic**: `gemma2:2b`

### System Requirements:

- **1B models**: 2GB RAM
- **3B models**: 4GB RAM
- **7B models**: 8GB RAM
- **14B+ models**: 16GB+ RAM

## Advanced: Remote Ollama

You can run Ollama on a different machine or server:

```bash
# On the server
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# In your .env file
OLLAMA_BASE_URL=http://your-server-ip:11434
```

## Support

For Ollama-specific issues, visit:

- Documentation: https://github.com/ollama/ollama
- Discord: https://discord.gg/ollama
- GitHub: https://github.com/ollama/ollama/issues

For app-specific issues with local AI, check the app logs or switch to a cloud provider temporarily.
