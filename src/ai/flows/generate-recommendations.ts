// Implemented the generateTreatmentRecommendations flow to provide AI-generated recommendations for treatment and prevention of maize leaf diseases.

'use server';

/**
 * @fileOverview A flow for generating treatment and prevention recommendations for maize leaf diseases.
 *
 * - generateTreatmentRecommendations - A function that generates treatment recommendations for maize leaf diseases.
 * - TreatmentRecommendationsInput - The input type for the generateTreatmentRecommendations function.
 * - TreatmentRecommendationsOutput - The return type for the generateTreatmentRecommendations function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TreatmentRecommendationsInputSchema = z.object({
  diseaseName: z.string().describe('The name of the identified disease.'),
  region: z.string().describe('The region where the user is farming.'),
  farmingPractices: z.string().describe('The farming practices used by the user.'),
});

export type TreatmentRecommendationsInput = z.infer<typeof TreatmentRecommendationsInputSchema>;

const TreatmentRecommendationsOutputSchema = z.object({
  treatmentRecommendations: z.array(z.string()).describe('A list of treatment recommendations for the identified disease.'),
  preventiveMeasures: z.array(z.string()).describe('A list of preventive measures to avoid the disease.'),
});

export type TreatmentRecommendationsOutput = z.infer<typeof TreatmentRecommendationsOutputSchema>;

export async function generateTreatmentRecommendations(
  input: TreatmentRecommendationsInput
): Promise<TreatmentRecommendationsOutput> {
  return generateTreatmentRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'treatmentRecommendationsPrompt',
  input: {
    schema: z.object({
      diseaseName: z.string().describe('The name of the identified disease.'),
      region: z.string().describe('The region where the user is farming.'),
      farmingPractices: z.string().describe('The farming practices used by the user.'),
    }),
  },
  output: {
    schema: z.object({
      treatmentRecommendations: z.array(z.string()).describe('A list of treatment recommendations for the identified disease.'),
      preventiveMeasures: z.array(z.string()).describe('A list of preventive measures to avoid the disease.'),
    }),
  },
  prompt: `You are an agricultural expert providing treatment and prevention recommendations for maize leaf diseases.

  Disease: {{{diseaseName}}}
  Region: {{{region}}}
  Farming Practices: {{{farmingPractices}}}

  Provide specific treatment recommendations and preventive measures tailored to the region and farming practices.  Return them as a JSON array.
  `,
});

const generateTreatmentRecommendationsFlow = ai.defineFlow<
  typeof TreatmentRecommendationsInputSchema,
  typeof TreatmentRecommendationsOutputSchema
>(
  {
    name: 'generateTreatmentRecommendationsFlow',
    inputSchema: TreatmentRecommendationsInputSchema,
    outputSchema: TreatmentRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
