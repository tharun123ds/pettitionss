'use server';

/**
 * @fileOverview A petition categorization AI agent.
 *
 * - categorizePetition - A function that handles the petition categorization process.
 * - CategorizePetitionInput - The input type for the categorizePetition function.
 * - CategorizePetitionOutput - The return type for the categorizePetition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorySchema = z.enum([
  'environment',
  'health',
  'education',
  'social justice',
  'animal welfare',
  'politics',
  'technology',
  'other',
]);

const CategorizePetitionInputSchema = z.object({
  petitionTitle: z.string().describe('The title of the petition.'),
  petitionDescription: z.string().describe('The description of the petition.'),
});
export type CategorizePetitionInput = z.infer<typeof CategorizePetitionInputSchema>;

const CategorizePetitionOutputSchema = z.object({
  category: CategorySchema.describe('The category of the petition.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the category assignment.'),
});
export type CategorizePetitionOutput = z.infer<typeof CategorizePetitionOutputSchema>;

export async function categorizePetition(input: CategorizePetitionInput): Promise<CategorizePetitionOutput> {
  return categorizePetitionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizePetitionPrompt',
  input: {schema: CategorizePetitionInputSchema},
  output: {schema: CategorizePetitionOutputSchema},
  prompt: `You are an expert in categorizing petitions based on their title and description.

  Given the following petition title and description, determine the most appropriate category for the petition.
  You must respond with a single word from the CategorySchema, and a floating point number between 0 and 1 representing your confidence that you are correct.

  Title: {{{petitionTitle}}}
  Description: {{{petitionDescription}}}
  `,
});

const categorizePetitionFlow = ai.defineFlow(
  {
    name: 'categorizePetitionFlow',
    inputSchema: CategorizePetitionInputSchema,
    outputSchema: CategorizePetitionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
