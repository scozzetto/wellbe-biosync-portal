#!/bin/bash

# Be Well Portal - Automated Deployment Script
# This script deploys the BioSync portal to Netlify

echo "🚀 Be Well Portal Deployment Script"
echo "=================================="

# Use existing Netlify CLI from bewell-app
NETLIFY_CLI="/Users/silviomac/bewell-app/node_modules/.bin/netlify"

# Check if logged in to Netlify
$NETLIFY_CLI status &> /dev/null
if [ $? -ne 0 ]; then
    echo "📝 Please log in to Netlify:"
    $NETLIFY_CLI login
fi

# Site name
SITE_NAME="bewell-biosync-portal"

# Deploy to Netlify (this will create the site if it doesn't exist)
echo "📦 Deploying to Netlify..."
$NETLIFY_CLI deploy --prod --dir .

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your site is live at: https://$SITE_NAME.netlify.app"
    echo ""
    echo "📋 What's deployed:"
    echo "  - Patient Portal: https://$SITE_NAME.netlify.app"
    echo "  - Admin Dashboard: https://$SITE_NAME.netlify.app/admin.html"
    echo ""
    echo "🎯 Next steps for Silvio:"
    echo "  1. Visit the admin dashboard to manage patients"
    echo "  2. Use Quick Deploy to create patient portals"
    echo "  3. Share patient links: https://$SITE_NAME.netlify.app?name=PatientName"
else
    echo "❌ Deployment failed. Please check your configuration."
fi