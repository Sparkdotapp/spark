import {z} from "genkit";

const SlideSchema = z.object({
    title: z.string().describe('The title of the slide.'),
    content: z.string().describe('The main content or bullet points for the slide, in Markdown format.'),
    speakerNotes: z.string().describe('Speaker notes for the presenter.'),
});

export const GeneratePresentationInputSchema = z.object({
    projectName: z.string().describe('The name of the project.'),
    projectDescription: z.string().describe('A detailed description of the project.'),
    targetAudience: z.string().describe('The target audience for the presentation.'),
    numberOfSlides: z.number().min(3).max(10).describe('The number of slides to generate.'),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

export const GeneratePresentationOutputSchema = z.object({
    slides: z.array(SlideSchema).describe('An array of slide objects for the presentation.'),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;
