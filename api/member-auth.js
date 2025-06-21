// Member Authentication and Credit Management System
// This runs on Netlify Functions or similar serverless platform

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Simple email sending (you'll need to configure with your email service)
const sendEmail = async (to, subject, html) => {
    // TODO: Integrate with your email service (SendGrid, Mailgun, etc.)
    console.log(`Email to ${to}: ${subject}`);
    console.log(html);
};

// Load members database
const loadMembers = async () => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'members.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {
            members: {},
            transactions: {},
            settings: {
                creditExpirationMonths: 6,
                creditEarnRate: 0.10,
                lastUpdated: new Date().toISOString()
            }
        };
    }
};

// Save members database
const saveMembers = async (data) => {
    await fs.writeFile(path.join(__dirname, 'members.json'), JSON.stringify(data, null, 2));
};

// Generate magic link token
const generateMagicToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Magic link login endpoint
exports.sendMagicLink = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email } = JSON.parse(event.body);
    
    if (!email) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: 'Email is required' }) 
        };
    }

    try {
        const data = await loadMembers();
        const member = Object.values(data.members).find(m => m.email.toLowerCase() === email.toLowerCase());
        
        if (!member) {
            return { 
                statusCode: 404, 
                body: JSON.stringify({ error: 'Member not found' }) 
            };
        }

        // Generate magic link
        const token = generateMagicToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        // Store token
        member.magicToken = token;
        member.magicTokenExpires = expiresAt.toISOString();
        
        await saveMembers(data);

        // Send magic link email
        const magicLink = `${process.env.URL}/member-portal.html?token=${token}`;
        
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #A47C5B, #806044); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Be Well LifeStyle Centers</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #A47C5B;">Access Your Member Portal</h2>
                    <p>Click the button below to securely access your Be Well Reserve™ account:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${magicLink}" style="background: linear-gradient(135deg, #A47C5B, #806044); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Access My Account</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">This link expires in 24 hours. If you didn't request this, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">Be Well LifeStyle Centers | (248) 792-6570</p>
                </div>
            </div>
        `;

        await sendEmail(email, 'Access Your Be Well Member Portal', emailHtml);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Magic link sent to your email' })
        };

    } catch (error) {
        console.error('Magic link error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

// Verify magic link token
exports.verifyMagicLink = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { token } = JSON.parse(event.body);
    
    if (!token) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: 'Token is required' }) 
        };
    }

    try {
        const data = await loadMembers();
        const member = Object.values(data.members).find(m => 
            m.magicToken === token && 
            new Date(m.magicTokenExpires) > new Date()
        );
        
        if (!member) {
            return { 
                statusCode: 401, 
                body: JSON.stringify({ error: 'Invalid or expired token' }) 
            };
        }

        // Clear used token
        delete member.magicToken;
        delete member.magicTokenExpires;
        await saveMembers(data);

        // Return member data (without sensitive info)
        const memberData = {
            id: member.id,
            name: member.name,
            email: member.email,
            membershipType: member.membershipType,
            membershipStart: member.membershipStart,
            reserveCredits: member.reserveCredits || 0,
            servicesUsedThisMonth: member.servicesUsedThisMonth || 0,
            cafeItemsUsedThisMonth: member.cafeItemsUsedThisMonth || 0,
            membershipDetails: member.membershipDetails
        };

        return {
            statusCode: 200,
            body: JSON.stringify({ member: memberData })
        };

    } catch (error) {
        console.error('Token verification error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

// Add new member (called from Stripe webhook)
exports.addMember = async (stripeCustomer, subscriptionData) => {
    try {
        const data = await loadMembers();
        
        const memberId = stripeCustomer.id;
        const membershipType = subscriptionData.metadata.membership_type;
        
        // Get membership details
        const membershipDetails = {
            'restore': { services: 1, credits: 14.90, cafeItems: 1 },
            'revive': { services: 2, credits: 29.90, cafeItems: 1 },
            'renew': { services: 3, credits: 49.90, cafeItems: 2 },
            'total-wellness': { services: 5, credits: 79.90, cafeItems: 4 }
        };

        const member = {
            id: memberId,
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

        data.members[memberId] = member;
        await saveMembers(data);

        return member;
    } catch (error) {
        console.error('Add member error:', error);
        throw error;
    }
};

// Add Reserve credits (called monthly)
exports.addMonthlyCredits = async (memberId) => {
    try {
        const data = await loadMembers();
        const member = data.members[memberId];
        
        if (!member) {
            throw new Error('Member not found');
        }

        const creditsToAdd = member.membershipDetails.credits;
        member.reserveCredits += creditsToAdd;
        
        // Reset monthly counters
        member.servicesUsedThisMonth = 0;
        member.cafeItemsUsedThisMonth = 0;

        // Add transaction record
        const transactionId = crypto.randomBytes(16).toString('hex');
        data.transactions[transactionId] = {
            id: transactionId,
            memberId: memberId,
            type: 'credit_earned',
            amount: creditsToAdd,
            description: 'Monthly Reserve credits earned',
            date: new Date().toISOString()
        };

        await saveMembers(data);
        return member;
    } catch (error) {
        console.error('Add credits error:', error);
        throw error;
    }
};

// Use Reserve credits
exports.useCredits = async (memberId, amount, description) => {
    try {
        const data = await loadMembers();
        const member = data.members[memberId];
        
        if (!member) {
            throw new Error('Member not found');
        }

        if (member.reserveCredits < amount) {
            throw new Error('Insufficient credits');
        }

        member.reserveCredits -= amount;

        // Add transaction record
        const transactionId = crypto.randomBytes(16).toString('hex');
        data.transactions[transactionId] = {
            id: transactionId,
            memberId: memberId,
            type: 'credit_used',
            amount: -amount,
            description: description,
            date: new Date().toISOString()
        };

        await saveMembers(data);
        return member;
    } catch (error) {
        console.error('Use credits error:', error);
        throw error;
    }
};