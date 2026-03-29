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
    console.log('[M-Pesa Callback Received]:', JSON.stringify(body, null, 2));

    const result = body.Body.stkCallback;

    if (result.ResultCode === 0) {
      // 1. Extract payment details
      const items = result.CallbackMetadata.Item;
      const amount = items.find((i: any) => i.Name === 'Amount')?.Value;
      const phone = items.find((i: any) => i.Name === 'PhoneNumber')?.Value;
      const receipt = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;

      console.log(`[M-Pesa Success Confirmation] ${phone} paid KES ${amount}. Receipt: ${receipt}`);

      // 2. Trigger AI Notification logic (Generates a friendly success message)
      try {
        const aiMessage = await generateSuccessNotification({
          chamaName: "ChamaSmart Group",
          memberName: phone.toString(),
          amount: Number(amount),
          progressPercentage: 85.0, // In production, calculate this from Firestore
        });

        // 3. Send SMS via Africa's Talking
        await sendSms(phone.toString(), aiMessage);
      } catch (aiError) {
        console.error('[AI/SMS Notification Error]:', aiError);
      }
    } else {
      console.warn(`[M-Pesa Payment Failed/Cancelled] Code: ${result.ResultCode}, Desc: ${result.ResultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error('[M-Pesa Callback Critical Error]:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" }, { status: 500 });
  }
}
