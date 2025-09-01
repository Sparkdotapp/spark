'use server';
/**
 * @fileOverview A Genkit flow for creating dynamic event summaries.
 *
 * - summarizeEventDescription - A function that generates a concise summary of an event description.
 * - SummarizeEventDescriptionInput - The input type for the summarizeEventDescription function.
 * - SummarizeEventDescriptionOutput - The return type for the summarizeEventDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEventDescriptionInputSchema = z.object({
  eventDescription: z.string().describe('The detailed description of the event.'),
});
export type SummarizeEventDescriptionInput = z.infer<typeof SummarizeEventDescriptionInputSchema>;

const SummarizeEventDescriptionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the event description.'),
});
export type SummarizeEventDescriptionOutput = z.infer<typeof SummarizeEventDescriptionOutputSchema>;

export async function summarizeEventDescription(input: SummarizeEventDescriptionInput): Promise<SummarizeEventDescriptionOutput> {
  return summarizeEventDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeEventDescriptionPrompt',
  input: {schema: SummarizeEventDescriptionInputSchema},
  output: {schema: SummarizeEventDescriptionOutputSchema},
  prompt: `You are an expert event summarizer. Your goal is to create a concise and engaging summary of an event description.

Event Description: {{{eventDescription}}}

Concise Summary:`,
});

const summarizeEventDescriptionFlow = ai.defineFlow(
  {
    name: 'summarizeEventDescriptionFlow',
    inputSchema: SummarizeEventDescriptionInputSchema,
    outputSchema: SummarizeEventDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
