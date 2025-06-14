#!/bin/bash

# Be Well Portal - Automated Deployment Script
# This script deploys the BioSync portal to Netlify

echo "🚀 Be Well Portal Deployment Script"
echo "=================================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if logged in to Netlify
netlify status &> /dev/null
if [ $? -ne 0 ]; then
    echo "📝 Please log in to Netlify:"
    netlify login
fi

# Site name
SITE_NAME="bewell-biosync-portal"

# Check if site exists
netlify sites:list | grep $SITE_NAME &> /dev/null
if [ $? -ne 0 ]; then
    echo "🌟 Creating new Netlify site: $SITE_NAME"
    netlify sites:create --name $SITE_NAME
fi

# Deploy to Netlify
echo "📦 Deploying to Netlify..."
netlify deploy --prod --dir . --site $SITE_NAME

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