// Salesforce sync utilities
const jsforce = require('jsforce');

// Initialize Salesforce connection
async function getSalesforceConnection() {
    const conn = new jsforce.Connection({
        loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com'
    });
    
    try {
        await conn.login(
            process.env.SALESFORCE_USERNAME,
            process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_SECURITY_TOKEN
        );
        return conn;
    } catch (error) {
        console.error('Salesforce login error:', error);
        throw error;
    }
}

// Create or update Contact in Salesforce
async function upsertContact(customerData, subscriptionData) {
    try {
        const conn = await getSalesforceConnection();
        
        // Map membership type to custom field
        const membershipTypes = {
            14900: 'Restore',
            29900: 'Revive', 
            49900: 'Renew',
            79900: 'Total Wellness'
        };
        
        const amount = subscriptionData.items?.data?.[0]?.price?.unit_amount || subscriptionData.amount;
        const membershipType = membershipTypes[amount] || 'Unknown';
        
        // Contact data
        const contactData = {
            Email: customerData.email,
            FirstName: customerData.name?.split(' ')[0] || 'Member',
            LastName: customerData.name?.split(' ').slice(1).join(' ') || customerData.email,
            Stripe_Customer_ID__c: customerData.id,
            Stripe_Subscription_ID__c: subscriptionData.id,
            Membership_Type__c: membershipType,
            Membership_Status__c: subscriptionData.status === 'active' ? 'Active' : 'Cancelled',
            Membership_Start_Date__c: new Date().toISOString().split('T')[0]
        };
        
        // Try to find existing contact by email
        const existingContacts = await conn.query(
            `SELECT Id FROM Contact WHERE Email = '${customerData.email}' LIMIT 1`
        );
        
        if (existingContacts.records.length > 0) {
            // Update existing contact
            contactData.Id = existingContacts.records[0].Id;
            await conn.sobject('Contact').update(contactData);
            console.log('Updated contact:', customerData.email);
        } else {
            // Create new contact
            await conn.sobject('Contact').create(contactData);
            console.log('Created new contact:', customerData.email);
        }
        
        return true;
    } catch (error) {
        console.error('Error upserting contact:', error);
        return false;
    }
}

// Update contact status when subscription is cancelled
async function updateContactStatus(customerId, status) {
    try {
        const conn = await getSalesforceConnection();
        
        // Find contact by Stripe Customer ID
        const contacts = await conn.query(
            `SELECT Id FROM Contact WHERE Stripe_Customer_ID__c = '${customerId}' LIMIT 1`
        );
        
        if (contacts.records.length > 0) {
            await conn.sobject('Contact').update({
                Id: contacts.records[0].Id,
                Membership_Status__c: status === 'cancelled' ? 'Cancelled' : 'Active',
                Membership_End_Date__c: status === 'cancelled' ? new Date().toISOString().split('T')[0] : null
            });
            console.log('Updated contact status:', customerId, status);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error updating contact status:', error);
        return false;
    }
}

module.exports = {
    getSalesforceConnection,
    upsertContact,
    updateContactStatus
};