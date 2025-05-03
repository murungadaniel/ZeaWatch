// This is an auto-generated file from Firebase Studio.

'use server';

/**
 * @fileOverview Generates a detailed description of a maize leaf disease based on the diagnosis from image analysis.
 *
 * - generateDiseaseDescription - A function that handles the disease description generation process.
 * - GenerateDiseaseDescriptionInput - The input type for the generateDiseaseDescription function.
 * - GenerateDiseaseDescriptionOutput - The return type for the generateDiseaseDescription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateDiseaseDescriptionInputSchema = z.object({
  diseaseName: z.string().describe('The name of the disease detected in the maize leaf.'),
  confidence: z.number().describe('The confidence score of the disease detection (0-1).'),
  description: z.string().describe('A brief description of the disease.'),
  solutions: z.array(z.string()).describe('Recommended solutions to address the disease.'),
  preventiveMeasures: z.array(z.string()).describe('Preventive measures to avoid the disease.'),
});
export type GenerateDiseaseDescriptionInput = z.infer<typeof GenerateDiseaseDescriptionInputSchema>;

const GenerateDiseaseDescriptionOutputSchema = z.object({
  detailedDescription: z.string().describe('A detailed description of the disease, including causes, symptoms, and potential impact.'),
});
export type GenerateDiseaseDescriptionOutput = z.infer<typeof GenerateDiseaseDescriptionOutputSchema>;

export async function generateDiseaseDescription(
  input: GenerateDiseaseDescriptionInput
): Promise<GenerateDiseaseDescriptionOutput> {
  return generateDiseaseDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiseaseDescriptionPrompt',
  input: {
    schema: z.object({
      diseaseName: z.string().describe('The name of the disease detected in the maize leaf.'),
      confidence: z.number().describe('The confidence score of the disease detection (0-1).'),
      description: z.string().describe('A brief description of the disease.'),
      solutions: z.array(z.string()).describe('Recommended solutions to address the disease.'),
      preventiveMeasures: z.array(z.string()).describe('Preventive measures to avoid the disease.'),
    }),
  },
  output: {
    schema: z.object({
      detailedDescription: z
        .string()
        .describe('A detailed description of the disease, including causes, symptoms, and potential impact.'),
    }),
  },
  prompt: `You are an expert in maize leaf diseases. Based on the following information, generate a detailed description of the disease, including its causes, symptoms, and potential impact on the maize crop.

Disease Name: {{{diseaseName}}}
Confidence: {{{confidence}}}
Description: {{{description}}}
Solutions: {{#each solutions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Preventive Measures: {{#each preventiveMeasures}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Detailed Description:`,
});

const generateDiseaseDescriptionFlow = ai.defineFlow<
  typeof GenerateDiseaseDescriptionInputSchema,
  typeof GenerateDiseaseDescriptionOutputSchema
>(
  {
    name: 'generateDiseaseDescriptionFlow',
    inputSchema: GenerateDiseaseDescriptionInputSchema,
    outputSchema: GenerateDiseaseDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
