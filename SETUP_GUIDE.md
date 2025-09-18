# 🏏 Islanders Cricket Club - Setup Guide

## 🚀 **QUICK START (5 MINUTES)**

### 1. **Install Dependencies**
```bash
cd islanders-cricket-club
npm install
```

### 2. **Setup Environment**
Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/islanders_db"

# NextAuth (for admin panel)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub Integration (for photo uploads)
GITHUB_TOKEN="your-github-token"
GITHUB_OWNER="DandaAkhilReddy"
GITHUB_REPO="Islanders-cricket-club"

# Optional: Email for contact form
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. **Setup Database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (your bat collection!)
npm run db:seed
```

### 4. **Run Development Server**
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🎯 **FEATURES YOU GET**

### ✅ **Equipment Showcase**
- **Islander Bat Collection** (12 bats with weights)
- **Dr. Reddy Premium Collection** (6 elite bats)
- **Professional Players** (Rohit Sharma, Virat Kohli, etc.)
- **Interactive Weight Analytics**

### ✅ **GitHub Photo Upload**
- Upload bat photos directly to GitHub
- Auto-display on website
- Admin panel for easy management

### ✅ **SACL Integration**
- San Antonio Cricket League fixtures
- Match results with scorecards
- Team roster and player profiles

### ✅ **Media Hub**
- Photo galleries with albums
- Video highlights (YouTube embeds)
- Match reports and blog posts

---

## 📸 **HOW TO UPLOAD PHOTOS**

### Method 1: Admin Panel (Easy)
1. Go to `/admin` (login required)
2. Click "Upload Equipment Photo"
3. Drag & drop your bat photo
4. Fill in details (name, weight, brand)
5. Submit → Auto-appears on website!

### Method 2: GitHub Direct
1. Go to your GitHub repo: `Islanders-cricket-club`
2. Navigate to `public/equipment/`
3. Upload image files
4. Use naming: `brand-model-weight.jpg`
5. Website auto-syncs via webhook

---

## 🎨 **CUSTOMIZATION**

### Colors & Branding
Edit `tailwind.config.js`:
```js
colors: {
  islander: {
    green: '#0B8A55',    // Primary green
    dark: '#0A0A0A',     // Dark
    light: '#F7F7F5',    // Light
    gold: '#FFD166'      // Accent
  }
}
```

### Add New Bats
Edit `data/bats.json` or use admin panel:
```json
{
  "name": "New Bat Name",
  "brand": "Brand",
  "weight": 1150,
  "category": "medium",
  "collection": "islander",
  "imageUrl": "/equipment/new-bat.jpg"
}
```

---

## 🚀 **DEPLOYMENT OPTIONS**

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Connect your domain: islanderscricketclub.org
```

### Option 2: GitHub Pages + Database
1. Deploy frontend to GitHub Pages
2. Use hosted PostgreSQL (Neon, Supabase)
3. Update DNS to point to your domain

---

## 🔧 **ADVANCED FEATURES**

### 1. **Auto-Generated Match Reports**
```markdown
## Match Report: Islanders vs Hornets
- **Score**: Islanders 156/6 def Hornets 149/8
- **Player of Match**: Your Name (52* off 31 balls)
- **Key Moments**: Last over thriller
```

### 2. **Player Performance Tracking**
```js
// Track your batting stats
{
  player: "Your Name",
  matches: 12,
  runs: 485,
  average: 42.6,
  strikeRate: 142.5
}
```

### 3. **Equipment Recommendations**
Based on your bat collection, suggest optimal weights for different match situations.

---

## 📱 **MOBILE FEATURES**

- **Responsive Design** works on all devices
- **Touch-optimized** photo galleries
- **Fast loading** with image optimization
- **Offline-ready** with service worker (optional)

---

## 🎯 **SEO & MARKETING**

- **Auto-generated OG images** for social sharing
- **Rich snippets** for match results
- **Sitemap.xml** for search engines
- **Analytics ready** (Google Analytics 4)

---

## 🆘 **TROUBLESHOOTING**

### Database Issues
```bash
# Reset database
npx prisma migrate reset
npm run db:seed
```

### Image Upload Problems
1. Check GitHub token permissions
2. Verify repository access
3. Test upload endpoint: `/api/upload`

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 🎉 **READY TO GO!**

Your cricket club website is now ready with:
- ✅ Professional design
- ✅ Bat weight analytics
- ✅ Easy photo uploads
- ✅ SACL integration
- ✅ Mobile optimization
- ✅ SEO optimization

**Domain**: islanderscricketclub.org
**Admin**: /admin (create account first)
**API**: /api/* (all endpoints ready)

---

## 📞 **NEED HELP?**

1. Check the `README.md` for detailed docs
2. Review `package.json` scripts
3. Test API endpoints in `/api/`
4. Use admin panel for content management

**Your cricket analytics dashboard is now LIVE!** 🏏🚀