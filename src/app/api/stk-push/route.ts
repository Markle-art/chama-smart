import { NextRequest, NextResponse } from 'next/server';

/**
 * Initiates M-Pesa STK Push via Daraja API
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, amount, chamaName, chamaId } = await req.json();

    // 1. Get Access Token (In production, cache this)
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
    });
    
    if (!tokenRes.ok) {
      throw new Error('Failed to fetch M-Pesa access token');
    }
    
    const { access_token } = await tokenRes.json();

    // 2. Prepare STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: chamaName.substring(0, 12),
        TransactionDesc: `Contrib for ${chamaName}`,
      }),
    });

    const result = await stkRes.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[STK API Error]:', error);
    return NextResponse.json({ error: 'Failed to initiate push' }, { status: 500 });
  }
}
