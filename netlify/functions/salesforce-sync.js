// Salesforce sync utilities
const jsforce = require('jsforce');

// Initialize Salesforce connection
async function getSalesforceConnection() {
    console.log('=== SALESFORCE CONNECTION START ===');
    
    const loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';
    console.log('Login URL:', loginUrl);
    console.log('Username configured:', !!process.env.SALESFORCE_USERNAME);
    console.log('Password configured:', !!process.env.SALESFORCE_PASSWORD);
    
    const conn = new jsforce.Connection({
        loginUrl: loginUrl
    });
    
    try {
        console.log('Attempting Salesforce login...');
        
        // Combine password and security token
        let password = process.env.SALESFORCE_PASSWORD;
        if (process.env.SALESFORCE_SECURITY_TOKEN) {
            password += process.env.SALESFORCE_SECURITY_TOKEN;
        }
        
        console.log('Password + token length:', password ? password.length : 0);
        
        const loginResult = await conn.login(
            process.env.SALESFORCE_USERNAME,
            password
        );
        
        console.log('✓ Salesforce login successful');
        console.log('Session ID length:', conn.sessionId ? conn.sessionId.length : 0);
        console.log('Instance URL:', conn.instanceUrl);
        console.log('User info:', JSON.stringify(loginResult, null, 2));
        
        return conn;
    } catch (error) {
        console.error('=== SALESFORCE LOGIN ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.errorCode);
        console.error('Full error:', JSON.stringify(error, null, 2));
        console.error('=== END LOGIN ERROR ===');
        throw error;
    }
}

// Create or update Contact in Salesforce
async function upsertContact(customerData, subscriptionData) {
    console.log('=== SALESFORCE UPSERT START ===');
    console.log('Customer data:', JSON.stringify(customerData, null, 2));
    console.log('Subscription data:', JSON.stringify(subscriptionData, null, 2));
    
    try {
        // Check if Salesforce credentials are configured
        if (!process.env.SALESFORCE_USERNAME || !process.env.SALESFORCE_PASSWORD) {
            console.log('Salesforce credentials not configured, skipping sync');
            return { success: false, reason: 'credentials_not_configured' };
        }
        
        console.log('Getting Salesforce connection...');
        const conn = await getSalesforceConnection();
        console.log('Connected to Salesforce successfully');
        
        // Map membership type from price or amount
        const membershipTypes = {
            // Price-based mapping
            'price_1RcG9kLeFHoi9neBS2g9QaLb': 'Restore',   // $149
            'price_1RcGDWLeFHoi9neBqZ7MrZDy': 'Revive',    // $299
            'price_1RcGECLeFHoi9neBBTJKdYSH': 'Renew',     // $499
            'price_1RcGEsLeFHoi9neBWeGknCVv': 'Total Wellness', // $799
            // Amount-based mapping (fallback)
            14900: 'Restore',
            29900: 'Revive', 
            49900: 'Renew',
            79900: 'Total Wellness'
        };
        
        // Determine membership type
        let membershipType = 'Unknown';
        if (subscriptionData.priceId && membershipTypes[subscriptionData.priceId]) {
            membershipType = membershipTypes[subscriptionData.priceId];
        } else if (subscriptionData.amount && membershipTypes[subscriptionData.amount]) {
            membershipType = membershipTypes[subscriptionData.amount];
        }
        
        console.log('Determined membership type:', membershipType);
        
        // Prepare contact data
        const nameParts = (customerData.name || customerData.email).split(' ');
        const firstName = nameParts[0] || 'Member';
        const lastName = nameParts.slice(1).join(' ') || customerData.email.split('@')[0];
        
        const contactData = {
            Email: customerData.email,
            FirstName: firstName,
            LastName: lastName
        };
        
        // Add custom fields if they exist in Salesforce
        // Note: These fields need to be created in Salesforce first
        const customFields = {
            Stripe_Customer_ID__c: customerData.id,
            Stripe_Subscription_ID__c: subscriptionData.id,
            Membership_Type__c: membershipType,
            Membership_Status__c: subscriptionData.status === 'active' ? 'Active' : 'Cancelled',
            Membership_Start_Date__c: new Date().toISOString().split('T')[0]
        };
        
        console.log('Contact data (standard fields):', JSON.stringify(contactData, null, 2));
        console.log('Custom fields to add:', JSON.stringify(customFields, null, 2));
        
        // Check if contact exists
        console.log('Querying for existing contact...');
        const query = `SELECT Id FROM Contact WHERE Email = '${customerData.email.replace(/'/g, "\\'")}'`;
        console.log('SOQL Query:', query);
        
        const existingContacts = await conn.query(query);
        console.log('Query result:', JSON.stringify(existingContacts, null, 2));
        
        let result;
        if (existingContacts.records && existingContacts.records.length > 0) {
            // Update existing contact
            console.log('Updating existing contact...');
            contactData.Id = existingContacts.records[0].Id;
            
            // Try to add custom fields, but don't fail if they don't exist
            try {
                Object.assign(contactData, customFields);
            } catch (customFieldError) {
                console.log('Custom fields not available, using standard fields only');
            }
            
            console.log('Final update data:', JSON.stringify(contactData, null, 2));
            result = await conn.sobject('Contact').update(contactData);
            console.log('✓ Updated contact result:', JSON.stringify(result, null, 2));
        } else {
            // Create new contact
            console.log('Creating new contact...');
            
            // Try to add custom fields, but don't fail if they don't exist
            try {
                Object.assign(contactData, customFields);
            } catch (customFieldError) {
                console.log('Custom fields not available, using standard fields only');
            }
            
            console.log('Final create data:', JSON.stringify(contactData, null, 2));
            result = await conn.sobject('Contact').create(contactData);
            console.log('✓ Created contact result:', JSON.stringify(result, null, 2));
        }
        
        console.log('=== SALESFORCE UPSERT SUCCESS ===');
        return { success: true, result: result };
        
    } catch (error) {
        console.error('=== SALESFORCE UPSERT ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.errorCode);
        console.error('Full error:', JSON.stringify(error, null, 2));
        console.error('Stack trace:', error.stack);
        console.error('=== END SALESFORCE ERROR ===');
        return { success: false, error: error.message };
    }
}

// Update contact status when subscription is cancelled
async function updateContactStatus(customerId, status) {
    console.log('=== SALESFORCE STATUS UPDATE START ===');
    console.log('Customer ID:', customerId);
    console.log('New status:', status);
    
    try {
        // Check if Salesforce credentials are configured
        if (!process.env.SALESFORCE_USERNAME || !process.env.SALESFORCE_PASSWORD) {
            console.log('Salesforce credentials not configured, skipping update');
            return { success: false, reason: 'credentials_not_configured' };
        }
        
        const conn = await getSalesforceConnection();
        
        // Find contact by Stripe Customer ID or email
        console.log('Querying for contact with Stripe Customer ID:', customerId);
        let query = `SELECT Id, Email FROM Contact WHERE Stripe_Customer_ID__c = '${customerId}' LIMIT 1`;
        console.log('SOQL Query:', query);
        
        const contacts = await conn.query(query);
        console.log('Query result:', JSON.stringify(contacts, null, 2));
        
        if (contacts.records && contacts.records.length > 0) {
            const updateData = {
                Id: contacts.records[0].Id,
                Membership_Status__c: status === 'cancelled' ? 'Cancelled' : 'Active'
            };
            
            if (status === 'cancelled') {
                updateData.Membership_End_Date__c = new Date().toISOString().split('T')[0];
            }
            
            console.log('Updating contact with data:', JSON.stringify(updateData, null, 2));
            const result = await conn.sobject('Contact').update(updateData);
            console.log('✓ Contact status update result:', JSON.stringify(result, null, 2));
            
            return { success: true, result: result };
        } else {
            console.log('No contact found with Stripe Customer ID:', customerId);
            return { success: false, reason: 'contact_not_found' };
        }
        
    } catch (error) {
        console.error('=== SALESFORCE STATUS UPDATE ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        return { success: false, error: error.message };
    }
}

module.exports = {
    getSalesforceConnection,
    upsertContact,
    updateContactStatus
};