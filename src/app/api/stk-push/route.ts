import { NextRequest, NextResponse } from 'next/server';

/**
 * Initiates M-Pesa STK Push via Daraja API
 * Updates the AccountReference to display the Chama Name on the contributor's phone.
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, amount, chamaName, chamaId } = await req.json();

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error('M-Pesa credentials missing in environment variables');
    }

    // 1. Get Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
    });
    
    if (!tokenRes.ok) throw new Error('Failed to fetch M-Pesa access token');
    
    const { access_token } = await tokenRes.json();

    // 2. Prepare STK Push Credentials
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE || '174379';
    
    if (!passkey) throw new Error('M-Pesa Passkey missing');

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    /**
     * AccountReference is what appears on the contributor's phone prompt.
     * It must be alphanumeric, no spaces, and max 12 characters.
     */
    const sanitizedRef = chamaName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 12) || 'ChamaSmart';

    // 3. Initiate Push
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
        AccountReference: sanitizedRef,
        TransactionDesc: `Contribution to ${chamaName}`,
      }),
    });

    const result = await stkRes.json();
    console.log(`[STK Initiation]: Sent prompt for ${chamaName} to ${phoneNumber}`);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[STK API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to initiate push' }, { status: 500 });
  }
}
