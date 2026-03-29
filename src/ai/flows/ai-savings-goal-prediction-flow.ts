'use server';
/**
 * @fileOverview An AI agent for predicting whether a chama will achieve its savings goal.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictSavingsGoalInputSchema = z.object({
  chamaId: z.string().describe('The ID of the chama.'),
  currentTotalContributions: z.number().describe('The total amount contributed to date.'),
  targetGoalAmount: z.number().describe('The target savings goal amount for the chama.'),
  targetDate: z.string().describe('The target date by which the goal should be reached.'),
  startDate: z.string().describe('The start date of the chama.'),
  contributionHistory: z.array(
    z.object({
      amount: z.number().describe('The amount of a single contribution.'),
      date: z.string().describe('The date of a single contribution.'),
    })
  ).describe('A historical list of contributions with amounts and dates.'),
});

export type PredictSavingsGoalInput = z.infer<typeof PredictSavingsGoalInputSchema>;

const PredictSavingsGoalOutputSchema = z.object({
  willReachGoal: z.boolean().describe('True if the AI predicts the chama will reach its goal.'),
  predictedCompletionDate: z.string().nullable().describe('The predicted date when the goal will be reached, or null.'),
  projectedShortfallOrSurplus: z.number().describe('The projected amount the chama will be short (negative) or in surplus (positive).'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score (0.0 to 1.0) for the prediction.'),
  reasoning: z.string().describe('A natural language explanation for the prediction.'),
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

Analyze the contribution patterns (frequency, average amount, recent trends) and project the total contributions by the target date. Return your assessment in JSON format.`,
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
