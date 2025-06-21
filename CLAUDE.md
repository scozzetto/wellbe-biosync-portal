# CLAUDE PROJECT IDENTIFIER - BE WELL LIFESTYLE CENTERS

## 🎯 PROJECT VERIFICATION
**UNIQUE ID**: WELLBE-BIOSYNC-2025
**This is the CORRECT wellBe project folder**

## 📁 CRITICAL PATHS
- **Working Directory**: `/Users/silviomac/wellbe`
- **Main File**: `/Users/silviomac/wellbe/index.html` (NOT transformation-hub.html)
- **GitHub**: https://github.com/scozzetto/wellbe-biosync-portal

## ⚠️ IMPORTANT REMINDERS
1. **Netlify serves index.html** - Always update index.html, not transformation-hub.html
2. **Videos folder**: `/Users/silviomac/wellbe/videos/`
3. **Live domain**: https://bewelllifestylecenters.com

## 🔍 VERIFICATION COMMANDS
When starting work, run these:
```bash
pwd  # Should show: /Users/silviomac/wellbe
ls CLAUDE.md  # Should find this file
grep "WELLBE-BIOSYNC-2025" CLAUDE.md  # Should return this unique ID
```

## 💡 MAGIC PHRASES TO TELL CLAUDE
- "Check the Be Well website files"
- "This is the main Be Well website"
- "Be Well website project"
- "Check CLAUDE.md first"
- "Verify WELLBE-BIOSYNC-2025"
- "This is the wellBe project with the splash video"

## 🚀 CURRENT STATE (Last Updated: June 21, 2025 - 4:15 PM)
- Splash screen: 4-second video with white disc logo
- Header: Transparent luxury design with white text
- Hero: "It's Time to Transform"
- All services have header images
- Square booking and café integration active
- **STRIPE PAYMENTS LIVE:** All 4 membership tiers connected to Stripe Payment Links
- **✅ STRIPE WEBHOOK WORKING:** Signature verification successful, processing events
- **✅ MEMBER PORTAL WORKING:** Magic link authentication, member lookup functional
- **⚠️ SALESFORCE PARTIALLY WORKING:** Code ready, but credentials needed for full sync
- Staff knowledge base with password protection
- Admin dashboard for member management
- Website live and fully operational at bewelllifestylecenters.com

## 💳 STRIPE PAYMENT LINKS
- **Restore ($149):** https://buy.stripe.com/eVq6oI3KEbHrais8DtgQE01
- **Revive ($299):** https://buy.stripe.com/14A8wQepi5j362c7zpgQE02
- **Renew ($499):** https://buy.stripe.com/bJe9AU2GAeTD8akbPFgQE03
- **Total Wellness ($799):** https://buy.stripe.com/fZu8wQ80U6n776gf1RgQE04

## 🛠️ COMMON TASKS
- Always commit and push changes
- Test on bewelllifestylecenters.com after pushing
- Videos must be in /videos/ folder
- Run lint/typecheck if available
- **ALWAYS ASK "Should I push these changes?" after committing**

## 🔧 SYSTEM STATUS & TROUBLESHOOTING (Current as of June 21, 2025 4:15 PM)

### ✅ WORKING SYSTEMS:
- **Stripe Integration:** Webhook receiving events, signature verification working
- **Member Portal:** Login, member data display, credit tracking functional
- **Netlify Functions:** All 6 functions deployed and running
- **Website:** Live at bewelllifestylecenters.com
- **Git Repository:** https://github.com/scozzetto/wellbe-biosync-portal

### ⚠️ NEEDS ATTENTION:
- **Salesforce Sync:** Code ready, needs environment variables:
  - SALESFORCE_USERNAME
  - SALESFORCE_PASSWORD  
  - SALESFORCE_SECURITY_TOKEN
  - SALESFORCE_LOGIN_URL (optional, defaults to https://login.salesforce.com)

### 🔑 IMPORTANT FILES:
- `/netlify/functions/stripe-webhook.js` - Main webhook processor
- `/netlify/functions/member-lookup.js` - Member portal backend
- `/netlify/functions/salesforce-sync.js` - Salesforce integration
- `/member-portal.html` - Member portal frontend

### 🧪 TEST DATA:
- **Working test member:** test321@stripetest.ca (can login to portal)
- **Stripe Customer ID:** cus_SXcQvdP0K4HQKV

---
If you see this file, you're in the RIGHT place!