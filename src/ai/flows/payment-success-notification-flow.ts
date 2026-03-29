'use server';
/**
 * @fileOverview Generates an AI success message for group members.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuccessMessageInputSchema = z.object({
  chamaName: z.string(),
  memberName: z.string(),
  amount: z.number(),
  progressPercentage: z.number(),
});

export async function generateSuccessNotification(input: z.infer<typeof SuccessMessageInputSchema>) {
  const prompt = `You are a friendly ChamaSmart assistant. Generate an enthusiastic 1-sentence SMS notification for a student group savings scheme.
  
  Details:
  - Group Name: ${input.chamaName}
  - Member: ${input.memberName}
  - Amount: KES ${input.amount}
  - Current Goal Progress: ${input.progressPercentage.toFixed(1)}%
  
  Example: "Transaction Confirmed! Brian just pushed UoN CS 2024 to 90% of our goal! 🚀"`;

  const { text } = await ai.generate(prompt);
  return text;
}
