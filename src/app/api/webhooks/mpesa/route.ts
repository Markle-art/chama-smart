import { NextRequest, NextResponse } from 'next/server';
import { generateSuccessNotification } from '@/ai/flows/payment-success-notification-flow';
import { sendSms } from '@/lib/at-service';
import { initializeFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, doc, updateDoc, increment, addDoc } from 'firebase/firestore';

/**
 * M-Pesa Callback Handler (Phase 3 & 4)
 * Receives POST from Safaricom, updates DB, and triggers AI notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firestore } = initializeFirebase();
    
    console.log('[M-Pesa Callback Received]:', JSON.stringify(body, null, 2));

    const result = body.Body.stkCallback;
    const checkoutRequestId = result.CheckoutRequestID;

    if (result.ResultCode === 0) {
      // 1. Extract payment details from Safaricom payload
      const items = result.CallbackMetadata.Item;
      const amount = items.find((i: any) => i.Name === 'Amount')?.Value;
      const phone = items.find((i: any) => i.Name === 'PhoneNumber')?.Value;
      const receipt = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;

      // 2. Locate the "Pending" transaction in Firestore (Phase 3)
      // We use a collectionGroup query to find the transaction by its M-Pesa CheckoutRequestID
      const q = query(collectionGroup(firestore, 'transactions'), where('mPesaTransId', '==', checkoutRequestId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const txDoc = querySnapshot.docs[0];
        const txData = txDoc.data();
        const chamaId = txData.reconciledChamaId;
        const adminUserId = txData.adminUserId;

        // A. Update Transaction Status
        await updateDoc(txDoc.ref, {
          status: 'Reconciled',
          reconciledAt: new Date().toISOString(),
          mPesaReceipt: receipt
        });

        // B. Increment Chama Balance (Group Aggregation)
        const chamaRef = doc(firestore, 'chamas', chamaId);
        await updateDoc(chamaRef, {
          currentBalance: increment(Number(amount)),
          updatedAt: new Date().toISOString()
        });

        // C. Log confirmed Contribution
        const contributionId = `cnt_${Math.random().toString(36).substring(7)}`;
        const contribRef = doc(firestore, 'chamas', chamaId, 'members', txData.reconciledMemberId || 'anonymous', 'contributions', contributionId);
        // Note: In production, you'd match msisdn to a memberId here.
        
        // 3. Trigger AI & SMS Notifications (Phase 4)
        try {
          // Calculate progress for the AI context (simplified for MVP)
          const progressPercentage = (txData.transAmount / 100000) * 100; // Mock target for context

          const aiMessage = await generateSuccessNotification({
            chamaName: txData.billRefNumber || "ChamaSmart Group",
            memberName: txData.firstName || phone.toString(),
            amount: Number(amount),
            progressPercentage: progressPercentage,
          });

          // Send SMS to the Contributor
          await sendSms(phone.toString(), aiMessage);
          
          // Note: In production, fetch Admin phone from /users/{adminUserId} to notify Treasurer too
          console.log(`[AI Notification Sent]: ${aiMessage}`);
        } catch (aiError) {
          console.error('[AI/SMS Notification Error]:', aiError);
        }
      }
    } else {
      console.warn(`[M-Pesa Payment Failed] Code: ${result.ResultCode}, Desc: ${result.ResultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error('[M-Pesa Callback Critical Error]:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" }, { status: 500 });
  }
}
