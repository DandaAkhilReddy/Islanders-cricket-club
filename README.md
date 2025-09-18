# 🏏 Islanders Cricket Club Website

A complete local-only cricket club website with admin CMS for managing players, matches, events, blog, and more.

## 🎯 Features

- **Players**: Complete roster with statistics and profiles
- **Matches**: Full match tracking with per-player stats entry
- **Events & Photos**: Gallery management for club events
- **Blog**: News and updates with markdown support
- **Highlights**: Video highlights from matches
- **Admin CMS**: Complete content management system
- **Local-only**: No cloud dependencies, all data stored locally

## 🚀 Quick Start

### Requirements
- Node.js 20+
- npm or pnpm
- Git

### Setup

```bash
# Clone and install
git clone <repository-url>
cd islanders-cricket-club
npm install

# Setup environment
cp .env.example .env

# Start development servers
npm run dev
```

### Access

- **Website**: http://localhost:5173
- **API Server**: http://localhost:4000
- **Admin Panel**: http://localhost:5173/admin

### Default Admin Login

Use the credentials from your `.env` file:
- **Email**: `admin@islanders.cc` (or your ADMIN_EMAIL)
- **Password**: `change-me-now` (or your ADMIN_PASSWORD)

## 📊 Managing Match Statistics

### Creating a Match
1. Go to Admin → Matches
2. Click "Add New Match"
3. Fill in match details (date, opponent, venue, etc.)
4. Save the match

### Adding Player Statistics
1. Open the match from the admin panel
2. Click on "Player Stats" tab
3. Add batting, bowling, and fielding stats for each player
4. Save - player aggregate statistics will automatically update

### Statistics Tracked
- **Batting**: Runs, balls faced, 4s, 6s (auto-calculates strike rate)
- **Bowling**: Overs, runs conceded, wickets, maidens (auto-calculates economy)
- **Fielding**: Catches, stumpings

## 📁 Project Structure

```
islanders/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (TypeScript + SQLite)
├── .env.example     # Environment variables template
└── README.md        # This file
```

## 🗄️ Data Storage

- **Database**: SQLite file at `server/data/islanders.db`
- **Media Files**: Stored in `server/uploads/`
- **Backups**: Created in `backups/` folder

## 📸 Managing Media

### Player Photos
1. Admin → Players → Edit player
2. Upload photo (auto-resized and optimized)

### Event Photos
1. Admin → Events → Select event
2. Upload multiple photos with captions

### Blog Images
1. Admin → Blog → Create/Edit post
2. Upload cover image and inline images

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start both client and server
npm run dev:client   # Start only client
npm run dev:server   # Start only server

# Production
npm run build        # Build both client and server
npm run test         # Run all tests

# Data Management
npm run seed         # Populate with sample data
npm run backup       # Create backup ZIP file
```

## 🌐 Optional: Public Access with ngrok

To make your site temporarily accessible from the internet:

```bash
# Install ngrok
npm install -g ngrok

# Expose frontend
ngrok http 5173

# Expose backend (in another terminal)
ngrok http 4000

# Update .env with the ngrok URLs
VITE_SERVER_URL=https://your-backend-url.ngrok.io
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-url.ngrok.io
```

## 📋 Initial Data

The system comes pre-populated with:

### Leadership Team
- Dr. Vishnu Reddy (President)
- Rajashekar Reddy (Vice President)
- Akhil Reddy (Captain)
- Dinesh Reddy (Head of Maintenance)
- Faizan Mohammad (Vice Captain)

### Sample Players
- 14 players with various roles and statistics
- Mix of batting and bowling styles
- Unique jersey numbers

### Sample Content
- One complete match with player statistics
- Sample blog post
- HHA Medicine sponsor entry

## 🔐 Security Features

- JWT-based authentication with httpOnly cookies
- Rate limiting (100 requests per 15 minutes)
- File upload validation and sanitization
- CORS protection
- Helmet security headers

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run server tests only
npm run test --workspace=server

# Run client tests only
npm run test --workspace=client
```

## 💾 Backup & Restore

### Creating Backups
```bash
npm run backup
```
This creates a ZIP file in `backups/` containing:
- SQLite database
- All uploaded media files
- Timestamp for easy identification

### Restoring from Backup
1. Extract backup ZIP
2. Replace `server/data/islanders.db`
3. Replace `server/uploads/` folder
4. Restart the application

## 🎨 Customization

### Branding
- Edit `client/src/styles/globals.css` for colors and fonts
- Replace logo files in `server/uploads/placeholders/`
- Update team name and details in the leadership section

### Adding Features
- Database schema: `server/src/db.ts`
- API routes: `server/src/routes/`
- Frontend pages: `client/src/pages/`
- Components: `client/src/components/`

## 🆘 Troubleshooting

### Database Issues
```bash
# Reset database (removes all data)
rm server/data/islanders.db
npm run seed
```

### Upload Issues
- Check file permissions on `server/uploads/`
- Verify `MAX_UPLOAD_MB` setting in `.env`
- Ensure supported file types (images: jpg, png, gif, webp)

### Build Issues
```bash
# Clear caches
rm -rf client/dist server/dist node_modules/*/dist
npm install
npm run build
```

### Port Conflicts
- Change `PORT` in `.env` if 4000 is occupied
- Update `VITE_SERVER_URL` accordingly
- Restart both client and server

## 📞 Support

- Check the console logs for detailed error messages
- Ensure all environment variables are set correctly
- Verify Node.js version is 20 or higher
- Make sure all dependencies are installed (`npm install`)

## 🏆 Team Data

This system is pre-configured for the Islanders Cricket Club with real team member data. Update the leadership and player information through the admin panel to match your current roster.

---

**Built with ❤️ for the Islanders Cricket Club**