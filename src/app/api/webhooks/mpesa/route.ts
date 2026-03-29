import { NextRequest, NextResponse } from 'next/server';
import { generateSuccessNotification } from '@/ai/flows/payment-success-notification-flow';
import { sendSms } from '@/lib/at-service';

/**
 * M-Pesa Callback Handler
 * Receives the POST from Safaricom after the user enters their PIN.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = body.Body.stkCallback;

    if (result.ResultCode === 0) {
      // 1. Extract payment details
      const items = result.CallbackMetadata.Item;
      const amount = items.find((i: any) => i.Name === 'Amount')?.Value;
      const phone = items.find((i: any) => i.Name === 'PhoneNumber')?.Value;
      const receipt = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;

      // Note: In a production environment, we would use firebase-admin here to update Firestore.
      // For this prototype, we log the result and prepare the AI notification.
      console.log(`[M-Pesa Success] ${phone} paid KES ${amount}. Receipt: ${receipt}`);

      // 2. Trigger AI Notification
      const aiMessage = await generateSuccessNotification({
        chamaName: "Your Chama",
        memberName: phone.toString(),
        amount: Number(amount),
        progressPercentage: 75.5, // This would be calculated from the DB
      });

      // 3. Send SMS via Africa's Talking
      await sendSms(phone.toString(), aiMessage);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error('[M-Pesa Callback Error]:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" }, { status: 500 });
  }
}
