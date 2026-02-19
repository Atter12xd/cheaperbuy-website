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
    const { amount, currency = 'USD' } = await request.json();

    if (amount == null || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = await getPayPalAccessToken();
    const value = typeof amount === 'number' ? amount.toFixed(2) : String(amount);

    const createRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value,
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('PayPal create order error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to create PayPal order' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const order = await createRes.json();
    const orderID = order.id;

    return new Response(
      JSON.stringify({ orderID }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('create-paypal-order error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
