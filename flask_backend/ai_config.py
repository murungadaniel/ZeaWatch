import os
from dotenv import load_dotenv
from genkit import genkit
from firebase_genkit_googleai import googleai # Use the correct Python import

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

API_KEY = os.getenv("GOOGLE_GENAI_API_KEY")

if not API_KEY:
    print("Warning: GOOGLE_GENAI_API_KEY not found in environment variables. AI features may not work.")
    # You might want to raise an error or handle this more gracefully
    # raise ValueError("GOOGLE_GENAI_API_KEY not set.")

ai = genkit(
    plugins=[
        googleai(api_key=API_KEY),
    ],
    log_level="debug",
    enable_tracing=True,
)
