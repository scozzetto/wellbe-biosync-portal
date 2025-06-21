// Netlify Function to handle Stripe webhooks
const fs = require('fs').promises;
const path = require('path');

// Simple member database operations
const loadMembers = async () => {
    try {
        // In production, this would read from a database
        // For now, we'll use a simple JSON structure
        return {
            members: {},
            transactions: {},
            settings: {
                creditExpirationMonths: 6,
                creditEarnRate: 0.10,
                lastUpdated: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error('Error loading members:', error);
        return { members: {}, transactions: {}, settings: {} };
    }
};

// Add new member
const addMember = async (stripeCustomer, subscriptionData) => {
    try {
        // Determine membership type from amount
        const membershipTypes = {
            14900: 'restore',    // $149.00
            29900: 'revive',     // $299.00
            49900: 'renew',      // $499.00
            79900: 'total-wellness' // $799.00
        };

        const amount = subscriptionData.items.data[0].price.unit_amount;
        const membershipType = membershipTypes[amount] || 'unknown';

        // Get membership details
        const membershipDetails = {
            'restore': { services: 1, credits: 14.90, cafeItems: 1 },
            'revive': { services: 2, credits: 29.90, cafeItems: 1 },
            'renew': { services: 3, credits: 49.90, cafeItems: 2 },
            'total-wellness': { services: 5, credits: 79.90, cafeItems: 4 }
        };

        const member = {
            id: stripeCustomer.id,
            name: stripeCustomer.name || stripeCustomer.email,
            email: stripeCustomer.email,
            phone: stripeCustomer.phone || '',
            membershipType: membershipType,
            membershipStart: new Date().toISOString(),
            stripeCustomerId: stripeCustomer.id,
            stripeSubscriptionId: subscriptionData.id,
            reserveCredits: 0,
            servicesUsedThisMonth: 0,
            cafeItemsUsedThisMonth: 0,
            membershipDetails: membershipDetails[membershipType],
            status: 'active',
            createdAt: new Date().toISOString()
        };

        // Log the member creation (in production, save to database)
        console.log('New member created:', member);
        
        return member;
    } catch (error) {
        console.error('Add member error:', error);
        throw error;
    }
};

exports.handler = async (event, context) => {
    // Only handle POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const sig = event.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // For now, we'll accept the webhook without signature verification
        // In production, you should verify the signature
        const body = JSON.parse(event.body);
        const stripeEvent = body;

        console.log('Webhook received:', stripeEvent.type);

        switch (stripeEvent.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(stripeEvent.data.object);
                break;
            
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(stripeEvent.data.object);
                break;
            
            default:
                console.log(`Unhandled event type: ${stripeEvent.type}`);
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ received: true })
        };

    } catch (error) {
        console.error('Webhook handler error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Webhook handler failed' })
        };
    }
};

// Handle new subscription creation
async function handleSubscriptionCreated(subscription) {
    try {
        console.log('New subscription created:', subscription.id);
        
        // Create a demo member record
        const member = {
            id: subscription.customer,
            email: 'new-member@stripe.com', // We'd get this from Stripe customer object
            membershipType: 'renew',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        console.log('Member would be created:', member);
        
    } catch (error) {
        console.error('Error handling subscription creation:', error);
    }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
    try {
        if (invoice.billing_reason === 'subscription_cycle') {
            console.log('Monthly renewal processed for customer:', invoice.customer);
            // Here we would add monthly credits
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}