// Netlify Function to handle Stripe webhooks
const memberDB = require('./member-database');
const salesforce = require('./salesforce-sync');

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
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    // Only handle POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Parse the event
        const stripeEvent = JSON.parse(event.body);
        
        console.log('Stripe webhook received:', stripeEvent.type);
        console.log('Event data:', JSON.stringify(stripeEvent.data, null, 2));

        switch (stripeEvent.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(stripeEvent.data.object);
                break;
                
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
                await handleSubscriptionDeleted(stripeEvent.data.object);
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
            body: JSON.stringify({ received: true, type: stripeEvent.type })
        };

    } catch (error) {
        console.error('Webhook handler error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Webhook handler failed',
                message: error.message 
            })
        };
    }
};

// Handle checkout session completed
async function handleCheckoutCompleted(session) {
    try {
        console.log('Checkout session completed:', session.id);
        console.log('Customer email:', session.customer_details?.email);
        
        // Get customer details from session
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name || customerEmail;
        
        if (customerEmail && session.customer) {
            // Create member immediately with real email
            const customerData = {
                id: session.customer,
                email: customerEmail,
                name: customerName
            };
            
            // Get subscription details from session metadata or line items
            const subscriptionData = {
                id: session.subscription || 'pending',
                priceId: session.line_items?.data?.[0]?.price?.id || 'unknown'
            };
            
            console.log('Creating member with real email:', customerEmail);
            const newMember = await memberDB.createMember(customerData, subscriptionData);
            console.log('Created member:', newMember);
            
            // Sync to Salesforce
            try {
                await salesforce.upsertContact(customerData, subscriptionData);
                console.log('Synced to Salesforce:', customerEmail);
            } catch (error) {
                console.error('Salesforce sync failed:', error);
            }
        }
        
    } catch (error) {
        console.error('Error handling checkout completion:', error);
    }
}

// Handle new subscription creation
async function handleSubscriptionCreated(subscription) {
    try {
        console.log('New subscription created:', subscription.id);
        console.log('Customer:', subscription.customer);
        
        // Get price ID and determine membership type
        const priceId = subscription.items.data[0]?.price?.id;
        const membershipType = getMembershipTypeFromPriceId(priceId);
        
        console.log('Membership type:', membershipType);
        console.log('Price ID:', priceId);
        
        // We need customer details to create the member
        // For now, we'll create a placeholder member that can be updated later
        const customerData = {
            id: subscription.customer,
            email: `customer-${subscription.customer}@stripe.temp`, // Placeholder
            name: 'New Member'
        };
        
        const subscriptionData = {
            id: subscription.id,
            priceId: priceId
        };
        
        // Create member in database
        const newMember = await memberDB.createMember(customerData, subscriptionData);
        console.log('Created member:', newMember);
        
    } catch (error) {
        console.error('Error handling subscription creation:', error);
    }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
    try {
        console.log('Payment succeeded for customer:', invoice.customer);
        
        if (invoice.billing_reason === 'subscription_cycle') {
            console.log('Monthly renewal - adding credits');
            await memberDB.addMonthlyCredits(invoice.customer);
        } else {
            console.log('Initial payment - first month credits will be added on first renewal');
        }
        
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
    try {
        console.log('Subscription updated:', subscription.id);
        console.log('Status:', subscription.status);
        
    } catch (error) {
        console.error('Error handling subscription update:', error);
    }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
    try {
        console.log('Subscription deleted:', subscription.id);
        console.log('Customer:', subscription.customer);
        
        // Update member status to cancelled
        await memberDB.updateMemberStatus(subscription.customer, 'cancelled');
        console.log('Member status updated to cancelled');
        
        // Update Salesforce
        try {
            await salesforce.updateContactStatus(subscription.customer, 'cancelled');
            console.log('Updated Salesforce contact to cancelled');
        } catch (error) {
            console.error('Salesforce update failed:', error);
        }
        
    } catch (error) {
        console.error('Error handling subscription deletion:', error);
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