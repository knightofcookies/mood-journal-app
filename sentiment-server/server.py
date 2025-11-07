"""
Sentiment Analysis Server using DistilBERT
Model: lxyuan/distilbert-base-multilingual-cased-sentiments-student
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for SvelteKit app

# Load the sentiment analysis model
logger.info("Loading sentiment analysis model...")
try:
    sentiment_pipeline = pipeline(
        "sentiment-analysis",
        model="lxyuan/distilbert-base-multilingual-cased-sentiments-student",
        device=-1  # Use CPU; change to 0 for GPU
    )
    logger.info("Model loaded successfully!")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    sentiment_pipeline = None

# Label mapping to standardized format
LABEL_MAP = {
    "positive": "POSITIVE",
    "negative": "NEGATIVE",
    "neutral": "NEUTRAL"
}

def convert_to_score(label: str, confidence: float) -> int:
    """
    Convert sentiment label and confidence to -100 to +100 scale.
    
    Args:
        label: Sentiment label (positive/negative/neutral)
        confidence: Confidence score (0-1)
    
    Returns:
        Integer score from -100 to +100
    """
    if label.lower() == "positive":
        return int(confidence * 100)
    elif label.lower() == "negative":
        return int(confidence * -100)
    else:  # neutral
        # For neutral, map to range around 0 (-20 to +20)
        return int((confidence - 0.5) * 40)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": sentiment_pipeline is not None
    })

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """
    Analyze sentiment of provided text.
    
    Expected JSON body:
    {
        "text": "Your text here"
    }
    
    Returns:
    {
        "label": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
        "score": -100 to +100,
        "confidence": 0.0 to 1.0,
        "processing_time": milliseconds
    }
    """
    start_time = time.time()
    
    try:
        # Validate request
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        text = data.get("text", "").strip()
        
        if not text:
            return jsonify({"error": "Text field is required and cannot be empty"}), 400
        
        if len(text) > 10000:
            return jsonify({"error": "Text exceeds maximum length of 10000 characters"}), 400
        
        # Check if model is loaded
        if sentiment_pipeline is None:
            return jsonify({"error": "Sentiment model not loaded"}), 503
        
        # Perform sentiment analysis
        logger.info(f"Analyzing text (length: {len(text)} chars)")
        result = sentiment_pipeline(text[:512])[0]  # DistilBERT max length is 512 tokens
        
        # Convert result
        raw_label = result["label"].lower()
        confidence = result["score"]
        standardized_label = LABEL_MAP.get(raw_label, "NEUTRAL")
        sentiment_score = convert_to_score(raw_label, confidence)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        logger.info(f"Analysis complete: {standardized_label} ({sentiment_score}) - {processing_time}ms")
        
        return jsonify({
            "label": standardized_label,
            "score": sentiment_score,
            "confidence": round(confidence, 4),
            "processing_time": processing_time
        })
    
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/batch', methods=['POST'])
def analyze_batch():
    """
    Analyze sentiment for multiple texts in batch.
    
    Expected JSON body:
    {
        "texts": ["text1", "text2", ...]
    }
    
    Returns:
    {
        "results": [
            {"label": "POSITIVE", "score": 85, "confidence": 0.85},
            ...
        ],
        "processing_time": milliseconds
    }
    """
    start_time = time.time()
    
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        texts = data.get("texts", [])
        
        if not isinstance(texts, list):
            return jsonify({"error": "texts must be an array"}), 400
        
        if not texts:
            return jsonify({"error": "texts array cannot be empty"}), 400
        
        if len(texts) > 100:
            return jsonify({"error": "Maximum 100 texts per batch"}), 400
        
        if sentiment_pipeline is None:
            return jsonify({"error": "Sentiment model not loaded"}), 503
        
        # Truncate texts to max length
        truncated_texts = [text[:512] for text in texts]
        
        # Perform batch analysis
        logger.info(f"Analyzing batch of {len(texts)} texts")
        raw_results = sentiment_pipeline(truncated_texts)
        
        # Convert results
        results = []
        for result in raw_results:
            raw_label = result["label"].lower()
            confidence = result["score"]
            standardized_label = LABEL_MAP.get(raw_label, "NEUTRAL")
            sentiment_score = convert_to_score(raw_label, confidence)
            
            results.append({
                "label": standardized_label,
                "score": sentiment_score,
                "confidence": round(confidence, 4)
            })
        
        processing_time = int((time.time() - start_time) * 1000)
        
        logger.info(f"Batch analysis complete: {len(results)} texts - {processing_time}ms")
        
        return jsonify({
            "results": results,
            "processing_time": processing_time
        })
    
    except Exception as e:
        logger.error(f"Error analyzing batch: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = 5001
    logger.info(f"Starting sentiment analysis server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
