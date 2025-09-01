'use server';
/**
 * @fileOverview A Genkit flow for generating a presentation slide deck.
 *
 * - generatePresentation - Generates a presentation based on project details.
 */

import {ai} from '@/ai/genkit';
import {
    GeneratePresentationInput,
    GeneratePresentationInputSchema,
    GeneratePresentationOutput,
    GeneratePresentationOutputSchema
} from "@/ai/flows/types/generate-presentation";


export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePresentationPrompt',
  input: {schema: GeneratePresentationInputSchema},
  output: {schema: GeneratePresentationOutputSchema},
  prompt: `You are an expert at creating compelling pitch decks. Your task is to generate a {{numberOfSlides}}-slide presentation for the following project.

Project Name: {{{projectName}}}
Project Description: {{{projectDescription}}}
Target Audience: {{{targetAudience}}}

Create a title, content (use markdown for bullet points), and speaker notes for each of the {{numberOfSlides}} slides. The slides should cover the most important aspects for a pitch deck, such as:
1. Introduction/Problem
2. Solution
3. Key Features/Demo
4. Market/Target Audience
5. Business Model
6. Team
7. Call to Action/Next Steps

Adapt the slide topics based on the total number of slides requested.
`,
});

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
