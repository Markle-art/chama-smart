import { NextRequest, NextResponse } from 'next/server';
import { reconcileMpesaTransaction } from '@/ai/flows/reconcile-mpesa-transaction-flow';
import { CHAMA_MEMBERS } from '@/lib/mock-data';

/**
 * M-Pesa C2B Webhook Handler
 * This would be the "ValidationURL" or "ConfirmationURL" registered with Safaricom Daraja.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Safaricom C2B Standard Payload structure (simplified for the flow)
    // In production, we'd map fields from the raw JSON to our schema
    const transaction = {
      TransID: payload.TransID,
      TransAmount: payload.TransAmount,
      MSISDN: payload.MSISDN,
      FirstName: payload.FirstName || "Unknown",
      BillRefNumber: payload.BillRefNumber || "None",
    };

    // 1. Call AI Flow to reconcile the transaction
    const reconciliation = await reconcileMpesaTransaction({
      transaction,
      chamaMembers: CHAMA_MEMBERS.map(m => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        nicknames: m.nicknames,
      })),
    });

    // 2. Based on reconciliation.matchedMemberId, update Firestore
    // (Simulated logic below)
    console.log(`[Webhook] Reconciled transaction ${transaction.TransID}:`, reconciliation);

    // 3. Return response to Safaricom (Must be specific success code for C2B)
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });

  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: "Internal Error",
    }, { status: 500 });
  }
}