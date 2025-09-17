# 🚀 Deployment Guide for islanderscricketclub.org

## Quick Deployment Options

### Option 1: GoDaddy Hosting (Recommended for your domain)

Since you own the domain `islanderscricketclub.org`, this is the simplest approach:

#### Step 1: Purchase GoDaddy Hosting
1. Log into your GoDaddy account
2. Go to "Web Hosting" and purchase a plan (Basic plan sufficient)
3. Your domain will automatically connect to hosting

#### Step 2: Upload Files
1. Access **cPanel** from your GoDaddy hosting dashboard
2. Open **File Manager**
3. Navigate to `public_html` folder
4. Upload `index.html` (the main file)
5. Your site will be live at `islanderscricketclub.org` within 5-10 minutes

#### Step 3: SSL Certificate
- GoDaddy provides free SSL automatically
- Your site will be accessible via `https://islanderscricketclub.org`

---

### Option 2: GitHub Pages (Free Alternative)

#### Step 1: Create GitHub Repository
```bash
# Create new repository on GitHub named 'islanders-cricket-club'
# Make it public
```

#### Step 2: Upload Files
1. Upload `index.html` to the repository
2. Create a file named `CNAME` with content: `islanderscricketclub.org`

#### Step 3: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: main
4. Folder: / (root)

#### Step 4: Configure GoDaddy DNS
In your GoDaddy DNS settings, add these records:

```
Type: A     Name: @     Value: 185.199.108.153
Type: A     Name: @     Value: 185.199.109.153
Type: A     Name: @     Value: 185.199.110.153
Type: A     Name: @     Value: 185.199.111.153
Type: CNAME Name: www   Value: yourusername.github.io
```

---

### Option 3: One-Click Deployment Services

#### Netlify (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your `index.html` file
3. Get instant deployment URL
4. Configure custom domain in Netlify settings

#### Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub or upload files
3. Automatic deployment with custom domain support

---

## File Structure for Deployment

```
Your Upload Folder/
├── index.html          # Main application (REQUIRED)
├── CNAME              # For custom domain (GitHub Pages only)
└── README.md          # Documentation (optional)
```

## Testing Your Deployment

After deployment, test these features:
- [ ] Website loads at your domain
- [ ] All tabs work (Overview, Member Collection, etc.)
- [ ] Interactive charts display correctly
- [ ] Modal popups work when clicking bat items
- [ ] Mobile responsiveness works
- [ ] SSL certificate is active (https://)

## DNS Propagation

- **GoDaddy Hosting**: 5-10 minutes
- **GitHub Pages**: 24-48 hours for custom domain
- **Other services**: Usually 1-24 hours

## Custom Domain Setup

### For GitHub Pages:
1. Create `CNAME` file with: `islanderscricketclub.org`
2. Configure DNS as shown above
3. Enable "Enforce HTTPS" in GitHub Pages settings

### For Netlify/Vercel:
1. Add custom domain in dashboard
2. Follow their DNS configuration instructions
3. SSL certificate is automatic

## Performance Optimization

Your site is already optimized with:
- ✅ Single HTML file (fast loading)
- ✅ Inline CSS/JS (no external dependencies)
- ✅ Responsive design (mobile-friendly)
- ✅ Modern CSS (hardware acceleration)

## Monitoring & Analytics

Consider adding:
```html
<!-- Google Analytics (optional) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Backup Strategy

1. Keep original files in GitHub repository
2. Regular exports from hosting provider
3. Version control for any updates

## Support

If you encounter issues:

**GoDaddy Support**: Available 24/7 via phone/chat
**GitHub Pages**: Documentation at docs.github.com
**Technical Issues**: Check browser console for errors

---

## Quick Start Commands

### For GitHub deployment:
```bash
git init
git add .
git commit -m "Initial deployment of Islanders Cricket Club"
git remote add origin https://github.com/yourusername/islanders-cricket-club.git
git push -u origin main
```

### For FTP upload:
Use any FTP client with your GoDaddy hosting credentials to upload `index.html` to the `public_html` folder.

Your cricket analytics dashboard will be live and ready for club members to explore!