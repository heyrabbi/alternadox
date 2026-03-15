const Stripe = require('stripe');

module.exports = async (req, res) => {
  // Allow CORS from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  const { lineItems, customerEmail, shippingAddress } = req.body;

  if (!lineItems || lineItems.length === 0) {
    return res.status(400).json({ error: 'No items in cart' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,

      // Collect shipping address on Stripe's page
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'IL'],
      },

      // Shipping rate options — set these up in your Stripe Dashboard
      // Dashboard → Products → Shipping rates
      // Then paste the shipping rate IDs below:
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 399, currency: 'usd' },
            display_name: 'USPS Media Mail (US)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1299, currency: 'usd' },
            display_name: 'USPS Priority Mail (US)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 4 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1899, currency: 'usd' },
            display_name: 'International Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 7 },
              maximum: { unit: 'business_day', value: 21 },
            },
          },
        },
      ],

      // Pre-fill customer info from the form
      ...(shippingAddress && {
        payment_intent_data: {
          shipping: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            address: {
              line1: shippingAddress.address1,
              line2: shippingAddress.address2 || '',
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.zip,
              country: shippingAddress.country,
            },
          },
        },
      }),

      // Where to send customers after payment
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?cancelled=true`,

      // Collect tax automatically (optional — enable in Stripe Dashboard)
      // automatic_tax: { enabled: true },
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
