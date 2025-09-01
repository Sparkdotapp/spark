'use server';
/**
 * @fileOverview A Genkit flow for analyzing a presentation.
 *
 * - analyzePresentation - Analyzes a presentation and provides feedback and a score.
 * - AnalyzePresentationInput - The input type for the analyzePresentation function.
 * - AnalyzePresentationOutput - The return type for the analyzePresentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePresentationInputSchema = z.object({
  presentationPdf: z
    .string()
    .describe(
      "A PDF of a presentation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type AnalyzePresentationInput = z.infer<typeof AnalyzePresentationInputSchema>;

const AnalyzePresentationOutputSchema = z.object({
  overallScore: z.number().describe('An overall score for the presentation from 0 to 100.'),
  feedback: z.string().describe('General feedback on the presentation\'s strengths and weaknesses.'),
  slideBySlideSuggestions: z.array(z.object({
    slideNumber: z.number().describe('The slide number.'),
    suggestion: z.string().describe('A specific suggestion for improving the slide.'),
  })).describe('A list of suggestions for each slide.'),
});
export type AnalyzePresentationOutput = z.infer<typeof AnalyzePresentationOutputSchema>;

export async function analyzePresentation(input: AnalyzePresentationInput): Promise<AnalyzePresentationOutput> {
  return analyzePresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePresentationPrompt',
  input: {schema: AnalyzePresentationInputSchema},
  output: {schema: AnalyzePresentationOutputSchema},
  prompt: `You are an expert presentation evaluator. Evaluate this presentation based on the following criteria: Content, Design, Structure, and Engagement.

The user has provided a PDF of their presentation. Analyze it and provide feedback.

Presentation PDF: {{media url=presentationPdf}}

Provide:
- An overall score (0-100).
- General feedback on the presentation's strengths and weaknesses.
- Slide-by-slide suggestions for improvement. Be specific and tie your feedback to the content of each slide.
`,
});

const analyzePresentationFlow = ai.defineFlow(
  {
    name: 'analyzePresentationFlow',
    inputSchema: AnalyzePresentationInputSchema,
    outputSchema: AnalyzePresentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
