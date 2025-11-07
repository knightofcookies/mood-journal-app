# Sentiment Analysis Server

A lightweight Flask server for sentiment analysis using the DistilBERT model.

## Model

**lxyuan/distilbert-base-multilingual-cased-sentiments-student**
- Multilingual support (40+ languages)
- Fast and efficient (distilled model)
- Outputs: positive, negative, neutral

## Setup

### Windows

1. Install Python 3.8+ if not already installed
2. Run the startup script:
   ```cmd
   start.bat
   ```

The script will:
- Create a virtual environment
- Install dependencies
- Start the server on http://localhost:5001

### Manual Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python server.py
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Analyze Single Text
```
POST /analyze
Content-Type: application/json

{
  "text": "I love this app! It's amazing!"
}
```

Response:
```json
{
  "label": "POSITIVE",
  "score": 95,
  "confidence": 0.9543,
  "processing_time": 45
}
```

### Analyze Batch
```
POST /batch
Content-Type: application/json

{
  "texts": ["Great!", "This is terrible.", "It's okay."]
}
```

Response:
```json
{
  "results": [
    {"label": "POSITIVE", "score": 92, "confidence": 0.92},
    {"label": "NEGATIVE", "score": -88, "confidence": 0.88},
    {"label": "NEUTRAL", "score": 5, "confidence": 0.76}
  ],
  "processing_time": 120
}
```

## Score System

- **POSITIVE**: 0 to +100 (higher = more positive)
- **NEGATIVE**: 0 to -100 (lower = more negative)
- **NEUTRAL**: -20 to +20 (close to zero)

The score combines the label with confidence to provide a nuanced sentiment measurement.

## Performance

- First request: ~2-3 seconds (model loading + inference)
- Subsequent requests: ~50-200ms per text
- Batch processing: More efficient for multiple texts

## GPU Support

To use GPU acceleration (if available):

1. Install CUDA-compatible PyTorch:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

2. Edit `server.py` and change:
   ```python
   device=-1  # CPU
   ```
   to:
   ```python
   device=0  # GPU
   ```

## Troubleshooting

### Port Already in Use
If port 5001 is already in use, edit `server.py` and change:
```python
port = 5001
```

### Model Download Issues
The model (~500MB) downloads automatically on first run. If download fails:
- Check internet connection
- Try again (downloads resume automatically)
- Manually download from: https://huggingface.co/lxyuan/distilbert-base-multilingual-cased-sentiments-student

### Memory Issues
The model requires ~2GB RAM. If you encounter memory errors:
- Close other applications
- Consider using a smaller model
- Enable swap space

## Development

### Testing the API

Using curl:
```bash
curl -X POST http://localhost:5001/analyze \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"This is a test\"}"
```

Using PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/analyze" -Method Post -ContentType "application/json" -Body '{"text": "This is a test"}'
```

### Logs

The server logs all requests with:
- Text length
- Processing time
- Sentiment result

Check console output for debugging.
