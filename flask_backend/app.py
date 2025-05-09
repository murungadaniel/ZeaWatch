import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio

# Ensure ai_config is imported to initialize Genkit and load .env before other flow imports
from .ai_config import ai, API_KEY # Import ai to ensure it's initialized
from .flows.detect_maize_disease import detect_maize_disease as detect_maize_disease_ai_flow
from .flows.schemas import DetectMaizeDiseaseInputSchema, DetectMaizeDiseaseOutputSchema


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes, allowing requests from your Next.js frontend

# Asynchronous helper for running asyncio code in Flask
def async_wrapper(fn):
    def wrapper(*args, **kwargs):
        return asyncio.run(fn(*args, **kwargs))
    # Flask expects the function name to be unique for routing
    wrapper.__name__ = fn.__name__
    return wrapper


@app.route('/api/detect-disease', methods=['POST'])
@async_wrapper
async def handle_detect_disease():
    if not API_KEY:
        return jsonify({"error": "AI Service not configured: Missing API Key"}), 500
        
    data = request.get_json()
    if not data or 'imageDataUri' not in data:
        return jsonify({"error": "Missing imageDataUri in request"}), 400

    try:
        input_schema = DetectMaizeDiseaseInputSchema(imageDataUri=data['imageDataUri'])
    except Exception as e: # Pydantic validation error
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400

    try:
        result = await detect_maize_disease_ai_flow(input_schema)
        # Convert Pydantic model to dict for jsonify
        return jsonify(result.model_dump())
    except Exception as e:
        print(f"Error in /api/detect-disease: {e}")
        # Return a generic error that matches the expected structure if possible
        error_output = DetectMaizeDiseaseOutputSchema(
            diseaseName="API Error",
            confidence=0.0,
            description=f"An internal server error occurred: {str(e)}",
            solutions=[],
            preventiveMeasures=[]
        )
        return jsonify(error_output.model_dump()), 500

@app.route('/', methods=['GET'])
def home():
    return "ZeaWatch Flask Backend is running!"

if __name__ == '__main__':
    # Ensure Genkit is initialized (though ai_config.py should handle it on import)
    print(f"Flask backend starting with Genkit AI instance: {ai}")
    if not API_KEY:
        print("CRITICAL: GOOGLE_GENAI_API_KEY is not set. AI features will fail.")
    
    port = int(os.environ.get("FLASK_PORT", 5001))
    app.run(debug=True, port=port, host='0.0.0.0')
