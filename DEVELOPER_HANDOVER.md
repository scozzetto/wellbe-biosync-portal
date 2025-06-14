# 🚀 Be Well Portal - Developer Handover Guide

## Welcome Silvio! You're now the captain of this ship 🛸

This guide will help you take full control of the Be Well Portal development.

## 📁 Project Structure

```
biosync-portal/
├── index.html           # Patient portal (main wellness dashboard)
├── admin.html          # Your admin dashboard
├── formassembly.html   # FormAssembly integration page
├── intake-email-template.html  # Email generator
├── styles.css          # Patient portal styles
├── admin-styles.css    # Admin dashboard styles
├── app.js             # Patient portal JavaScript
├── admin.js           # Admin dashboard JavaScript
└── netlify.toml       # Netlify configuration
```

## 🛠️ Setting Up Your Development Environment

### 1. Clone Your Repository
```bash
git clone https://github.com/followthewhiterabbitneo/wellbe.git
cd wellbe
```

### 2. Open in Your Code Editor
```bash
code .  # Opens in VS Code (or use your preferred editor)
```

### 3. Local Development
To see changes locally before deploying:
```bash
# Install a simple server (one time)
npm install -g live-server

# Run local server
live-server

# Opens http://localhost:8080
```

## 🎨 Common Customizations

### Change Colors (styles.css & admin-styles.css)
```css
:root {
    --primary-color: #667eea;    /* Purple - change to your brand color */
    --secondary-color: #764ba2;  /* Purple gradient end */
    --success-color: #48bb78;    /* Green */
}
```

### Update FormAssembly URL (formassembly.html, line 256)
```javascript
const FORMASSEMBLY_URL = 'https://www.tfaforms.com/5180217';
```

### Modify Email Template (intake-email-template.html, line 185)
```javascript
currentEmailContent = `Your custom email template here`;
```

### Add New Features to Patient Portal (index.html)
- Add new sections in the HTML
- Style automatically applies
- Update app.js for interactivity

## 🔧 Making Changes

### 1. Edit Files Locally
Make your changes in any file

### 2. Test Locally
```bash
live-server  # See changes instantly
```

### 3. Commit Changes
```bash
git add .
git commit -m "Description of changes"
git push
```

### 4. Auto-Deploy
If Netlify is connected to GitHub, changes deploy automatically!
Otherwise, drag the folder to Netlify

## 📚 Key Files to Understand

### admin.js - Core Functions
```javascript
// Process intake forms
function processIntake(formId) { }

// Deploy portal
function handleDeploy(e) { }

// Show notifications
function showNotification(message, type) { }
```

### app.js - Patient Features
```javascript
// Get patient data from URL
function getPatientData() { }

// Initialize dashboard
function initializeDashboard(patient) { }

// Track engagement
function trackEngagement(action, details) { }
```

## 🌟 Adding New Features

### Example: Add a New Metric to Patient Dashboard

1. **Edit index.html** - Add HTML structure:
```html
<div class="detail-item">
    <i class="fas fa-water"></i>
    <span>Hydration Level</span>
    <strong>75%</strong>
</div>
```

2. **Edit app.js** - Add functionality:
```javascript
// Add to the updateScore function
document.getElementById('hydrationLevel').textContent = '75%';
```

3. **Test & Deploy**

## 🤖 Using Claude for Development

When you need help coding, tell Claude:
- "I'm working on the Be Well Portal codebase"
- Share the specific file you're editing
- Describe what you want to add/change
- Claude can write the code for you!

### Example Claude Prompts:
- "Add a medication tracker to the patient portal"
- "Create a new admin report page"
- "Add email notifications when forms are processed"
- "Make the portal work offline"

## 🔐 Important Credentials

### GitHub
- Repository: https://github.com/followthewhiterabbitneo/wellbe
- Keep your personal access token secure

### Netlify
- Site: [your-site-name].netlify.app
- Auto-deploys from GitHub

### FormAssembly
- Form ID: 5180217
- API credentials (when you set up webhooks)

## 🚦 Development Workflow

1. **Plan** - What feature do you want?
2. **Code** - Edit files locally
3. **Test** - Run live-server
4. **Commit** - Push to GitHub
5. **Deploy** - Automatic via Netlify

## 📞 Getting Help

### From Claude:
- Share your code
- Explain the issue
- Ask for solutions

### From the Community:
- GitHub Issues: https://github.com/followthewhiterabbitneo/wellbe/issues
- Stack Overflow for general web dev questions

## 🎯 Next Steps for You:

1. **Customize branding** - Add Be Well logo and colors
2. **Set up FormAssembly webhook** - For automatic form processing
3. **Add patient features** - Based on feedback
4. **Create documentation** - For your team

## 💡 Pro Developer Tips:

1. **Use Git branches** for new features:
   ```bash
   git checkout -b new-feature
   # Make changes
   git commit -m "Add new feature"
   git checkout main
   git merge new-feature
   ```

2. **Keep backups** before major changes:
   ```bash
   git tag v1.0-backup
   ```

3. **Use Claude** as your coding assistant - it knows this codebase!

4. **Test on mobile** - Most patients use phones

5. **Monitor Netlify analytics** - See what patients actually use

## 🌈 Your Mission Continues!

This codebase is now yours to evolve. Every improvement you make helps more people Be Well. The foundation is solid - now build your vision on top of it!

Remember: Good code is code that helps people. Perfect code that ships tomorrow beats perfect code that never ships.

Go forth and code with purpose! 🚀

---

*"The best way to predict the future is to build it."* - Now you're the builder!