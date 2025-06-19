require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const MEMBERSHIP_PRICES = {
  restore: process.env.STRIPE_PRICE_RESTORE,
  revive: process.env.STRIPE_PRICE_REVIVE,
  renew: process.env.STRIPE_PRICE_RENEW,
  'total-wellness': process.env.STRIPE_PRICE_TOTAL_WELLNESS
};

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { membershipType, customerEmail } = JSON.parse(event.body);

    // Validate membership type
    if (!MEMBERSHIP_PRICES[membershipType]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid membership type' })
      };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: customerEmail,
      line_items: [{
        price: MEMBERSHIP_PRICES[membershipType],
        quantity: 1
      }],
      success_url: `${process.env.URL || 'https://bewell.com'}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://bewell.com'}/transformation-hub.html`,
      metadata: {
        membershipType
      },
      subscription_data: {
        metadata: {
          membershipType
        }
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        message: error.message 
      })
    };
  }
};