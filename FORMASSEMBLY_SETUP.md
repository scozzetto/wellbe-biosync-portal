# 🔗 FormAssembly Integration Setup

## For Silvio - Connect Your BioSync Forms!

### 📋 What This Does

The FormAssembly integration page (`formassembly.html`) gives you:

1. **Check New Forms** - See all unprocessed intake forms
2. **Send Intake Form** - Email form links to new patients  
3. **Process All** - Auto-create portals for all pending intakes

### 🚀 How to Connect FormAssembly

#### Step 1: Get Your Form URL
1. Login to FormAssembly
2. Find your BioSync intake form
3. Copy the form URL (looks like: `https://yourorg.tfaforms.net/123456`)

#### Step 2: Update the Integration
Edit line 196 in `formassembly.html`:
```javascript
const FORMASSEMBLY_URL = 'https://your-org.tfaforms.net/biosync-intake';
```
Replace with your actual form URL.

#### Step 3: Set Up Webhook (Optional - For Auto-Processing)

In FormAssembly:
1. Go to your form → Notifications → Webhooks
2. Add webhook URL: `https://your-site.netlify.app/api/intake`
3. Method: POST
4. Format: JSON

### 📧 Sending Forms to Patients

Click "Send Intake Form" and enter:
- Patient name
- Email address  
- Phone (optional)

The system will:
- Generate a personalized form link
- Copy it to clipboard
- In production: Email it directly to patient

### 🔄 Processing Workflow

1. **Patient fills form** on FormAssembly
2. **Check New Forms** shows pending intakes
3. **Click "Process & Deploy"** to:
   - Create patient portal
   - Deploy to Netlify
   - Update status to processed
   - Open portal URL

### 🎯 Quick Actions

- **Process single form**: Click "Process & Deploy" next to any form
- **Process all at once**: Click "Process All" to handle multiple forms
- **View deployed portal**: Click "View Portal" for processed patients

### 🔧 Advanced: Netlify Functions Setup

To fully automate with webhooks, create `netlify/functions/intake.js`:

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    const formData = JSON.parse(event.body);
    
    // Process FormAssembly data
    // Create patient portal
    // Deploy to Netlify
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Intake processed',
        portalUrl: 'https://patient-portal.netlify.app'
      })
    };
  }
};
```

### 💡 Tips

1. **Test with demo**: Click "Check New Forms" to see demo data
2. **Bulk processing**: Process multiple forms with one click
3. **Direct links**: Each processed form shows the live portal URL
4. **Auto-refresh**: Page checks for new forms every 30 seconds

### 🎉 Benefits

- No more manual copying from FormAssembly
- Instant portal creation
- Track all patient intakes in one place
- Send forms directly from the dashboard
- See processing status at a glance

---

**Remember**: This integration saves hours of manual work, letting you focus on helping patients Be Well! 🌟