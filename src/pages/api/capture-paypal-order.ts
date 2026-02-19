import type { APIRoute } from 'astro';

const PAYPAL_API =
  import.meta.env.PAYPAL_MODE === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const clientId = import.meta.env.PAYPAL_CLIENT_ID;
  const secret = import.meta.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET');
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal token failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { orderID } = await request.json();

    if (!orderID || typeof orderID !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing orderID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!captureRes.ok) {
      const err = await captureRes.text();
      console.error('PayPal capture error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to capture PayPal payment' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const captureData = await captureRes.json();

    return new Response(
      JSON.stringify({ success: true, details: captureData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('capture-paypal-order error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
