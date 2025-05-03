// This is an auto-generated file from Firebase Studio.

'use server';

/**
 * @fileOverview Detects maize leaf disease from an image using AI.
 *
 * - detectMaizeDisease - A function that handles the disease detection process.
 * - DetectMaizeDiseaseInput - The input type for the detectMaizeDisease function.
 * - DetectMaizeDiseaseOutput - The return type for the detectMaizeDisease function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const DetectMaizeDiseaseInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a maize leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectMaizeDiseaseInput = z.infer<typeof DetectMaizeDiseaseInputSchema>;

// Reusing the structure from the mock service for consistency
const DetectMaizeDiseaseOutputSchema = z.object({
  diseaseName: z.string().describe('The predicted disease name. If no disease is detected or the image is not a maize leaf, indicate that.'),
  confidence: z.number().describe('The confidence score of the prediction (0-1). Set to 0 if no disease detected or not a maize leaf.'),
  description: z.string().describe('A description of the detected disease. Provide helpful information even if no disease is found (e.g., "Leaf appears healthy").'),
  solutions: z.array(z.string()).describe('Recommended solutions to address the disease. Empty array if healthy.'),
  preventiveMeasures: z.array(z.string()).describe('Preventive measures to avoid the disease. Empty array if healthy.'),
});
export type DetectMaizeDiseaseOutput = z.infer<typeof DetectMaizeDiseaseOutputSchema>;

export async function detectMaizeDisease(
  input: DetectMaizeDiseaseInput
): Promise<DetectMaizeDiseaseOutput> {
  console.log("Calling detectMaizeDiseaseFlow with input:", input.imageDataUri.substring(0, 50) + "..."); // Log start
  const result = await detectMaizeDiseaseFlow(input);
  console.log("detectMaizeDiseaseFlow result:", result); // Log result
  return result;

}

const prompt = ai.definePrompt({
  name: 'detectMaizeDiseasePrompt',
  input: {
    schema: DetectMaizeDiseaseInputSchema,
  },
  output: {
    schema: DetectMaizeDiseaseOutputSchema,
  },
  prompt: `Analyze the provided image of a maize leaf. Identify any diseases present.

  Image: {{media url=imageDataUri}}

  Respond with the disease name, confidence score (0-1), a description of the disease (or confirmation of health), recommended solutions, and preventive measures.

  If the image is not a maize leaf or no disease is detected, set diseaseName appropriately (e.g., "Not a Maize Leaf", "Healthy"), confidence to 0, provide a relevant description, and leave solutions/preventiveMeasures as empty arrays.
  Ensure the output strictly adheres to the JSON schema.
  `,
});

const detectMaizeDiseaseFlow = ai.defineFlow<
  typeof DetectMaizeDiseaseInputSchema,
  typeof DetectMaizeDiseaseOutputSchema
>(
  {
    name: 'detectMaizeDiseaseFlow',
    inputSchema: DetectMaizeDiseaseInputSchema,
    outputSchema: DetectMaizeDiseaseOutputSchema,
  },
  async (input) => {
     console.log("Executing detectMaizeDiseaseFlow prompt...");
    try {
        const { output } = await prompt(input);
        if (!output) {
             console.error("AI prompt returned null output");
             throw new Error("AI analysis failed to produce a result.");
        }
        // Basic validation, more robust checks can be added
        if (typeof output.diseaseName !== 'string' || typeof output.confidence !== 'number') {
            console.error("AI output validation failed:", output);
            throw new Error("AI returned data in an unexpected format.");
        }
        console.log("AI prompt execution successful.");
        return output;
    } catch (error) {
      console.error("Error during AI prompt execution:", error);
       // Provide a default error response that matches the schema
       return {
         diseaseName: "Analysis Error",
         confidence: 0,
         description: "An error occurred during the AI analysis. Please check the image or try again later.",
         solutions: [],
         preventiveMeasures: [],
       };
    }
  }
);
