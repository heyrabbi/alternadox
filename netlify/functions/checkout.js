const Stripe = require('stripe');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const { lineItems, customerEmail, shippingAddress } = JSON.parse(event.body);

  if (!lineItems || lineItems.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: 'No items in cart' }) };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'IL'] },
      shipping_options: [
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 399, currency: 'usd' }, display_name: 'USPS Media Mail (US)', delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 10 } } } },
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 1299, currency: 'usd' }, display_name: 'USPS Priority Mail (US)', delivery_estimate: { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 4 } } } },
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 1899, currency: 'usd' }, display_name: 'International Shipping', delivery_estimate: { minimum: { unit: 'business_day', value: 7 }, maximum: { unit: 'business_day', value: 21 } } } },
      ],
      ...(shippingAddress && { payment_intent_data: { shipping: { name: `${shippingAddress.firstName} ${shippingAddress.lastName}`, address: { line1: shippingAddress.address1, line2: shippingAddress.address2 || '', city: shippingAddress.city, state: shippingAddress.state, postal_code: shippingAddress.zip, country: shippingAddress.country } } } }),
      success_url: `${event.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/?cancelled=true`,
    });

    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
