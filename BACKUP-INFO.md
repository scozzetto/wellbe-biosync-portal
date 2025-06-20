# Be Well LifeStyle Centers - Backup Information

## Last Backup Date: June 20, 2025

## Current State Summary

### Website Features
- **Splash Screen**: 4-second video splash with Be Well logo in white disc
- **Header**: Luxury transparent design with white elements
- **Services**: All service pages with header images
- **Booking**: Square booking integration
- **Café**: Order from café button in header

### Key URLs
- Live Site: https://bewelllifestylecenters.com
- GitHub Repo: https://github.com/scozzetto/wellbe-biosync-portal
- Booking: https://book.squareup.com/appointments/6pyjoccl1ik8ur/location/101VJFBVK1T29/services
- Café Orders: https://be-well-lifestyle-centers.square.site/

### Recovery Commands
To restore from backup:
```bash
# Extract backup
tar -xzf wellbe-backup-20250620-081423.tar.gz

# Or clone from GitHub
git clone https://github.com/scozzetto/wellbe-biosync-portal.git

# To revert to this specific version
git checkout v1.0-milestone
```

### Critical Files
- index.html - Main landing page
- transformation-hub.html - Original main page
- styles.css - All styling
- videos/wellness-hero.mp4 - Hero video
- videos/happy-people-splash.mp4 - Splash screen video

### Recent Changes
1. Added video splash screen with 4-second timing
2. Updated header to luxury transparent design
3. Added "Text or Call" to phone number
4. Removed location names from wellness text
5. Added café ordering button
6. Increased logo size to 65px

### DNS Configuration (GoDaddy)
- A Record: @ → 75.2.60.5
- CNAME Record: www → bewell-lifestyle-centers.netlify.app