'use server';
/**
 * @fileOverview Stable & fine-tuned Genkit flow for analyzing a presentation.
 *
 * Ensures consistent scoring and feedback.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePresentationInputSchema = z.object({
  presentationPdf: z
    .string()
    .describe(
      "A PDF of a presentation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type AnalyzePresentationInput = z.infer<typeof AnalyzePresentationInputSchema>;

const AnalyzePresentationOutputSchema = z.object({
  overallScore: z.number().describe('Overall score (0–100), computed as average of category scores.'),
  categoryScores: z.object({
    content: z.number().describe('Score for clarity, depth, and accuracy of content (0–100).'),
    design: z.number().describe('Score for visual appeal, readability, and formatting (0–100).'),
    structure: z.number().describe('Score for logical flow, transitions, and cohesion (0–100).'),
    engagement: z.number().describe('Score for storytelling, interactivity, and audience connection (0–100).'),
    dataUse: z.number().describe('Score for effective use of charts, data, and evidence (0–100).'),
  }),
  feedback: z.string().describe('Comprehensive feedback on strengths and weaknesses.'),
  slideBySlideSuggestions: z.array(
    z.object({
      slideNumber: z.number().describe('The slide number.'),
      strengths: z.string().describe('What this slide does well.'),
      weaknesses: z.string().describe('What needs improvement.'),
      suggestion: z.string().describe('One specific, actionable suggestion.'),
    })
  ).describe('Detailed evaluation of each slide.'),
});
export type AnalyzePresentationOutput = z.infer<typeof AnalyzePresentationOutputSchema>;

export async function analyzePresentation(input: AnalyzePresentationInput): Promise<AnalyzePresentationOutput> {
  return analyzePresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePresentationPrompt',
  input: { schema: AnalyzePresentationInputSchema },
  output: { schema: AnalyzePresentationOutputSchema },
  config: {
    temperature: 0,   // ✅ makes output deterministic
    top_p: 1,         // ✅ ensures highest probability tokens only
  },
  prompt: `
You are a **professional presentation evaluator**. 
Analyze the provided PDF carefully and return a structured, consistent evaluation.

### Scoring Rubric:
- **Content**: Relevance, clarity, accuracy, depth (0–100).
- **Design**: Visual appeal, readability, alignment, color/contrast (0–100).
- **Structure**: Logical flow, transitions, pacing, cohesion (0–100).
- **Engagement**: Storytelling, attention-keeping, audience resonance (0–100).
- **Data Use**: Clarity and accuracy of charts, evidence, visualizations (0–100).

### Rules:
1. Assign a 0–100 score for each category using the rubric above.
2. **Overall Score = (content + design + structure + engagement + dataUse) ÷ 5 (rounded).**
3. Provide comprehensive feedback on **overall strengths and weaknesses** (3–5 sentences).
4. For each slide, provide:
   - Strengths: at least one positive point.
   - Weaknesses: at least one specific issue.
   - Suggestion: one clear, actionable improvement.
5. Be objective, professional, and **consistent across runs**.
6. Strictly follow the JSON schema — no extra commentary.

Presentation PDF: {{media url=presentationPdf}}
`,
});

const analyzePresentationFlow = ai.defineFlow(
  {
    name: 'analyzePresentationFlow',
    inputSchema: AnalyzePresentationInputSchema,
    outputSchema: AnalyzePresentationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
