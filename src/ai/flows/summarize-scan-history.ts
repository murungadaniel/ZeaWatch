'use server';
/**
 * @fileOverview Summarizes the user's scan history to identify trends and potential problem areas.
 *
 * - summarizeScanHistory - A function that summarizes the user's scan history.
 * - SummarizeScanHistoryInput - The input type for the summarizeScanHistory function.
 * - SummarizeScanHistoryOutput - The return type for the summarizeScanHistory function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeScanHistoryInputSchema = z.object({
  scanHistory: z
    .array(
      z.object({
        scanDate: z.string().describe('The date of the scan.'),
        diseaseName: z.string().describe('The name of the detected disease.'),
        confidence: z.number().describe('The confidence score of the prediction (0-1).'),
      })
    )
    .describe('The user scan history data.'),
});
export type SummarizeScanHistoryInput = z.infer<typeof SummarizeScanHistoryInputSchema>;

const SummarizeScanHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the scan history, highlighting trends and potential problem areas.'),
});
export type SummarizeScanHistoryOutput = z.infer<typeof SummarizeScanHistoryOutputSchema>;

export async function summarizeScanHistory(input: SummarizeScanHistoryInput): Promise<SummarizeScanHistoryOutput> {
  return summarizeScanHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeScanHistoryPrompt',
  input: {
    schema: z.object({
      scanHistory: z
        .array(
          z.object({
            scanDate: z.string().describe('The date of the scan.'),
            diseaseName: z.string().describe('The name of the detected disease.'),
            confidence: z.number().describe('The confidence score of the prediction (0-1).'),
          })
        )
        .describe('The user scan history data.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the scan history, highlighting trends and potential problem areas.'),
    }),
  },
  prompt: `You are an AI assistant that summarizes a user's maize leaf scan history. Analyze the scan history and identify any trends or potential problem areas in their fields. Provide a concise summary of your findings. 

Scan History:
{{#each scanHistory}}
  - Date: {{scanDate}}, Disease: {{diseaseName}}, Confidence: {{confidence}}
{{/each}}
`,
});

const summarizeScanHistoryFlow = ai.defineFlow<
  typeof SummarizeScanHistoryInputSchema,
  typeof SummarizeScanHistoryOutputSchema
>({
  name: 'summarizeScanHistoryFlow',
  inputSchema: SummarizeScanHistoryInputSchema,
  outputSchema: SummarizeScanHistoryOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
