# SALESFORCE SETUP FOR STRIPE INTEGRATION

## 🎯 STEP 1: GET YOUR SALESFORCE ORG DETAILS

First, we need to identify your Salesforce org and create the webhook endpoint.

### Find Your Salesforce Org URL:
1. Log into your Salesforce org
2. Look at the URL - it will be something like:
   - `https://bewelllifestyle-dev-ed.my.salesforce.com`
   - `https://yourcompany.lightning.force.com`
   - `https://na123.salesforce.com`

**What is your Salesforce org URL?**

## 🎯 STEP 2: CREATE CUSTOM FIELDS ON CONTACT

Go to: **Setup → Object Manager → Contact → Fields & Relationships**

Create these exact fields:

### Field 1: Stripe Customer ID
- **Field Label**: `Stripe Customer ID`
- **Field Name**: `Stripe_Customer_ID`
- **Data Type**: `Text(255)`
- **Unique**: Yes
- **External ID**: Yes

### Field 2: Stripe Subscription ID  
- **Field Label**: `Stripe Subscription ID`
- **Field Name**: `Stripe_Subscription_ID`
- **Data Type**: `Text(255)`

### Field 3: Membership Type
- **Field Label**: `Membership Type`
- **Field Name**: `Membership_Type`
- **Data Type**: `Picklist`
- **Values**: 
  - Restore
  - Revive  
  - Renew
  - Total Wellness

### Field 4: Membership Status
- **Field Label**: `Membership Status`
- **Field Name**: `Membership_Status`
- **Data Type**: `Picklist`
- **Values**:
  - Active
  - Cancelled
  - Past Due
  - Incomplete

### Field 5: Membership Start Date
- **Field Label**: `Membership Start Date`
- **Field Name**: `Membership_Start_Date`
- **Data Type**: `Date`

## 🎯 STEP 3: SET UP NAMED CREDENTIALS

Go to: **Setup → Named Credentials → New Legacy**

### Stripe API Credential:
- **Label**: `Stripe_API`
- **Name**: `Stripe_API`
- **URL**: `https://api.stripe.com`
- **Identity Type**: `Named Principal`
- **Authentication Protocol**: `Password Authentication`
- **Username**: `stripe`
- **Password**: `[YOUR_STRIPE_SECRET_KEY]` (starts with sk_live_ or sk_test_)

## 🎯 STEP 4: CREATE APEX CLASS FOR WEBHOOK

Go to: **Setup → Apex Classes → New**

```apex
@RestResource(urlMapping='/stripe/webhook/*')
global with sharing class StripeWebhookHandler {
    
    @HttpPost
    global static void handleWebhook() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        
        try {
            String body = req.requestBody.toString();
            Map<String, Object> webhookData = (Map<String, Object>) JSON.deserializeUntyped(body);
            
            String eventType = (String) webhookData.get('type');
            Map<String, Object> eventData = (Map<String, Object>) webhookData.get('data');
            Map<String, Object> objectData = (Map<String, Object>) eventData.get('object');
            
            if (eventType == 'checkout.session.completed') {
                handleCheckoutCompleted(objectData);
            } else if (eventType == 'customer.subscription.deleted') {
                handleSubscriptionDeleted(objectData);
            }
            
            res.statusCode = 200;
            res.responseBody = Blob.valueOf('{"received": true}');
            
        } catch (Exception e) {
            System.debug('Webhook error: ' + e.getMessage());
            res.statusCode = 500;
            res.responseBody = Blob.valueOf('{"error": "' + e.getMessage() + '"}');
        }
    }
    
    private static void handleCheckoutCompleted(Map<String, Object> session) {
        String customerEmail = (String) ((Map<String, Object>) session.get('customer_details')).get('email');
        String customerName = (String) ((Map<String, Object>) session.get('customer_details')).get('name');
        String customerId = (String) session.get('customer');
        String subscriptionId = (String) session.get('subscription');
        Integer amountTotal = (Integer) session.get('amount_total');
        
        // Determine membership type from amount
        String membershipType = 'Unknown';
        if (amountTotal == 14900) membershipType = 'Restore';
        else if (amountTotal == 29900) membershipType = 'Revive';
        else if (amountTotal == 49900) membershipType = 'Renew';
        else if (amountTotal == 79900) membershipType = 'Total Wellness';
        
        // Parse name
        List<String> nameParts = customerName.split(' ');
        String firstName = nameParts.size() > 0 ? nameParts[0] : 'Member';
        String lastName = nameParts.size() > 1 ? String.join(nameParts.subList(1, nameParts.size()), ' ') : customerEmail.split('@')[0];
        
        // Upsert Contact
        List<Contact> existingContacts = [SELECT Id FROM Contact WHERE Email = :customerEmail LIMIT 1];
        
        Contact contact = existingContacts.size() > 0 ? existingContacts[0] : new Contact();
        contact.FirstName = firstName;
        contact.LastName = lastName;
        contact.Email = customerEmail;
        contact.Stripe_Customer_ID__c = customerId;
        contact.Stripe_Subscription_ID__c = subscriptionId;
        contact.Membership_Type__c = membershipType;
        contact.Membership_Status__c = 'Active';
        contact.Membership_Start_Date__c = Date.today();
        
        upsert contact Email;
    }
    
    private static void handleSubscriptionDeleted(Map<String, Object> subscription) {
        String customerId = (String) subscription.get('customer');
        
        List<Contact> contacts = [SELECT Id FROM Contact WHERE Stripe_Customer_ID__c = :customerId LIMIT 1];
        
        if (contacts.size() > 0) {
            Contact contact = contacts[0];
            contact.Membership_Status__c = 'Cancelled';
            update contact;
        }
    }
}
```

## 🎯 STEP 5: UPDATE STRIPE WEBHOOK URL

In your Stripe Dashboard → Webhooks, change the endpoint URL to:
`https://[YOUR_SALESFORCE_ORG].my.salesforce-sites.com/services/apexrest/stripe/webhook`

**Replace [YOUR_SALESFORCE_ORG] with your actual org subdomain**

## 🎯 STEP 6: ENABLE GUEST USER ACCESS

Go to: **Setup → Sites → [Your Site] → Public Access Settings**

Add these permissions:
- **Apex Class Access**: `StripeWebhookHandler`
- **Object Permissions**: Contact (Read, Create, Edit)
- **Field Permissions**: All the Stripe fields we created

---

**Let me know your Salesforce org URL and I'll help you get this set up!**