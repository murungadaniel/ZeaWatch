# ZeaWatch - Maize Disease Detection

This is a Next.js application (frontend) with a Flask backend that uses AI to detect diseases in maize leaves.

## Getting Started

### Prerequisites

*   Node.js and npm/yarn/pnpm
*   Python 3.8+ and pip
*   Access to Google AI Studio and a Google AI API Key

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Set up Environment Variables:**
    *   Create a file named `.env` in the root of your project.
    *   Add your Google AI API key to the `.env` file:
        ```env
        GOOGLE_GENAI_API_KEY="YOUR_API_KEY_HERE"
        ```
    *   **How to get a Google AI API Key:**
        1.  Go to the [Google AI Studio](https://aistudio.google.com/).
        2.  Sign in with your Google account.
        3.  Click on "Get API key" in the left sidebar or top navigation.
        4.  Create a new API key or use an existing one.
        5.  Ensure the "Generative Language API" (sometimes referred to as Gemini API) is enabled for your project in the Google Cloud Console if you created the key through a GCP project.
        6.  Copy the generated API key and paste it into your `.env` file.

3.  **Set up Frontend (Next.js):**
    *   Install frontend dependencies:
        ```bash
        npm install
        # or
        yarn install
        # or
        pnpm install
        ```

4.  **Set up Backend (Flask):**
    *   Navigate to the backend directory (if you create one, e.g., `cd flask_backend` - the current setup assumes Flask files are in `flask_backend/` at the root).
    *   Create a Python virtual environment (recommended):
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        ```
    *   Install Python dependencies:
        ```bash
        pip install -r flask_backend/requirements.txt
        ```

### Running the Application

You need to run both the frontend and backend servers in separate terminals.

1.  **Run the Flask Backend Server:**
    *   Make sure your virtual environment is activated.
    *   From the project root:
        ```bash
        npm run flask:dev
        ```
    *   This will typically start the Flask server on `http://localhost:5001`. Check your terminal output.

2.  **Run the Next.js Frontend Development Server:**
    *   From the project root:
        ```bash
        npm run dev
        ```
    *   This will typically start the Next.js application on `http://localhost:9002`.

3.  **Run the Genkit development server (for remaining TypeScript flows, if any):**
    If you still have other Genkit flows running in the Node.js environment (e.g., for features other than disease detection):
    ```bash
    npm run genkit:dev
    # or use watch mode
    npm run genkit:watch
    ```
    This usually runs on `http://localhost:4000`.

4.  Open [http://localhost:9002](http://localhost:9002) (or your configured Next.js port) with your browser to see the application.

## Core Features

-   **Image Input**: Capture or upload an image of a maize leaf.
-   **Disease Prediction Display**: Shows the AI's prediction (e.g., "Leaf Blight Detected") with a confidence score, disease description, recommended solutions, and preventive measures. (Handled by Flask backend)
-   **Scan History**: Stores a history of scans locally on the device.

## Tech Stack

-   **Frontend**:
    -   Next.js (App Router)
    -   React
    -   TypeScript
    -   Tailwind CSS
    -   ShadCN UI Components
    -   Lucide Icons
-   **Backend**:
    -   Flask (Python)
    -   Genkit (Python SDK for AI integration with Google Gemini)
-   **AI**:
    -   Google Gemini

## Project Structure (Key Directories)

```
.
├── public/                  # Static assets for Next.js
├── src/                     # Next.js frontend source
│   ├── app/                 # Next.js App Router (pages, layouts)
│   ├── components/          # Reusable UI components
│   │   └── ui/              # ShadCN UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions for frontend
│   ├── services/            # Services (e.g., calling Flask API)
│   └── types.ts             # TypeScript type definitions for frontend
├── flask_backend/           # Flask backend source
│   ├── flows/               # Python Genkit flows
│   ├── ai_config.py         # Python Genkit initialization
│   ├── app.py               # Main Flask application
│   └── requirements.txt     # Python dependencies
├── .env                     # Environment variables (API keys, etc.)
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration for Next.js
```

## Environment Variables

*   `GOOGLE_GENAI_API_KEY`: Your API key for Google AI (Gemini). Used by both Next.js (if other Genkit flows exist) and Flask backend.
*   `FLASK_PORT` (optional, in `.env`): Port for the Flask server, defaults to 5001.

## Troubleshooting

*   **GenkitError (Flask): "Please pass in the API key..." or "GOOGLE_GENAI_API_KEY not found"**:
    *   Ensure your `.env` file is in the **root** of the project.
    *   Verify that `GOOGLE_GENAI_API_KEY` is correctly set in your `.env` file.
    *   Make sure you have restarted the Flask server after setting the API key.
    *   Confirm `python-dotenv` is installed and `load_dotenv()` is called in `flask_backend/ai_config.py`.
*   **CORS errors in browser console**:
    *   Ensure `Flask-CORS` is installed and `CORS(app)` is initialized in `flask_backend/app.py`.
    *   Verify the Next.js frontend is making requests to the correct Flask server address (e.g., `http://localhost:5001`).
*   **Next.js `detectDisease` service errors**:
    *   Check the browser console and the Flask server terminal for error messages.
    *   Ensure the Flask server is running and accessible at the URL specified in `src/services/disease-detection.ts`.
*   **Camera not working**: (Frontend issue)
    *   Ensure your browser has permission to access the camera.
    *   Check browser settings if you accidentally denied permission.
*   **AI analysis errors (from Flask)**:
    *   Check the Flask server terminal output for detailed error messages from Genkit or the AI model.
    *   Ensure the `GOOGLE_GENAI_API_KEY` is valid.
```