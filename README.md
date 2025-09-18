# 🏏 Islanders Cricket Club

A complete **local-only** cricket club management system with admin CMS for managing players, matches, statistics, events, blog posts, and more. Built with Express.js backend and designed for easy deployment without any cloud dependencies.

![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🏆 Core Functionality
- **Player Management**: Complete roster with statistics, photos, and profiles
- **Match Tracking**: Full match management with detailed per-player statistics
- **Statistics Engine**: Automatic calculation of batting/bowling averages, strike rates, economy rates
- **Events & Gallery**: Photo management for club events and activities
- **Blog System**: News and updates with markdown support and cover images
- **Video Highlights**: Match highlights with thumbnails and descriptions
- **Leadership Team**: Management team profiles and contact information
- **Sponsors**: Sponsor management with logos and descriptions

### 🔒 Security & Authentication
- JWT-based authentication with httpOnly cookies
- Rate limiting (100 requests per 15 minutes)
- File upload validation and sanitization
- CORS protection and security headers
- Admin-only routes for content management

### 💾 Data Management
- **Local SQLite Database**: No cloud dependencies
- **Automatic Backups**: ZIP file creation with database and uploads
- **Data Seeding**: Pre-populated with real team data
- **File Uploads**: Organized photo storage system

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (Required)
- **npm** or **pnpm**
- **Git**

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/DandaAkhilReddy/Islanders-cricket-club.git
   cd islanders-cricket-club
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment variables
   cp .env.example .env

   # Edit .env file if needed (optional - defaults work for local development)
   ```

4. **Initialize Database with Sample Data**
   ```bash
   npm run seed
   ```

5. **Start the Development Server**
   ```bash
   npm run dev:server
   ```

### 🎯 Access Points

- **API Server**: http://localhost:4000
- **API Health Check**: http://localhost:4000/api/health
- **Database**: `server/data/islanders.db`
- **Uploads**: `server/uploads/`

### 🔑 Admin Access

**Default Admin Credentials:**
- **Email**: `admin@islanders.cc`
- **Password**: `change-me-now`

⚠️ **Important**: Change these credentials in production by updating your `.env` file.

## 📁 Project Structure

```
islanders-cricket-club/
├── server/                 # Express.js Backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Auth, upload, etc.
│   │   ├── utils/         # Seed & backup scripts
│   │   ├── types.ts       # TypeScript definitions
│   │   ├── db.ts          # Database setup
│   │   ├── env.ts         # Environment validation
│   │   └── index.ts       # Server entry point
│   ├── data/              # SQLite database (auto-created)
│   ├── uploads/           # File uploads (auto-created)
│   ├── package.json
│   └── tsconfig.json
├── .env.example           # Environment template
├── .env                   # Your environment config
├── .gitignore            # Git ignore rules
├── package.json          # Root workspace config
└── README.md             # This file
```

## 🛠️ Available Scripts

### Development
```bash
npm run dev:server      # Start backend development server
npm run build          # Build the server for production
npm run start          # Start production server (after build)
```

### Database Management
```bash
npm run seed           # Populate database with sample data
npm run backup         # Create backup ZIP file
```

### Testing
```bash
npm test              # Run all tests
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Players
- `GET /api/players` - List all players
- `GET /api/players/:id` - Get player details
- `GET /api/players/top-batsmen` - Top batsmen by runs
- `GET /api/players/top-bowlers` - Top bowlers by wickets
- `POST /api/players` - Create player (Admin)
- `PUT /api/players/:id` - Update player (Admin)
- `DELETE /api/players/:id` - Delete player (Admin)

### Matches
- `GET /api/matches` - List all matches
- `GET /api/matches/:id` - Get match details
- `GET /api/matches/:id/stats` - Get match statistics
- `GET /api/matches/recent` - Recent matches
- `POST /api/matches` - Create match (Admin)
- `POST /api/matches/:id/stats` - Add player stats (Admin)

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Admin)

### Blog
- `GET /api/blog` - List published posts
- `GET /api/blog/:id` - Get post by ID
- `GET /api/blog/slug/:slug` - Get post by slug
- `POST /api/blog` - Create post (Admin)

### Other
- `GET /api/leadership` - Leadership team
- `GET /api/sponsors` - Sponsors list
- `GET /api/highlights` - Video highlights
- `GET /api/stats/player/:id` - Player statistics

## 👥 Pre-loaded Data

The system comes with realistic sample data:

### Leadership Team
- **Dr. Vishnu Reddy** - President
- **Rajashekar Reddy** - Vice President
- **Akhil Reddy** - Captain
- **Dinesh Reddy** - Head of Maintenance
- **Faizan Mohammad** - Vice Captain

### Players
- **14 players** with unique jersey numbers (1-14)
- Mix of batting and bowling specialists
- Sample statistics and roles
- Various playing styles (left/right handed, different bowling types)

### Sample Content
- **1 complete match** with detailed player statistics
- **1 sample blog post** welcoming visitors
- **HHA Medicine** as featured sponsor
- All player aggregate statistics auto-calculated

## 📈 Statistics System

### Automatic Calculation
The system automatically calculates and updates:
- **Batting Average**: Total runs ÷ innings played
- **Strike Rate**: (Total runs ÷ balls faced) × 100
- **Bowling Average**: Runs conceded ÷ wickets taken
- **Economy Rate**: Runs conceded ÷ overs bowled

### Per-Match Tracking
For each match, track individual player:
- **Batting**: Runs, balls faced, 4s, 6s, how out
- **Bowling**: Overs, runs conceded, wickets, maidens
- **Fielding**: Catches, stumpings

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `ADMIN_EMAIL` | Admin login email | Required |
| `ADMIN_PASSWORD` | Admin login password | Required |
| `SQLITE_PATH` | Database file path | `./data/islanders.db` |
| `UPLOAD_DIR` | Upload directory | `./uploads` |
| `MAX_UPLOAD_MB` | Max file size (MB) | `20` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:5173` |

### File Uploads
Supported formats:
- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM (for highlights)
- **Max size**: 20MB (configurable)

## 📦 Backup & Restore

### Creating Backups
```bash
npm run backup
```
Creates a timestamped ZIP file in `backups/` containing:
- SQLite database
- All uploaded media files
- Configuration files

### Restoring from Backup
1. Extract backup ZIP file
2. Replace `server/data/islanders.db`
3. Replace `server/uploads/` directory
4. Restart the application

## 🚨 Troubleshooting

### Common Issues

**Database Issues**
```bash
# Reset database (removes all data)
rm server/data/islanders.db
npm run seed
```

**Upload Issues**
- Check file permissions on `server/uploads/`
- Verify `MAX_UPLOAD_MB` in `.env`
- Ensure supported file types

**Port Conflicts**
- Change `PORT` in `.env` if 4000 is occupied
- Update `CLIENT_URL` and `ALLOWED_ORIGINS` accordingly

**Build Issues**
```bash
# Clear and reinstall dependencies
rm -rf node_modules server/node_modules
npm install
```

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the **Islanders Cricket Club**
- Designed for local-only deployment
- No cloud dependencies required
- Ready for immediate use

---

**🏏 Built with ❤️ for the Islanders Cricket Club**

For questions or support, please check the troubleshooting section above or open an issue on GitHub.