// Updated service to call the Flask API backend.

'use client'; // This service is now called from client components

// Re-defining the type here as the source of truth is now the Flask backend
// or a shared types definition if this were a larger monorepo.
// For simplicity, we define it here based on the expected Flask response.
export interface DiseasePrediction {
  diseaseName: string;
  confidence: number;
  description: string;
  solutions: string[];
  preventiveMeasures: string[];
}

/**
 * Asynchronously detects diseases from a maize leaf image by calling the Flask backend.
 *
 * @param imageDataUri The data URI of the maize leaf image (e.g., "data:image/jpeg;base64,...").
 * @returns A promise that resolves to a DiseasePrediction object from the Flask API.
 */
export async function detectDisease(imageDataUri: string): Promise<DiseasePrediction> {
  console.log("Service: Calling Flask API /api/detect-disease");
  try {
    const response = await fetch('http://localhost:5001/api/detect-disease', { // Assuming Flask runs on port 5001
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageDataUri }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error("Error from Flask API:", errorData);
      throw new Error(errorData.message || `Flask API request failed with status ${response.status}`);
    }

    const result: DiseasePrediction = await response.json();
    console.log("Service: Received result from Flask API:", result.diseaseName);
    return result;

  } catch (error) {
    console.error("Error calling Flask API /api/detect-disease:", error);
    // Return a structured error response matching the expected output format
    return {
      diseaseName: "Analysis Error",
      confidence: 0,
      description: error instanceof Error ? error.message : "An unexpected error occurred while communicating with the AI service.",
      solutions: [],
      preventiveMeasures: [],
    };
  }
}
