const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.elysianearthessence.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: 'Preflight'
    };
  }

  // Your existing logic
  //const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { cart } = JSON.parse(event.body);

   //build your line items...
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: item.price,
      },
      quantity: item.quantity
    })),
    success_url: 'https://www.elysianearthessence.com/success.html',
    cancel_url: 'https://www.elysianearthessence.com/cancel.html',

    // Add shipping address collection
 //   shipping_address_collection: {
 //     allowed_countries: ['*'], //all countries
 //   },
    billing_address_collection: 'auto'
  });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.elysianearthessence.com',
    },
    body: JSON.stringify({ url: session.url }),
  };
};
