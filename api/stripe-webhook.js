// Stripe Webhook Handler for Member Management
// This handles Stripe subscription events and updates member records

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { addMember, addMonthlyCredits } = require('./member-auth');

exports.handler = async (event, context) => {
    const sig = event.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return {
            statusCode: 400,
            body: `Webhook Error: ${err.message}`
        };
    }

    try {
        switch (stripeEvent.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(stripeEvent.data.object);
                break;
            
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(stripeEvent.data.object);
                break;
            
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(stripeEvent.data.object);
                break;
            
            case 'customer.subscription.deleted':
                await handleSubscriptionCancelled(stripeEvent.data.object);
                break;
            
            default:
                console.log(`Unhandled event type: ${stripeEvent.type}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        };

    } catch (error) {
        console.error('Webhook handler error:', error);
        return {
            statusCode: 500,
            body: 'Webhook handler failed'
        };
    }
};

// Handle new subscription creation
async function handleSubscriptionCreated(subscription) {
    try {
        // Get customer details from Stripe
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        // Determine membership type from price ID
        const membershipType = getMembershipTypeFromPriceId(subscription.items.data[0].price.id);
        
        // Create member record
        const member = await addMember(customer, {
            id: subscription.id,
            metadata: { membership_type: membershipType }
        });

        console.log('New member created:', member.email);
        
        // Send welcome email (you can implement this)
        // await sendWelcomeEmail(member);
        
    } catch (error) {
        console.error('Error handling subscription creation:', error);
        throw error;
    }
}

// Handle successful payment (including monthly renewals)
async function handlePaymentSucceeded(invoice) {
    try {
        if (invoice.billing_reason === 'subscription_cycle') {
            // This is a monthly renewal - add Reserve credits
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const customer = await stripe.customers.retrieve(subscription.customer);
            
            await addMonthlyCredits(customer.id);
            console.log('Monthly credits added for:', customer.email);
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
        throw error;
    }
}

// Handle subscription updates (plan changes, etc.)
async function handleSubscriptionUpdated(subscription) {
    try {
        // Handle membership tier changes
        const customer = await stripe.customers.retrieve(subscription.customer);
        const membershipType = getMembershipTypeFromPriceId(subscription.items.data[0].price.id);
        
        console.log('Subscription updated for:', customer.email, 'New type:', membershipType);
        
        // Update member record with new membership details
        // You can implement this based on your needs
        
    } catch (error) {
        console.error('Error handling subscription update:', error);
        throw error;
    }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
    try {
        const customer = await stripe.customers.retrieve(subscription.customer);
        console.log('Subscription cancelled for:', customer.email);
        
        // Update member status to cancelled
        // You can implement this based on your needs
        
    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
        throw error;
    }
}

// Helper function to determine membership type from Stripe Price ID
function getMembershipTypeFromPriceId(priceId) {
    const priceMapping = {
        'price_1RcG9kLeFHoi9neBS2g9QaLb': 'restore',
        'price_1RcGDWLeFHoi9neBqZ7MrZDy': 'revive',
        'price_1RcGECLeFHoi9neBBTJKdYSH': 'renew',
        'price_1RcGEsLeFHoi9neBWeGknCVv': 'total-wellness'
    };
    
    return priceMapping[priceId] || 'unknown';
}