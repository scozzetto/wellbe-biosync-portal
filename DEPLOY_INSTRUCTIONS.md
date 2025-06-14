# 🚀 Deploy Be Well Portal to GitHub & Netlify

## Step 1: Push to GitHub

Run these commands in your terminal:

```bash
cd /home/ecsti/biosync-portal
git push -u origin main
```

When prompted:
- Username: `followthewhiterabbitneo`
- Password: Use your GitHub personal access token (not your password)

### Need a GitHub Token?
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` permissions
3. Use that token as your password

## Step 2: Deploy on Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Authorize Netlify to access your GitHub
5. Select the **`wellbe`** repository
6. Configure deployment:
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
   - Click **"Deploy site"**

## Step 3: Your Live Site! 🎉

Within 30 seconds, you'll have:
- Patient Portal: `https://[site-name].netlify.app`
- Admin Dashboard: `https://[site-name].netlify.app/admin.html`

## Step 4: Make It Official (Optional)

### Custom Domain
1. In Netlify → Domain settings
2. Add custom domain (e.g., `portal.bewell.com`)
3. Follow DNS instructions

### Rename Your Site
1. Site settings → Change site name
2. Choose something like `bewell-portal`
3. Your URL becomes: `https://bewell-portal.netlify.app`

## 🎯 Quick Patient Links

Once deployed, share personalized patient links:
```
https://bewell-portal.netlify.app?name=Sarah
https://bewell-portal.netlify.app?name=Michael
```

## 🔄 Automatic Updates

Every time you push to GitHub, Netlify automatically updates your site!

```bash
git add .
git commit -m "Update patient features"
git push
```

## 🎊 Congratulations!

You now have a professional, scalable patient portal system that:
- Deploys automatically
- Scales to millions of users
- Costs $0 to run
- Helps humanity Be Well!

---

Need help? The portal is now live and ready to change lives! 🌟