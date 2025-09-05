'use server';
/**
 * @fileOverview A Genkit flow for generating a polished, persuasive pitch deck.
 *
 * - generatePresentation - Generates a high-quality presentation based on project details.
 */

import { ai } from '@/ai/genkit';
import {
  GeneratePresentationInput,
  GeneratePresentationInputSchema,
  GeneratePresentationOutput,
  GeneratePresentationOutputSchema,
} from '@/ai/flows/types/generate-presentation';

export async function generatePresentation(
  input: GeneratePresentationInput
): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePresentationPrompt',
  input: { schema: GeneratePresentationInputSchema },
  output: { schema: GeneratePresentationOutputSchema },
  prompt: `You are an award-winning pitch deck designer and startup storyteller. 
Your task is to create a compelling, polished, and professional {{numberOfSlides}}-slide presentation for the project below.

Project Name: **{{{projectName}}}**
Project Description: **{{{projectDescription}}}**
Target Audience: **{{{targetAudience}}}**

### Requirements:
- Create **{{numberOfSlides}} distinct slides**.
- Each slide must include:
  1. **Title** → short, impactful, and audience-relevant.
  2. **Content** → concise text or bullet points in **Markdown** (3–6 points max).
  3. **Speaker Notes** → persuasive talking points, storytelling, or real-world analogies (2–4 sentences).
- Slides should flow logically like a real pitch deck.
- **Keep it engaging**: mix data-driven insights, storytelling, and persuasive hooks.

### Recommended Slide Flow (adapt/adapt order if fewer slides are requested):
1. **Introduction / Problem** – Start with a hook. Define the pain point clearly.
2. **Solution** – How does the project solve the problem? Highlight uniqueness.
3. **Key Features / Demo** – Show product strengths, use cases, or demo highlights.
4. **Market / Audience Fit** – Who needs this? Size of opportunity. Why now?
5. **Business / Value Model** – How does it sustain itself? (Revenue, impact, adoption.)
6. **Traction / Proof** – Early wins, case studies, testimonials (if applicable).
7. **Team / Expertise** – Why this team is the best to solve this problem.
8. **Call to Action / Next Steps** – Clear ask for audience (investment, adoption, feedback).

### Style Guidelines:
- Use **bold** and **headers** to highlight key points.
- Avoid walls of text → prefer short, impactful statements.
- Content must **resonate with the given audience** (e.g., investors want ROI, students want learning outcomes, users want ease-of-use).
- Keep tone **professional but persuasive**.
- If {{numberOfSlides}} < 7, merge relevant sections while keeping flow intact.
- If {{numberOfSlides}} > 7, expand with supporting slides (e.g., competition analysis, roadmap, financials, use cases).

Now generate the {{numberOfSlides}} slides with:
- **Slide Title**
- **Content (Markdown bullet points)**
- **Speaker Notes (persuasive narrative)**`,
});

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
