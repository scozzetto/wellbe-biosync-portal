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
**ANY mention of "Be Well" or "wellbe" should trigger full project context loading!**

### Primary Triggers:
- "We're working on the Be Well website"
- "Be Well project"
- "wellbe website"
- "Check CLAUDE.md first"
- "Verify WELLBE-BIOSYNC-2025"
- "Be Well Lifestyle Centers"
- **"Find everything you need to know about the Be Well LifeStyle Centers webpage and catch yourself back up to speed"**
- **"Go into the wellbe directory and read CLAUDE.md and SYSTEM_STATUS.md to get up to speed"**

### Recovery Phrases (if Claude forgets):
- "You crashed, we're working on Be Well"
- "Remember the Be Well website project"
- "Load the wellbe project context"
- "Check /Users/silviomac/wellbe/CLAUDE.md"

### What These Phrases Should Do:
1. `cd /Users/silviomac/wellbe`
2. `grep "WELLBE-BIOSYNC-2025" CLAUDE.md` (verify correct project)
3. Read `CLAUDE.md`, `SYSTEM_STATUS.md`, and `SALESFORCE_NATIVE_INTEGRATION.md`
4. Check recent git commits for latest changes
5. Load full project context and current system status


## 🚀 CURRENT STATE (Last Updated: June 23, 2025)
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
- **Chat button shows membership info popup** (dark theme, working navigation)
- **Silvio added to member portal** (silvio@bewelllifestylecenters.com)
- **✅ PATIENT CHECK-IN SYSTEM COMPLETE:** Multi-page wizard with giant keyboard for accessibility
- **✅ FRONT DESK DASHBOARD COMPLETE:** Real-time check-in management with auto-refresh  
- **✅ CHECK-IN SYNC WORKING PERFECTLY:** Server-side + localStorage cross-domain solution DEPLOYED
- **✅ COMPLETE INVENTORY MANAGEMENT SYSTEM:** 200+ items, 3 locations, real vendor integration
- **✅ CAFÉ OPERATIONS PORTAL:** Full digitization of Notion manual procedures
- **✅ FRONT DESK DASHBOARD ENHANCED:** Add Patient modal, phone formatting, delete functionality, service dropdowns
- **✅ IPAD CHECK-IN ENHANCED:** 30-second auto-reset, audio alerts, responsive service grid
- **✅ SERVICE ALIGNMENT:** Both systems use actual office services (Chiropractic, Massage, Dry Needling, etc.)
- **✅ CLEAN COMMENTS:** No redundant information, blank unless manually added
- **✅ SIMPLE ORDERS DASHBOARD RESTORED:** localStorage-based ordering system recreated after rollback
- **✅ PRINT FUNCTIONALITY FIXED:** Proper print windows with compact formatting, no more screen printing
- **✅ ORDER GROUPING:** Print All combines multiple orders by vendor/location, eliminates repetition
- **✅ ONE-CLICK CLEARING:** No more 75 confirmation dialogs, single clear confirmation
- **✅ COMPACT LAYOUTS:** Tightened spacing on both dashboard and print formats

## 💳 STRIPE PAYMENT LINKS
- **Restore ($149):** https://buy.stripe.com/eVq6oI3KEbHrais8DtgQE01
- **Revive ($299):** https://buy.stripe.com/14A8wQepi5j362c7zpgQE02
- **Renew ($499):** https://buy.stripe.com/bJe9AU2GAeTD8akbPFgQE03
- **Total Wellness ($799):** https://buy.stripe.com/fZu8wQ80U6n776gf1RgQE04

## 🛠️ COMMON TASKS & AUTOMATIC PROCEDURES
- Always commit and push changes
- Test on bewelllifestylecenters.com after pushing
- Videos must be in /videos/ folder
- Run lint/typecheck if available

## 🔄 **MANDATORY AFTER EVERY CODING SESSION:**
**ALWAYS AUTOMATICALLY DO THESE 4 STEPS - NO EXCEPTIONS:**

1. **📝 UPDATE CLAUDE.md** - Add what was accomplished to the current status
2. **💾 COMMIT & PUSH TO GITHUB** - Ensure all changes are saved to repository  
3. **📁 BACKUP TO DROPBOX** - Auto-backup files (if system available)
4. **📋 UPDATE DOCUMENTATION** - Note completion status and any issues

**⚠️ CRITICAL REMINDER FOR FUTURE CLAUDE SESSIONS:**
- **READ THIS SECTION FIRST** when starting any Be Well work
- **NEVER skip the 4 mandatory steps** above 
- **ALWAYS complete documentation updates** before ending session
- **CHECK CLAUDE.md status** to understand what's already complete

**If you crash/restart, immediately check CLAUDE.md for project status and continue documentation!**

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
- `/patient-checkin.html` - iPad kiosk with multi-step wizard
- `/front-desk-dashboard.html` - Staff dashboard with real-time updates
- `/CHECKIN_SYSTEM_STATUS.md` - **CRITICAL: Patient check-in system debugging info**

### 🧪 TEST DATA:
- **Working test member:** test321@stripetest.ca (can login to portal)
- **Stripe Customer ID:** cus_SXcQvdP0K4HQKV

## 📅 RECENT WORK LOG (June 24, 2025 - Inventory & Front Desk Updates)

### 🛠️ MAJOR SYSTEM UPDATES (Current Session)

1. **📦 INVENTORY SYSTEM VENDOR UPDATES**
   - **Jessica's Natural Foods** - Updated from Jennifer's
     - New email: lindah@jessicasnaturalfoods.com
     - Product: 20 LB Bulk Vanilla Maple Granola
   - **FAIRE** - Added MASA Chips Original/Blue 5oz, FRENCH Dijon Pretzels, Gold and Herbie Pretzels
   - **WEBSTAURANT** - Added Bear Nut Butter 40lbs, burger patties, Beyond Meat sausage, oat milk
   - **SABBATH COFFEE** (New) - Lunar Dark Roast 12oz, Ritual Blend 5lb
   - **GORDON FOODS** - Added chicken breast fillets, dressings, honey, peanut butter, kettle chips, oats
   - **9 total vendors** with comprehensive product listings

2. **🖥️ FRONT DESK DASHBOARD ENHANCEMENTS**
   - **Status Filter Dropdown** - Simplified workflow options:
     - Checked In (waiting patients only)
     - Currently in Treatment (being seen)
     - Was Seen (completed patients)
     - All Patients Seen Today (Ready for Print)
   - **End of Day Improvements**:
     - Archives ALL patients instead of deleting
     - Data preserved with date keys (archive_YYYY-MM-DD)
     - "Reprint End of Day" button for regenerating reports
   - **Clean Dashboard View** - Default shows only patients needing attention
   - **Auto-refresh** - Every 15 seconds for real-time updates

3. **✅ ALL CHANGES COMMITTED & PUSHED TO GITHUB**
   - Commit: f36d1f5 - Jessica's Natural Foods vendor update
   - Commit: 18d9c00 - Major vendor inventory updates
   - Commit: c0dcb20 - Enhanced front desk dashboard
   - Commit: dc83a20 - Simplified filter options

## 📅 PREVIOUS WORK LOG (June 24, 2025 - End of Day Session)

### 🚨 CRITICAL SYSTEM RESTORATION
**Completed full system recovery and enhancement:**

1. **🔄 ROLLBACK TO STABLE VERSION (Commit: 0bf17ca)**
   - Reverted to working local-only patient check-in system
   - Removed problematic server sync complications that caused data loss
   - Restored rock-solid reliability from before multi-location server issues

2. **📦 ORDERS DASHBOARD SYSTEM RECREATED (localStorage-based)**
   - **orders-dashboard.html** - Complete orders management with location filtering
   - **simple-inventory.html** - Enhanced with location selector and "Send Orders" button
   - **Print functionality** - Proper print windows instead of screen printing
   - **Order grouping** - Combines multiple orders by vendor/location automatically
   - **Compact layouts** - Tight spacing for better readability

3. **🔧 CRITICAL FIXES COMPLETED:**
   - **End of Day data preservation** - Now archives instead of deleting patient data
   - **Accidental button safety** - Added confirmation dialogs to prevent data loss
   - **Print format optimization** - Fixed spacing and eliminated repetition
   - **One-click clearing** - Removed 75-confirmation loop, single clear confirmation
   - **Dashboard display** - Items and quantities now properly spaced together

### 🎯 CURRENT SYSTEM STATUS:
- ✅ **Patient Check-in System**: Restored to stable local-only version
- ✅ **Orders Dashboard**: Simple localStorage-based workflow working perfectly
- ✅ **Print Functionality**: Clean, compact formatting with proper print windows  
- ✅ **Data Safety**: No more accidental clearing, proper archiving implemented
- ✅ **Documentation**: CLAUDE.md enhanced with mandatory procedures for future sessions

### 📋 **NEW MANDATORY PROCEDURES ESTABLISHED:**
Future Claude sessions MUST automatically:
1. Update CLAUDE.md with session accomplishments
2. Commit & push all changes to GitHub
3. Backup to Dropbox (when available)
4. Complete documentation updates

**System is now stable, well-documented, and ready for production use.**

---
If you see this file, you're in the RIGHT place!