import { NextRequest, NextResponse } from 'next/server';
import { generateSuccessNotification } from '@/ai/flows/payment-success-notification-flow';
import { sendSms } from '@/lib/at-service';
import { initializeFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

/**
 * M-Pesa Callback Handler with Idempotency Protection.
 * Ensures that each CheckoutRequestID is processed exactly once.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firestore } = initializeFirebase();
    
    console.log('[M-Pesa Callback Received]:', JSON.stringify(body, null, 2));

    const result = body.Body.stkCallback;
    const checkoutRequestId = result.CheckoutRequestID;

    if (result.ResultCode === 0) {
      // 1. Locate the "Pending" transaction in Firestore
      const q = query(collectionGroup(firestore, 'transactions'), where('mPesaTransId', '==', checkoutRequestId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const txDoc = querySnapshot.docs[0];
        const txData = txDoc.data();

        // IDEMPOTENCY CHECK: If transaction is already reconciled, skip processing
        if (txData.status === 'Reconciled') {
          console.warn(`[Webhook Idempotency]: Transaction ${checkoutRequestId} already processed.`);
          return NextResponse.json({ ResultCode: 0, ResultDesc: "Already Processed" });
        }

        const items = result.CallbackMetadata.Item;
        const amount = items.find((i: any) => i.Name === 'Amount')?.Value;
        const phone = items.find((i: any) => i.Name === 'PhoneNumber')?.Value;
        const receipt = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
        
        const chamaId = txData.reconciledChamaId;

        // A. Update Transaction Status
        await updateDoc(txDoc.ref, {
          status: 'Reconciled',
          reconciledAt: new Date().toISOString(),
          mPesaReceipt: receipt
        });

        // B. Increment Chama Balance
        const chamaRef = doc(firestore, 'chamas', chamaId);
        await updateDoc(chamaRef, {
          currentBalance: increment(Number(amount)),
          updatedAt: new Date().toISOString()
        });

        // C. Trigger AI & SMS Notifications
        try {
          // Simplified progress context for AI
          const progressPercentage = (Number(amount) / 100000) * 100;

          const aiMessage = await generateSuccessNotification({
            chamaName: txData.billRefNumber || "ChamaSmart Group",
            memberName: txData.firstName || "Member",
            amount: Number(amount),
            progressPercentage: progressPercentage,
          });

          await sendSms(phone.toString(), aiMessage);
        } catch (aiError) {
          console.error('[AI/SMS Notification Error]:', aiError);
        }
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error('[M-Pesa Callback Critical Error]:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" }, { status: 500 });
  }
}
