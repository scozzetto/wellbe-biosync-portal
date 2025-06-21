// Simple member database for Netlify Functions
// In production, this would be a real database like PostgreSQL or MongoDB

let memberDatabase = {
    members: {
        'sjc543@gmail.com': {
            id: 'cus_SXMvZ4TzM9ara1',
            name: 'SJC Member',
            email: 'sjc543@gmail.com',
            membershipType: 'restore',
            reserveCredits: 14.90,
            servicesUsedThisMonth: 0,
            servicesAllowed: 1,
            cafeItemsUsed: 0,
            cafeItemsAllowed: 1,
            memberSince: 'June 2025',
            nextBilling: 'July 20, 2025',
            status: 'active',
            stripeCustomerId: 'cus_SXMvZ4TzM9ara1',
            stripeSubscriptionId: 'sub_active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        'cozzetto@infinitymgtsys.com': {
            id: 'member_real',
            name: 'Silvio Cozzetto',
            email: 'cozzetto@infinitymgtsys.com',
            membershipType: 'restore',
            reserveCredits: 14.90,
            servicesUsedThisMonth: 0,
            servicesAllowed: 0,
            cafeItemsUsed: 0,
            cafeItemsAllowed: 0,
            memberSince: 'June 2025',
            nextBilling: 'Cancelled',
            status: 'cancelled',
            cancelledDate: '2025-06-21',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },
    transactions: {}
};

// Helper function to get membership details by type
function getMembershipDetails(membershipType) {
    const details = {
        'restore': { services: 1, credits: 14.90, cafeItems: 1, price: 149 },
        'revive': { services: 2, credits: 29.90, cafeItems: 1, price: 299 },
        'renew': { services: 3, credits: 49.90, cafeItems: 2, price: 499 },
        'total-wellness': { services: 5, credits: 79.90, cafeItems: 4, price: 799 }
    };
    return details[membershipType] || details['restore'];
}

// Helper function to determine membership type from Stripe Price ID
function getMembershipTypeFromPriceId(priceId) {
    const priceMapping = {
        'price_1RcG9kLeFHoi9neBS2g9QaLb': 'restore',
        'price_1RcGDWLeFHoi9neBqZ7MrZDy': 'revive',
        'price_1RcGECLeFHoi9neBBTJKdYSH': 'renew',
        'price_1RcGEsLeFHoi9neBWeGknCVv': 'total-wellness'
    };
    return priceMapping[priceId] || 'restore';
}

// Database operations
const memberDB = {
    // Get member by email
    getMemberByEmail: (email) => {
        return memberDatabase.members[email.toLowerCase()] || null;
    },

    // Get member by Stripe customer ID
    getMemberByStripeId: (stripeCustomerId) => {
        return Object.values(memberDatabase.members).find(m => m.stripeCustomerId === stripeCustomerId) || null;
    },

    // Create new member
    createMember: async (customerData, subscriptionData) => {
        try {
            const membershipType = getMembershipTypeFromPriceId(subscriptionData.priceId);
            const membershipDetails = getMembershipDetails(membershipType);
            
            const member = {
                id: customerData.id,
                name: customerData.name || customerData.email,
                email: customerData.email,
                membershipType: membershipType,
                reserveCredits: 0, // Will be added on first billing
                servicesUsedThisMonth: 0,
                servicesAllowed: membershipDetails.services,
                cafeItemsUsed: 0,
                cafeItemsAllowed: membershipDetails.cafeItems,
                memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                status: 'active',
                stripeCustomerId: customerData.id,
                stripeSubscriptionId: subscriptionData.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            memberDatabase.members[customerData.email.toLowerCase()] = member;
            console.log('Created new member:', member.email);
            return member;
        } catch (error) {
            console.error('Error creating member:', error);
            throw error;
        }
    },

    // Update member status
    updateMemberStatus: async (stripeCustomerId, status) => {
        try {
            const member = memberDB.getMemberByStripeId(stripeCustomerId);
            if (member) {
                member.status = status;
                member.updatedAt = new Date().toISOString();
                
                if (status === 'cancelled') {
                    member.cancelledDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    member.nextBilling = 'Cancelled';
                    member.servicesAllowed = 0;
                    member.cafeItemsAllowed = 0;
                }
                
                console.log('Updated member status:', member.email, 'to', status);
                return member;
            }
            return null;
        } catch (error) {
            console.error('Error updating member status:', error);
            throw error;
        }
    },

    // Add monthly credits
    addMonthlyCredits: async (stripeCustomerId) => {
        try {
            const member = memberDB.getMemberByStripeId(stripeCustomerId);
            if (member && member.status === 'active') {
                const membershipDetails = getMembershipDetails(member.membershipType);
                member.reserveCredits += membershipDetails.credits;
                member.servicesUsedThisMonth = 0; // Reset monthly usage
                member.cafeItemsUsed = 0;
                member.updatedAt = new Date().toISOString();
                
                console.log('Added monthly credits to:', member.email, 'Amount:', membershipDetails.credits);
                return member;
            }
            return null;
        } catch (error) {
            console.error('Error adding monthly credits:', error);
            throw error;
        }
    },

    // Get all members (for admin dashboard)
    getAllMembers: () => {
        return Object.values(memberDatabase.members);
    }
};

module.exports = memberDB;