'use server';

/**
 * @fileOverview An AI agent that provides community recommendations based on user interests and project involvement.
 *
 * - getCommunityRecommendations - A function that handles the community recommendation process.
 * - CommunityRecommendationsInput - The input type for the getCommunityRecommendations function.
 * - CommunityRecommendationsOutput - The return type for the getCommunityRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CommunityProfileSchema = z.object({
  name: z.string().describe('The name of the community.'),
  description: z.string().describe('A short description of the community.'),
  interests: z.array(z.string()).describe('List of interests related to the community.'),
  attributes: z.array(z.string()).describe('List of attributes for the community.'),
});

const UserProfileSchema = z.object({
  interests: z.array(z.string()).describe('The user specified interests.'),
  projects: z.array(z.string()).describe('The user projects.'),
});

const CommunityRecommendationsInputSchema = z.object({
  userProfile: UserProfileSchema.describe('The profile of the user.'),
  communityProfiles: z.array(CommunityProfileSchema).describe('A list of community profiles to consider.'),
});
export type CommunityRecommendationsInput = z.infer<typeof CommunityRecommendationsInputSchema>;

const CommunityRecommendationSchema = z.object({
  name: z.string().describe('The name of the recommended community.'),
  reason: z.string().describe('The reason why this community is recommended for the user.'),
});

const CommunityRecommendationsOutputSchema = z.object({
  recommendations: z.array(CommunityRecommendationSchema).describe('A list of community recommendations for the user.'),
});
export type CommunityRecommendationsOutput = z.infer<typeof CommunityRecommendationsOutputSchema>;

export async function getCommunityRecommendations(input: CommunityRecommendationsInput): Promise<CommunityRecommendationsOutput> {
  return communityRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'communityRecommendationsPrompt',
  input: {schema: CommunityRecommendationsInputSchema},
  output: {schema: CommunityRecommendationsOutputSchema},
  prompt: `You are a community recommendation expert. Given a user profile and a list of community profiles, you will recommend the most relevant communities to the user.

  User Profile:
  Interests: {{userProfile.interests}}
  Projects: {{userProfile.projects}}

  Community Profiles:
  {{#each communityProfiles}}
  Name: {{name}}
  Description: {{description}}
  Interests: {{interests}}
  Attributes: {{attributes}}
  {{/each}}

  For each recommended community, explain the reason why it is recommended for the user. Be concise.

  Return the recommendations in the following format:
  {{outputFormatSchema}}
  `,
});

const communityRecommendationsFlow = ai.defineFlow(
  {
    name: 'communityRecommendationsFlow',
    inputSchema: CommunityRecommendationsInputSchema,
    outputSchema: CommunityRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      ...input,
    });
    return output!;
  }
);
