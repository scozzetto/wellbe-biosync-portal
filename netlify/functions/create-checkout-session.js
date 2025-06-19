const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { type, priceId, amount, customerEmail } = JSON.parse(event.body);

    let sessionConfig = {
      payment_method_types: ['card'],
      customer_email: customerEmail,
      success_url: `${process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/cancel`
    };

    if (type === 'membership') {
      // Subscription for memberships
      sessionConfig.mode = 'subscription';
      sessionConfig.line_items = [{
        price: priceId,
        quantity: 1
      }];
    } else if (type === 'gift-card') {
      // One-time payment for gift cards
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Be Well Gift Card',
            description: `$${amount} Gift Card`
          },
          unit_amount: amount * 100 // Convert to cents
        },
        quantity: 1
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};