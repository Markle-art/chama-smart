'use server';
/**
 * @fileOverview An AI agent for predicting whether a chama will achieve its savings goal.
 *
 * - predictSavingsGoal - A function that handles the savings goal prediction process.
 * - PredictSavingsGoalInput - The input type for the predictSavingsGoal function.
 * - PredictSavingsGoalOutput - The return type for the predictSavingsGoal function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictSavingsGoalInputSchema = z.object({
  chamaId: z.string().describe('The ID of the chama.'),
  currentTotalContributions: z.number().describe('The total amount contributed to date.'),
  targetGoalAmount: z.number().describe('The target savings goal amount for the chama.'),
  targetDate: z.string().datetime().describe('The target date by which the goal should be reached (ISO 8601 format).'),
  startDate: z.string().datetime().describe('The start date of the chama (ISO 8601 format).'),
  contributionHistory: z.array(
    z.object({
      amount: z.number().describe('The amount of a single contribution.'),
      date: z.string().datetime().describe('The date of a single contribution (ISO 8601 format).'),
    })
  ).describe('A historical list of contributions with amounts and dates.'),
});
export type PredictSavingsGoalInput = z.infer<typeof PredictSavingsGoalInputSchema>;

const PredictSavingsGoalOutputSchema = z.object({
  willReachGoal: z.boolean().describe('True if the AI predicts the chama will reach its goal, false otherwise.'),
  predictedCompletionDate: z.string().datetime().nullable().describe('The predicted date when the goal will be reached, or null if unlikely to reach.'),
  projectedShortfallOrSurplus: z.number().describe('The projected amount the chama will be short (negative) or in surplus (positive) by the target date.'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score (0.0 to 1.0) for the prediction, where 1.0 is high confidence.'),
  reasoning: z.string().describe('A natural language explanation for the prediction, including key factors considered.'),
});
export type PredictSavingsGoalOutput = z.infer<typeof PredictSavingsGoalOutputSchema>;

export async function predictSavingsGoal(input: PredictSavingsGoalInput): Promise<PredictSavingsGoalOutput> {
  return predictSavingsGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictSavingsGoalPrompt',
  input: { schema: PredictSavingsGoalInputSchema },
  output: { schema: PredictSavingsGoalOutputSchema },
  prompt: `You are an expert financial analyst specializing in predicting savings goal attainment for group savings schemes (chamas).
Your task is to analyze the provided chama financial data and predict whether it will reach its target goal by the specified date.

Here is the chama's financial data:
- Chama ID: {{{chamaId}}}
- Current Total Contributions: KES {{{currentTotalContributions}}}
- Target Goal Amount: KES {{{targetGoalAmount}}}
- Target Date: {{{targetDate}}}
- Start Date: {{{startDate}}}
- Contribution History: 
{{#each contributionHistory}}
  - Date: {{{date}}}, Amount: KES {{{amount}}}
{{/each}}

Analyze the contribution patterns (frequency, average amount, recent trends) from the contribution history.
Calculate the current average contribution rate.
Project the total contributions by the target date based on these patterns.

Based on your analysis, determine:
1. Will the chama reach its target goal amount by the target date?
2. What is the predicted date of completion? If it's unlikely to reach, set this to null.
3. What is the projected shortfall (negative value) or surplus (positive value) by the target date?
4. Provide a confidence score for your prediction (0.0 to 1.0).
5. Provide a clear, concise reasoning for your prediction, explaining the key factors like average contribution rate, remaining time, and any observed trends.

Return your answer in the specified JSON format.`,
});

const predictSavingsGoalFlow = ai.defineFlow(
  {
    name: 'predictSavingsGoalFlow',
    inputSchema: PredictSavingsGoalInputSchema,
    outputSchema: PredictSavingsGoalOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a prediction from the AI model.');
    }
    return output;
  }
);
