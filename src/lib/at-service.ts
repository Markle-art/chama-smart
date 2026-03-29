/**
 * @fileOverview Africa's Talking SMS Service for sending group notifications.
 */

export async function sendSms(to: string, message: string) {
  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;

  if (!username || !apiKey) {
    console.warn('[AT Service] Missing credentials. SMS not sent:', message);
    return { success: false, error: 'Missing credentials' };
  }

  try {
    const response = await fetch('https://api.sandbox.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey,
      },
      body: new URLSearchParams({
        username: username,
        to: to,
        message: message,
      }),
    });

    const result = await response.json();
    console.log('[AT Service] SMS sent result:', result);
    return { success: true, result };
  } catch (error) {
    console.error('[AT Service] Failed to send SMS:', error);
    return { success: false, error };
  }
}
