import { NextRequest, NextResponse } from 'next/server';

/**
 * Initiates M-Pesa STK Push via Daraja API
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, amount, chamaName, chamaId } = await req.json();

    // 1. Get Access Token (In production, cache this)
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error('M-Pesa credentials missing in environment variables');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
    });
    
    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('[Daraja Token Error]:', errorText);
      throw new Error('Failed to fetch M-Pesa access token');
    }
    
    const { access_token } = await tokenRes.json();

    // 2. Prepare STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE || '174379';
    
    if (!passkey) {
      throw new Error('M-Pesa Passkey missing in environment variables');
    }

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // Clean reference name (no spaces, max 12 chars)
    const safeRef = chamaName.replace(/\s+/g, '').substring(0, 12);

    const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: safeRef,
        TransactionDesc: `Pay ${safeRef}`,
      }),
    });

    const result = await stkRes.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[STK API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to initiate push' }, { status: 500 });
  }
}
