import bcrypt from 'bcryptjs';
import { initializeDatabase } from '../db';
import { env } from '../env';
import { UserModel, PlayerModel, LeadershipModel, SponsorModel, MatchModel, BlogModel, PlayerMatchStatsModel } from '../models';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    initializeDatabase();

    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

    try {
      UserModel.create({
        email: env.ADMIN_EMAIL,
        password_hash: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } catch (error) {
      console.log('ℹ️ Admin user already exists');
    }

    const leadership = [
      {
        name: 'Dr. Vishnu Reddy',
        position: 'President',
        bio: 'Leading the Islanders Cricket Club with vision and dedication.',
        email: 'president@islanders.cc',
        order_index: 1,
        is_active: true
      },
      {
        name: 'Rajashekar Reddy',
        position: 'Vice President',
        bio: 'Supporting club operations and strategic initiatives.',
        email: 'vicepresident@islanders.cc',
        order_index: 2,
        is_active: true
      },
      {
        name: 'Akhil Reddy',
        position: 'Captain',
        bio: 'Leading the team on and off the field.',
        email: 'captain@islanders.cc',
        order_index: 3,
        is_active: true
      },
      {
        name: 'Dinesh Reddy',
        position: 'Head of Maintenance',
        bio: 'Ensuring our facilities are always in top condition.',
        email: 'maintenance@islanders.cc',
        order_index: 4,
        is_active: true
      },
      {
        name: 'Faizan Mohammad',
        position: 'Vice Captain',
        bio: 'Supporting team leadership and player development.',
        email: 'vicecaptain@islanders.cc',
        order_index: 5,
        is_active: true
      }
    ];

    for (const leader of leadership) {
      LeadershipModel.create(leader);
    }
    console.log('✅ Leadership team created');

    const players = [
      {
        name: 'Akhil Reddy',
        jersey_number: 1,
        role: 'Captain/All-rounder',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm medium',
        position: 'Captain',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Faizan Mohammad',
        jersey_number: 2,
        role: 'Vice Captain/Batsman',
        batting_style: 'Left-handed',
        bowling_style: 'Right-arm off-break',
        position: 'Vice Captain',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Rajesh Kumar',
        jersey_number: 3,
        role: 'Opening Batsman',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm medium',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Suresh Patel',
        jersey_number: 4,
        role: 'Middle-order Batsman',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm leg-break',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Vikram Singh',
        jersey_number: 5,
        role: 'Wicket-keeper',
        batting_style: 'Right-handed',
        bowling_style: null,
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Arjun Sharma',
        jersey_number: 6,
        role: 'Fast Bowler',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm fast',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Rohit Gupta',
        jersey_number: 7,
        role: 'Spin Bowler',
        batting_style: 'Left-handed',
        bowling_style: 'Left-arm orthodox',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Praveen Nair',
        jersey_number: 8,
        role: 'All-rounder',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm medium-fast',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Sanjay Joshi',
        jersey_number: 9,
        role: 'Batsman',
        batting_style: 'Left-handed',
        bowling_style: 'Right-arm off-break',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Deepak Verma',
        jersey_number: 10,
        role: 'Fast Bowler',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm fast-medium',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Manoj Agarwal',
        jersey_number: 11,
        role: 'Spin Bowler',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm leg-break',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Kiran Reddy',
        jersey_number: 12,
        role: 'All-rounder',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm medium',
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Naveen Kumar',
        jersey_number: 13,
        role: 'Batsman',
        batting_style: 'Right-handed',
        bowling_style: null,
        nationality: 'India',
        is_active: true
      },
      {
        name: 'Rahul Chandra',
        jersey_number: 14,
        role: 'All-rounder',
        batting_style: 'Left-handed',
        bowling_style: 'Left-arm medium',
        nationality: 'India',
        is_active: true
      }
    ];

    for (const player of players) {
      PlayerModel.create(player);
    }
    console.log('✅ Players created');

    SponsorModel.create({
      name: 'HHA Medicine',
      description: 'Supporting healthcare and community wellness.',
      tier: 'gold',
      is_active: true
    });
    console.log('✅ Sponsors created');

    const sampleMatch = MatchModel.create({
      date: '2024-01-15',
      opponent: 'San Antonio Hawks',
      venue: 'Islanders Cricket Ground',
      match_type: 'SACL League',
      result: 'Won by 45 runs',
      our_score: '185/6 (20 overs)',
      opponent_score: '140/8 (20 overs)',
      man_of_match: 1,
      description: 'Dominant performance in the season opener',
      is_home: true,
      status: 'completed'
    });

    const playerStats = [
      { player_id: 1, batting_runs: 45, batting_balls: 32, batting_fours: 4, batting_sixes: 2, bowling_overs: 4, bowling_runs: 28, bowling_wickets: 2 },
      { player_id: 2, batting_runs: 38, batting_balls: 28, batting_fours: 5, batting_sixes: 1, bowling_overs: 2, bowling_runs: 15, bowling_wickets: 1 },
      { player_id: 3, batting_runs: 25, batting_balls: 22, batting_fours: 3, batting_sixes: 0 },
      { player_id: 4, batting_runs: 32, batting_balls: 24, batting_fours: 2, batting_sixes: 1 },
      { player_id: 5, batting_runs: 18, batting_balls: 15, batting_fours: 2, batting_sixes: 0, fielding_stumpings: 1 },
      { player_id: 6, bowling_overs: 4, bowling_runs: 32, bowling_wickets: 3, bowling_maidens: 1 },
      { player_id: 7, bowling_overs: 4, bowling_runs: 24, bowling_wickets: 2, bowling_maidens: 0 }
    ];

    for (const stats of playerStats) {
      PlayerMatchStatsModel.create({
        ...stats,
        match_id: sampleMatch.id
      });
    }
    console.log('✅ Sample match and statistics created');

    BlogModel.create({
      title: 'Welcome to Islanders Cricket Club',
      slug: 'welcome-to-islanders',
      content: `# Welcome to the Islanders Cricket Club

We are excited to launch our new website and share our passion for cricket with the community. The Islanders Cricket Club has been a cornerstone of local cricket in San Antonio, bringing together players of all skill levels who share a love for this beautiful game.

## Our Journey

Founded with the vision of promoting cricket in the San Antonio area, we have grown from a small group of enthusiasts to a competitive club participating in the San Antonio Cricket League (SACL). Our team consists of dedicated players who bring diverse backgrounds and playing styles to create a dynamic and exciting cricket experience.

## What We Offer

- **Competitive Cricket**: Regular participation in SACL leagues and tournaments
- **Player Development**: Training sessions and skill development programs
- **Community Events**: Social gatherings and cricket awareness programs
- **Facilities**: Well-maintained cricket ground and equipment

Join us as we continue to grow the sport of cricket in San Antonio and build lasting friendships through the game we all love.

*Team Islanders*`,
      excerpt: 'Welcome to the official website of Islanders Cricket Club - your home for cricket in San Antonio.',
      author: 'Admin',
      published: true
    });
    console.log('✅ Sample blog post created');

    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📧 Admin Login Credentials:');
    console.log(`   Email: ${env.ADMIN_EMAIL}`);
    console.log(`   Password: ${env.ADMIN_PASSWORD}`);
    console.log('');
    console.log('🏏 Sample data includes:');
    console.log('   - 5 Leadership team members');
    console.log('   - 14 Players with jersey numbers');
    console.log('   - 1 Sample match with player statistics');
    console.log('   - 1 Sponsor (HHA Medicine)');
    console.log('   - 1 Welcome blog post');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

export default seedDatabase;