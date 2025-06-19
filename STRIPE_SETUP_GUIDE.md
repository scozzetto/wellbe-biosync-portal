# Stripe Setup Guide for Be Well

## Prerequisites
- Stripe account (create at https://stripe.com)
- Access to Netlify environment variables

## Step 1: Create Stripe Products and Prices

1. Log in to your Stripe Dashboard
2. Go to **Products** → **Add Product**

### Create Membership Products:

#### Restore Membership
- Name: "Be Well Restore Membership"
- Description: "$149 monthly credit with 10% discount"
- Pricing: $149.00 / month
- Save the price ID (starts with `price_`)

#### Revive Membership
- Name: "Be Well Revive Membership"
- Description: "$299 monthly credit with 15% discount"
- Pricing: $299.00 / month
- Save the price ID

#### Renew Membership
- Name: "Be Well Renew Membership"
- Description: "$499 monthly credit with 20% discount"
- Pricing: $499.00 / month
- Save the price ID

#### Total Wellness Membership
- Name: "Be Well Total Wellness Membership"
- Description: "$799 monthly credit with 25% discount"
- Pricing: $799.00 / month
- Save the price ID

## Step 2: Get Your API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your:
   - Publishable key (starts with `pk_`)
   - Secret key (starts with `sk_`)

## Step 3: Configure Netlify Environment Variables

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PRICE_RESTORE=price_your_restore_price_id
STRIPE_PRICE_REVIVE=price_your_revive_price_id
STRIPE_PRICE_RENEW=price_your_renew_price_id
STRIPE_PRICE_TOTAL_WELLNESS=price_your_total_wellness_price_id
URL=https://your-site-url.netlify.app
```

## Step 4: Update JavaScript Files

1. Edit `membership-purchase.js`:
   - Replace `pk_test_your_stripe_public_key_here` with your actual publishable key
   - Update the price IDs in `MEMBERSHIP_PRICES` object

## Step 5: Configure Webhooks (Optional but Recommended)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Step 6: Test Your Integration

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   
2. Test each membership tier
3. Test gift card purchases

## Step 7: Go Live

1. Switch to live API keys in Stripe
2. Update Netlify environment variables with live keys
3. Remove "test" from key prefixes

## Additional Notes

- Gift cards are created as one-time payments
- Memberships are recurring subscriptions
- All payments are processed through Stripe Checkout
- Customer data is managed in Stripe Dashboard