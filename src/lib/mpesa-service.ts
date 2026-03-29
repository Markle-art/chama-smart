/**
 * ChamaSmart — M-Pesa Client Service
 *
 * This file runs on the CLIENT (browser side).
 * It calls your Next.js API routes, which in turn call Daraja.
 * Never put secret keys here — they stay in the API routes.
 */

// ─────────────────────────────────────────────────────────────────────────────
// STK PUSH
// Called when member clicks "Initiate Payment" on the join page.
// Returns checkoutRequestId which we use to track the payment.
// ─────────────────────────────────────────────────────────────────────────────
export async function initiateStkPush(
  phone: string,
  amount: number,
  chamaName: string,
  chamaId: string,
): Promise<{
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/mpesa/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount, chamaId, chamaName }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error ?? 'STK Push failed. Please try again.',
      };
    }

    return {
      success: true,
      checkoutRequestId: data.checkoutRequestId,
      merchantRequestId: data.merchantRequestId,
      message: data.message,
    };
  } catch (err) {
    console.error('[mpesa-service] STK Push error:', err);
    return {
      success: false,
      error: 'Network error. Check your connection and try again.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER RATIBA (Standing Order)
// Called after first payment if member clicks "Yes, automate my payments"
// ─────────────────────────────────────────────────────────────────────────────
export async function registerRatiba(
  phone: string,
  amount: number,
  chamaId: string,
  chamaName: string,
  memberId: string,
  startDate: string, // YYYY-MM-DD — the next contribution date
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/mpesa/ratiba', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount, chamaId, chamaName, memberId, startDate }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error ?? 'Could not set up standing order.',
      };
    }

    return { success: true, message: data.message };
  } catch (err) {
    console.error('[mpesa-service] Ratiba error:', err);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}
