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
            'silvio@bewelllifestylecenters.com': {
                id: 'cus_SXMPgeV91f8BCg', // Real Stripe customer ID
                name: 'Silvio Cozzetto',
                email: 'silvio@bewelllifestylecenters.com',
                membershipType: 'restore', // $149 Restore membership
                reserveCredits: 14.90, // 10% of $149
                servicesUsedThisMonth: 0,
                servicesAllowed: 1, // Restore gets 1 service
                cafeItemsUsed: 0,
                cafeItemsAllowed: 1, // Restore gets 1 café item
                memberSince: 'June 2025',
                nextBilling: 'July 20, 2025', // Matches Stripe billing date
                status: 'active'
            },
            'cozzetto@infinitymgtsys.com': {
                id: 'member_real',
                name: 'Silvio Cozzetto',
                email: 'cozzetto@infinitymgtsys.com',
                membershipType: 'restore', // Correct - $149 Restore membership
                reserveCredits: 14.90, // Correct - 10% of $149
                servicesUsedThisMonth: 0,
                servicesAllowed: 1, // Correct - Restore gets 1 service
                cafeItemsUsed: 0,
                cafeItemsAllowed: 1, // Correct - Restore gets 1 café item
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