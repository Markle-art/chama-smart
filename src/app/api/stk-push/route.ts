import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for the STK push endpoint
const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

/**
 * Initiates M-Pesa STK Push via Daraja API with rate limiting and sanitization.
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, amount, chamaName, chamaId } = await req.json();

    // 1. Basic Rate Limiting Check
    const now = Date.now();
    const userLimit = rateLimitMap.get(phoneNumber) || { count: 0, lastRequest: 0 };

    if (now - userLimit.lastRequest < RATE_LIMIT_WINDOW) {
      if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: 'Too many payment attempts. Please wait a minute.' },
          { status: 429 }
        );
      }
      userLimit.count += 1;
    } else {
      userLimit.count = 1;
      userLimit.lastRequest = now;
    }
    rateLimitMap.set(phoneNumber, userLimit);

    // 2. Input Validation & Sanitization
    if (!phoneNumber || !/^\d{12}$/.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format. Use 2547XXXXXXXX' }, { status: 400 });
    }

    if (!amount || amount <= 0 || amount > 70000) {
      return NextResponse.json({ error: 'Invalid amount. Range: 1 - 70,000 KES' }, { status: 400 });
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const passkey = process.env.MPESA_PASSKEY;

    if (!consumerKey || !consumerSecret || !passkey) {
      throw new Error('M-Pesa credentials missing in environment variables');
    }

    // 3. Get Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
    });
    
    if (!tokenRes.ok) throw new Error('Failed to fetch M-Pesa access token');
    const { access_token } = await tokenRes.json();

    // 4. Prepare STK Push Credentials
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const shortcode = process.env.MPESA_SHORTCODE || '174379';
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const sanitizedRef = chamaName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 12) || 'ChamaSmart';

    // 5. Initiate Push
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
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[STK API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to initiate push' }, { status: 500 });
  }
}
