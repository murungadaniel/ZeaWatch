# ZeaWatch - Maize Disease Detection

This is a Next.js application built with Firebase Studio that uses AI to detect diseases in maize leaves.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**

    *   Rename the `.env.example` file (if one exists) or create a new file named `.env` in the root of your project.
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

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    This will typically start the Next.js application on `http://localhost:9002`.

5.  **Run the Genkit development server (in a separate terminal):**
    ```bash
    npm run genkit:dev
    # or use watch mode for automatic restarts on AI flow changes
    npm run genkit:watch
    ```
    This will start the Genkit server, which is necessary for the AI functionalities to work. It usually runs on `http://localhost:4000` by default, but check your terminal output.

6.  Open [http://localhost:9002](http://localhost:9002) (or your configured Next.js port) with your browser to see the application.

## Core Features

-   **Image Input**: Capture or upload an image of a maize leaf.
-   **Disease Prediction Display**: Shows the AI's prediction (e.g., "Leaf Blight Detected") with a confidence score, disease description, recommended solutions, and preventive measures.
-   **Scan History**: Stores a history of scans locally on the device.

## Tech Stack

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   ShadCN UI Components
-   Genkit (for AI integration with Google Gemini)
-   Lucide Icons

## Project Structure (Key Directories)

```
.
├── public/              # Static assets
├── src/
│   ├── ai/              # Genkit AI flows and configuration
│   │   ├── flows/       # Specific AI tasks (e.g., disease detection)
│   │   └── ai-instance.ts # Genkit initialization
│   ├── app/             # Next.js App Router (pages, layouts)
│   ├── components/      # Reusable UI components
│   │   └── ui/          # ShadCN UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── services/        # Services (e.g., calling AI flows)
│   └── types.ts         # TypeScript type definitions
├── .env                 # Environment variables (API keys, etc.)
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Environment Variables

*   `GOOGLE_GENAI_API_KEY`: Your API key for Google AI (Gemini). See "Set up Environment Variables" section.

## Troubleshooting

*   **"GenkitError: FAILED_PRECONDITION: Please pass in the API key..."**:
    *   Ensure you have a `.env` file in the root of your project.
    *   Verify that `GOOGLE_GENAI_API_KEY` is correctly set in your `.env` file.
    *   Make sure you have restarted both the Next.js development server (`npm run dev`) and the Genkit server (`npm run genkit:dev`) after setting the API key.
    *   Confirm that the Generative Language API (Gemini API) is enabled for your Google Cloud project associated with the API key.
*   **Camera not working**:
    *   Ensure your browser has permission to access the camera. You should be prompted when trying to use the camera feature.
    *   Check your browser settings if you accidentally denied permission.
    *   Make sure no other application is currently using your camera.
*   **AI analysis errors**:
    *   Check the console output in both your browser and the terminal running `npm run genkit:dev` for more detailed error messages.
    *   Ensure the `GOOGLE_GENAI_API_KEY` is valid and has the necessary permissions.
    *   The AI model might sometimes return unexpected results or fail to process an image. Try with a different image.
```