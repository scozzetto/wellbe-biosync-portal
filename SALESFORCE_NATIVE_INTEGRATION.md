# SALESFORCE NATIVE STRIPE INTEGRATION GUIDE

## 🎯 REPLACE MANUAL CREDENTIALS WITH NATIVE CONNECTOR

Instead of using manual Salesforce credentials, we need to use the **Stripe for Salesforce Platform** native app from AppExchange.

## 📋 SETUP PROCESS

### 1. INSTALL STRIPE FOR SALESFORCE PLATFORM
- Go to Salesforce AppExchange
- Search for "Stripe for Salesforce Platform" 
- Install for Admins Only (recommended)
- App Link: https://appexchange.salesforce.com/appxListingDetail?listingId=4dff0f8e-0b10-47c2-a3a3-f3905e7f7927

### 2. CONFIGURE THE CONNECTOR
```
App Launcher → Stripe for Salesforce Platform → Get Started
```

**Authentication Steps:**
1. Click "Authorize" to grant org access
2. Enter your Stripe API Key (live mode for production)
3. Click "Add Account"
4. Choose latest Stripe API version
5. Click "Install Package"

### 3. CONFIGURE WEBHOOKS IN SALESFORCE
```
Stripe for Salesforce Platform → Account Management → All Webhook Events
```

**Enable these events:**
- `customer.subscription.created`
- `customer.subscription.updated` 
- `customer.subscription.deleted`
- `checkout.session.completed`
- `invoice.payment_succeeded`

### 4. GET SALESFORCE WEBHOOK ENDPOINT
The native connector will provide a Salesforce endpoint like:
```
https://yourorg.my.salesforce-sites.com/services/apexrest/stripe/webhook
```

### 5. UPDATE STRIPE WEBHOOK CONFIGURATION
In Stripe Dashboard → Webhooks:
- Replace our Netlify endpoint with the Salesforce endpoint
- Keep the same events selected
- Remove the current webhook secret (Salesforce handles authentication)

## 🔄 MODIFY OUR INTEGRATION

### Current Flow (Manual):
```
Stripe → Netlify Webhook → Manual Salesforce API calls
```

### New Flow (Native):
```
Stripe → Salesforce Native Webhook → Automatic Contact Creation
```

### Code Changes Needed:

1. **Remove manual Salesforce sync from our webhook**
2. **Let Salesforce handle contact creation automatically**
3. **Keep our member database for portal functionality**
4. **Add Salesforce contact lookup if needed**

## 🛠️ IMPLEMENTATION STEPS

### Step 1: Update webhook function
Remove the Salesforce sync calls from `stripe-webhook.js`:

```javascript
// REMOVE THESE LINES:
// await salesforce.upsertContact(customerData, subscriptionData);

// KEEP: Local member database creation for portal
await memberDB.createMember(customerData, subscriptionData);
```

### Step 2: Configure Field Mapping in Salesforce
Map Stripe data to Salesforce Contact fields:
- `data.object.id` → `Stripe_Customer_ID__c`
- `data.object.email` → `Email`
- `data.object.name` → `FirstName` + `LastName`

### Step 3: Test Integration
1. Complete a test purchase
2. Verify contact creation in Salesforce
3. Verify member portal still works
4. Check data synchronization

## 📊 BENEFITS OF NATIVE INTEGRATION

1. **No manual credentials needed**
2. **Automatic field mapping**
3. **Built-in error handling**
4. **Salesforce Flow Builder support**
5. **Real-time data sync**
6. **Recursion detection**
7. **Sandbox support**

## 🚨 CRITICAL NOTES

- **Don't copy configurations between environments**
- **Configure each Salesforce org independently** 
- **Use appropriate API keys (test vs live)**
- **Monitor sync logs in Salesforce**

---

**Next Action:** Install the Stripe for Salesforce Platform app and configure the native webhook integration.