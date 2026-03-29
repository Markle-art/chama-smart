'use server';
/**
 * @fileOverview This file defines a Genkit flow for reconciling M-Pesa transactions
 * to specific chama members using AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const maxDuration = 60;

const MpesaTransactionSchema = z.object({
  TransID: z.string().describe('Unique M-Pesa transaction ID.'),
  TransAmount: z.string().describe('Amount of the transaction in KES.'),
  MSISDN: z.string().describe('Phone number of the sender.'),
  FirstName: z.string().describe('First name of the sender.'),
  BillRefNumber: z.string().optional().describe('Bill reference number provided by the sender.'),
});

const ChamaMemberSchema = z.object({
  id: z.string().describe('Unique identifier for the chama member.'),
  name: z.string().describe('Full name of the chama member.'),
  phone: z.string().describe('Registered M-Pesa phone number of the member.'),
  nicknames: z.array(z.string()).optional().describe('List of known nicknames or aliases for the member.'),
});

const ReconcileMpesaTransactionInputSchema = z.object({
  transaction: MpesaTransactionSchema,
  chamaMembers: z.array(ChamaMemberSchema),
});

export type ReconcileMpesaTransactionInput = z.infer<typeof ReconcileMpesaTransactionInputSchema>;

const ReconcileMpesaTransactionOutputSchema = z.object({
  matchedMemberId: z.string().nullable().describe('The ID of the chama member identified, or null if no confident match.'),
  confidenceScore: z.number().describe('A score (0-1) indicating the AI\'s confidence in the match.'),
  needsReview: z.boolean().describe('True if the match confidence is low and requires manual verification.'),
  reason: z.string().describe('Explanation for the match outcome.'),
});

export type ReconcileMpesaTransactionOutput = z.infer<typeof ReconcileMpesaTransactionOutputSchema>;

export async function reconcileMpesaTransaction(input: ReconcileMpesaTransactionInput): Promise<ReconcileMpesaTransactionOutput> {
  return reconcileMpesaTransactionFlow(input);
}

const reconciliationPrompt = ai.definePrompt({
  name: 'reconcileMpesaTransactionPrompt',
  input: { schema: ReconcileMpesaTransactionInputSchema },
  output: { schema: ReconcileMpesaTransactionOutputSchema },
  prompt: `You are an expert financial reconciler for a Kenyan student group savings (Chama). Your task is to accurately match an M-Pesa payment to one of the active chama members.

Incoming M-Pesa Transaction:
- ID: {{{transaction.TransID}}}
- Amount: KES {{{transaction.TransAmount}}}
- Phone: {{{transaction.MSISDN}}}
- Name: {{{transaction.FirstName}}}
- Ref: {{{transaction.BillRefNumber}}}

Active Chama Members:
{{#each chamaMembers}}
  - ID: {{this.id}}, Name: {{this.name}}, Phone: {{this.phone}}, Nicknames: {{#if this.nicknames}}{{#each this.nicknames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
{{/each}}

Match Criteria:
1. Phone Number: Strongest indicator.
2. Name/Nicknames: Flexible matching (e.g., 'Brian' vs 'Bryan').
3. Reference: Use if it contains member identifiers.

Analyze the details carefully and return the appropriate JSON matching the defined schema.`,
});

const reconcileMpesaTransactionFlow = ai.defineFlow(
  {
    name: 'reconcileMpesaTransactionFlow',
    inputSchema: ReconcileMpesaTransactionInputSchema,
    outputSchema: ReconcileMpesaTransactionOutputSchema,
  },
  async (input) => {
    const { output } = await reconciliationPrompt(input);
    if (!output) {
      throw new Error('AI reconciliation prompt did not return an output.');
    }
    return output;
  }
);