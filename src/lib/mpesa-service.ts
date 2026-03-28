'use client';

/**
 * Simulated M-Pesa STK Push Service
 */
export async function initiateStkPush(phoneNumber: string, amount: number, chamaName: string) {
  console.log(`[STK Push] Initiating for ${phoneNumber} - KES ${amount} for ${chamaName}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, this would call a backend function that interacts with Safaricom Daraja API
  return {
    success: true,
    message: "STK Push sent successfully. Please check your phone to enter your PIN.",
    checkoutRequestId: Math.random().toString(36).substring(7),
  };
}
