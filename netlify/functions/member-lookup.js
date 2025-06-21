// Netlify Function to look up members by email
const memberDB = require('./member-database');

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

        // Get member from database
        const member = memberDB.getMemberByEmail(email);

        // Legacy hardcoded members for backward compatibility
        const legacyMembers = {
            'cozzetto@infinitymgtsys.com': {
                id: 'member_real',
                name: 'Silvio Cozzetto',
                email: 'cozzetto@infinitymgtsys.com',
                membershipType: 'restore',
                reserveCredits: 14.90, // Preserved for records
                servicesUsedThisMonth: 0,
                servicesAllowed: 0, // No services when cancelled
                cafeItemsUsed: 0,
                cafeItemsAllowed: 0, // No café items when cancelled
                memberSince: 'June 2025',
                nextBilling: 'Cancelled',
                status: 'cancelled', // Changed from active
                cancelledDate: 'June 21, 2025'
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

        // Try database first, then fall back to legacy members
        const foundMember = member || legacyMembers[email.toLowerCase()];

        if (!foundMember) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({ error: 'Member not found. Please check your email or call us at (248) 792-6570.' })
            };
        }

        // Block cancelled members from accessing portal
        if (foundMember.status === 'cancelled') {
            return {
                statusCode: 403,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({ 
                    error: 'Membership has been cancelled. Please contact us at (248) 792-6570 to reactivate your account.',
                    status: 'cancelled',
                    cancelledDate: foundMember.cancelledDate
                })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ member: foundMember })
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