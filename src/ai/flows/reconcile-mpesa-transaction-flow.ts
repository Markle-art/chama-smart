'use server';
/**
 * @fileOverview This file defines a Genkit flow for reconciling M-Pesa transactions
 * to specific chama members using AI, even when transaction details are unclear.
 *
 * - reconcileMpesaTransaction - The main function to trigger the AI reconciliation process.
 * - ReconcileMpesaTransactionInput - The input type for the reconciliation.
 * - ReconcileMpesaTransactionOutput - The output type for the reconciliation result.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MpesaTransactionSchema = z.object({
  TransID: z.string().describe('Unique M-Pesa transaction ID.'),
  TransAmount: z.string().describe('Amount of the transaction in KES.'),
  MSISDN: z.string().describe('Phone number of the sender.'),
  FirstName: z.string().describe('First name of the sender.'),
  BillRefNumber: z.string().optional().describe('Bill reference number provided by the sender. Can be empty or unhelpful.'),
  // Add other relevant fields from M-Pesa C2B webhook if available
});

const ChamaMemberSchema = z.object({
  id: z.string().describe('Unique identifier for the chama member.'),
  name: z.string().describe('Full name of the chama member.'),
  phone: z.string().describe('Registered M-Pesa phone number of the member.'),
  nicknames: z.array(z.string()).optional().describe('List of known nicknames or aliases for the member.'),
});

const ReconcileMpesaTransactionInputSchema = z.object({
  transaction: MpesaTransactionSchema.describe('The M-Pesa transaction data to reconcile.'),
  chamaMembers: z.array(ChamaMemberSchema).describe('A list of active chama members for matching.'),
});
export type ReconcileMpesaTransactionInput = z.infer<typeof ReconcileMpesaTransactionInputSchema>;

const ReconcileMpesaTransactionOutputSchema = z.object({
  matchedMemberId: z.string().nullable().describe('The ID of the chama member identified, or null if no confident match.'),
  confidenceScore: z.number().describe('A score (0-1) indicating the AI\'s confidence in the match.'),
  needsReview: z.boolean().describe('True if the match confidence is low and requires manual verification.'),
  reason: z.string().describe('Explanation for the match or why it requires review.'),
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

Here is the incoming M-Pesa transaction:
Transaction ID: {{{transaction.TransID}}}
Amount: KES {{{transaction.TransAmount}}}
Sender Phone: {{{transaction.MSISDN}}}
Sender Name: {{{transaction.FirstName}}}
Reference: {{{transaction.BillRefNumber}}}

Here is the list of active chama members. You must match the transaction to one of these members. If you cannot make a confident match, indicate that it needs review.

Chama Members:
{{#each chamaMembers}}
  - ID: {{this.id}}, Name: {{this.name}}, Phone: {{this.phone}}, Nicknames: {{#if this.nicknames}}{{#each this.nicknames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
{{/each}}

Match Criteria (in order of priority, but consider all):
1.  **Phone Number (MSISDN):** This is the strongest indicator. Prioritize exact matches.
2.  **Sender First Name:** Compare the 'FirstName' from the M-Pesa transaction with member names and nicknames. Be flexible with variations (e.g., 'Brian' vs 'Bryan').
3.  **Bill Reference Number (BillRefNumber):** Sometimes members include their name or ID here, but it can be very unreliable or empty.
4.  **Inferred Patterns:** While not explicitly provided for past transactions here, consider if the sender's name or number strongly suggests a particular member, even with slight discrepancies, if no perfect match is found. Avoid making assumptions on patterns not explicitly in the data.

Your output MUST be a JSON object conforming to the following schema:
- matchedMemberId: string | null (The ID of the matched member, or null if no confident match)
- confidenceScore: number (A score from 0 to 1, where 1 is perfect confidence)
- needsReview: boolean (True if confidence is low, say below 0.7, or no match is found)
- reason: string (A brief explanation for the match, or why it needs review and what was unclear)

Consider the provided M-Pesa transaction details and the member list carefully to determine the best match. If the sender's name or phone number does not closely align with any member, or if there are multiple plausible matches, set `needsReview` to true.

Example Output (for a confident match):
{{"matchedMemberId": "member123", "confidenceScore": 0.95, "needsReview": false, "reason": "Exact phone number match with member123."}}

Example Output (for a match needing review):
{{"matchedMemberId": null, "confidenceScore": 0.4, "needsReview": true, "reason": "Sender name 'John' and phone '2547XXXXXXXX' could belong to multiple members, or phone not registered."}}

Example Output (for a name match, but no phone):
{{"matchedMemberId": "member456", "confidenceScore": 0.75, "needsReview": false, "reason": "Strong name match with member456, phone number mismatch noted but other details align."}}
`,
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
