// Netlify Function to look up members by email
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { email } = JSON.parse(event.body);
        
        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email is required' })
            };
        }

        // Simple member database - in production, this would query your actual database
        const members = {
            'cozzetto@infinitymgtsys.com': {
                id: 'member_real',
                name: 'Silvio Cozzetto',
                email: 'cozzetto@infinitymgtsys.com',
                membershipType: 'renew', // Assuming you got the Renew membership
                reserveCredits: 49.90, // First month credits
                servicesUsedThisMonth: 0,
                servicesAllowed: 3,
                cafeItemsUsed: 0,
                cafeItemsAllowed: 2,
                memberSince: 'June 2025',
                nextBilling: 'July 21, 2025',
                status: 'active'
            },
            'test@bewell.com': {
                id: 'demo_member',
                name: 'Demo Member',
                email: 'test@bewell.com',
                membershipType: 'renew',
                reserveCredits: 127.45,
                servicesUsedThisMonth: 2,
                servicesAllowed: 3,
                cafeItemsUsed: 1,
                cafeItemsAllowed: 2,
                memberSince: 'January 2025',
                nextBilling: 'March 15, 2025',
                status: 'active'
            }
            // TODO: Add real members from Stripe webhooks
        };

        const member = members[email.toLowerCase()];

        if (!member) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({ error: 'Member not found' })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ member })
        };

    } catch (error) {
        console.error('Member lookup error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};