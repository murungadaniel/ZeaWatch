// Updated service to call the actual AI flow.

'use server'; // Ensure this runs on the server where Genkit flows are defined

import { detectMaizeDisease as detectMaizeDiseaseFlow, DetectMaizeDiseaseInput, DetectMaizeDiseaseOutput } from '@/ai/flows/detect-maize-disease';

/**
 * Represents the result of a disease detection analysis.
 * Re-exporting the type from the flow definition for consistency.
 */
export type DiseasePrediction = DetectMaizeDiseaseOutput;

/**
 * Asynchronously detects diseases from a maize leaf image by calling the AI flow.
 *
 * @param imageDataUri The data URI of the maize leaf image (e.g., "data:image/jpeg;base64,...").
 * @returns A promise that resolves to a DiseasePrediction object from the AI flow.
 */
export async function detectDisease(imageDataUri: string): Promise<DiseasePrediction> {
  console.log("Service: Calling AI flow detectMaizeDisease");
  try {
    // Prepare the input for the AI flow
    const input: DetectMaizeDiseaseInput = { imageDataUri };

    // Call the AI flow
    const result = await detectMaizeDiseaseFlow(input);
    console.log("Service: Received result from AI flow:", result.diseaseName);

    // Return the result from the flow
    return result;

  } catch (error) {
     console.error("Error calling detectMaizeDisease flow:", error);
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
