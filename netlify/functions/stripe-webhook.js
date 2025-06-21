// Netlify Function to handle Stripe webhooks
const memberDB = require('./member-database');
const salesforce = require('./salesforce-sync');
const crypto = require('crypto');

// Stripe webhook endpoint secret - add this to your Netlify environment variables
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
    console.log('=== WEBHOOK START ===');
    console.log('HTTP Method:', event.httpMethod);
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('Body length:', event.body ? event.body.length : 0);
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        console.log('Handling CORS preflight');
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
        console.log('Method not allowed:', event.httpMethod);
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Get the signature from Stripe
        const stripeSignature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
        console.log('Stripe signature present:', !!stripeSignature);
        
        if (!stripeSignature) {
            console.error('No Stripe signature found');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No Stripe signature found' })
            };
        }
        
        // Verify the webhook signature
        let stripeEvent;
        try {
            console.log('Verifying webhook signature...');
            stripeEvent = verifyStripeSignature(event.body, stripeSignature, endpointSecret);
            console.log('Signature verification successful');
        } catch (err) {
            console.error('Signature verification failed:', err.message);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid signature' })
            };
        }
        
        console.log('Event type:', stripeEvent.type);
        console.log('Event ID:', stripeEvent.id);
        
        // Log full event data for debugging
        console.log('=== FULL EVENT DATA ===');
        console.log(JSON.stringify(stripeEvent, null, 2));
        console.log('=== END EVENT DATA ===');
        

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
        console.error('=== WEBHOOK ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('=== END ERROR ===');
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

// Verify Stripe webhook signature
function verifyStripeSignature(payload, signature, secret) {
    if (!secret) {
        throw new Error('Webhook secret not configured');
    }
    
    const elements = signature.split(',');
    const signatureElements = {};
    
    for (const element of elements) {
        const [key, value] = element.split('=');
        signatureElements[key] = value;
    }
    
    if (!signatureElements.t || !signatureElements.v1) {
        throw new Error('Invalid signature format');
    }
    
    const timestamp = signatureElements.t;
    const expectedSignature = signatureElements.v1;
    
    // Create expected signature
    const signedPayload = timestamp + '.' + payload;
    const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload, 'utf8')
        .digest('hex');
    
    // Compare signatures
    if (computedSignature !== expectedSignature) {
        throw new Error('Signature mismatch');
    }
    
    // Check timestamp (5 minutes tolerance)
    const now = Math.floor(Date.now() / 1000);
    if (now - parseInt(timestamp) > 300) {
        throw new Error('Timestamp too old');
    }
    
    return JSON.parse(payload);
}

// Handle checkout session completed
async function handleCheckoutCompleted(session) {
    console.log('=== CHECKOUT SESSION COMPLETED ===');
    console.log('Session ID:', session.id);
    console.log('Customer ID:', session.customer);
    console.log('Customer Details:', JSON.stringify(session.customer_details, null, 2));
    console.log('Subscription ID:', session.subscription);
    
    try {
        // Extract customer information
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name || customerEmail;
        
        console.log('Extracted email:', customerEmail);
        console.log('Extracted name:', customerName);
        
        if (!customerEmail) {
            console.error('No customer email found in session');
            return;
        }
        
        if (!session.customer) {
            console.error('No customer ID found in session');
            return;
        }
        
        // Create customer data object
        const customerData = {
            id: session.customer,
            email: customerEmail,
            name: customerName
        };
        
        // Get line items to extract price information
        console.log('Line items:', JSON.stringify(session.line_items, null, 2));
        
        // Create subscription data
        const subscriptionData = {
            id: session.subscription || 'pending',
            status: 'active',
            priceId: session.line_items?.data?.[0]?.price?.id || 'unknown',
            amount: session.amount_total
        };
        
        console.log('Customer data:', JSON.stringify(customerData, null, 2));
        console.log('Subscription data:', JSON.stringify(subscriptionData, null, 2));
        
        // Create member in local database
        console.log('=== CREATING MEMBER IN DATABASE ===');
        try {
            const newMember = await memberDB.createMember(customerData, subscriptionData);
            console.log('✓ Created member:', JSON.stringify(newMember, null, 2));
        } catch (dbError) {
            console.error('✗ Database creation failed:', dbError);
        }
        
        // Sync to Salesforce
        console.log('=== SYNCING TO SALESFORCE ===');
        try {
            const salesforceResult = await salesforce.upsertContact(customerData, subscriptionData);
            console.log('✓ Salesforce sync result:', salesforceResult);
        } catch (sfError) {
            console.error('✗ Salesforce sync failed:', sfError);
            console.error('Salesforce error stack:', sfError.stack);
        }
        
        console.log('=== CHECKOUT HANDLING COMPLETE ===');
        
    } catch (error) {
        console.error('=== CHECKOUT HANDLING ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
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
    console.log('=== SUBSCRIPTION DELETED ===');
    console.log('Subscription ID:', subscription.id);
    console.log('Customer ID:', subscription.customer);
    
    try {
        // Update member status to cancelled
        console.log('Updating member status to cancelled...');
        await memberDB.updateMemberStatus(subscription.customer, 'cancelled');
        console.log('✓ Member status updated to cancelled');
        
        // Update Salesforce
        console.log('Updating Salesforce contact...');
        try {
            await salesforce.updateContactStatus(subscription.customer, 'cancelled');
            console.log('✓ Updated Salesforce contact to cancelled');
        } catch (error) {
            console.error('✗ Salesforce update failed:', error);
            console.error('Salesforce error stack:', error.stack);
        }
        
    } catch (error) {
        console.error('=== SUBSCRIPTION DELETION ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
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
