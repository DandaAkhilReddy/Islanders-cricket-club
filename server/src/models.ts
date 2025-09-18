import { runAsync, getAsync, allAsync } from './db';
import { Player, Match, PlayerMatchStats, Event, EventPhoto, BlogPost, Highlight, Sponsor, Leadership, User } from './types';

export class PlayerModel {
  static async getAll(limit = 50, offset = 0): Promise<Player[]> {
    return await allAsync(`
      SELECT * FROM players
      WHERE is_active = 1
      ORDER BY name
      LIMIT ? OFFSET ?
    `, [limit, offset]) as Player[];
  }

  static async getById(id: number): Promise<Player | undefined> {
    return await getAsync('SELECT * FROM players WHERE id = ?', [id]) as Player | undefined;
  }

  static async getByJerseyNumber(jerseyNumber: number): Promise<Player | undefined> {
    return await getAsync('SELECT * FROM players WHERE jersey_number = ?', [jerseyNumber]) as Player | undefined;
  }

  static async create(player: Omit<Player, 'id' | 'runs' | 'wickets' | 'matches_played' | 'batting_average' | 'bowling_average' | 'strike_rate' | 'economy_rate' | 'created_at' | 'updated_at'>): Promise<Player> {
    const result = await runAsync(`
      INSERT INTO players (
        name, jersey_number, role, batting_style, bowling_style,
        photo_url, bio, date_of_birth, nationality, is_active, position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      player.name,
      player.jersey_number,
      player.role,
      player.batting_style,
      player.bowling_style,
      player.photo_url,
      player.bio,
      player.date_of_birth,
      player.nationality,
      player.is_active ? 1 : 0,
      player.position
    ]);

    return await this.getById(result.lastID)!;
  }

  static async update(id: number, player: Partial<Player>): Promise<Player | undefined> {
    const fields = [];
    const values = [];

    Object.entries(player).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runAsync(`UPDATE players SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const result = await runAsync('UPDATE players SET is_active = 0 WHERE id = ?', [id]);
    return result.changes! > 0;
  }

  static async getTopBatsmen(limit = 10): Promise<Player[]> {
    return await allAsync(`
      SELECT * FROM players
      WHERE is_active = 1 AND runs > 0
      ORDER BY runs DESC
      LIMIT ?
    `, [limit]) as Player[];
  }

  static async getTopBowlers(limit = 10): Promise<Player[]> {
    return await allAsync(`
      SELECT * FROM players
      WHERE is_active = 1 AND wickets > 0
      ORDER BY wickets DESC
      LIMIT ?
    `, [limit]) as Player[];
  }
}

export class MatchModel {
  static async getAll(limit = 50, offset = 0): Promise<Match[]> {
    return await allAsync(`
      SELECT * FROM matches
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]) as Match[];
  }

  static async getById(id: number): Promise<Match | undefined> {
    return await getAsync('SELECT * FROM matches WHERE id = ?', [id]) as Match | undefined;
  }

  static async create(match: Omit<Match, 'id' | 'created_at' | 'updated_at'>): Promise<Match> {
    const result = await runAsync(`
      INSERT INTO matches (
        date, opponent, venue, match_type, result, our_score,
        opponent_score, man_of_match, description, is_home, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      match.date,
      match.opponent,
      match.venue,
      match.match_type,
      match.result,
      match.our_score,
      match.opponent_score,
      match.man_of_match,
      match.description,
      match.is_home ? 1 : 0,
      match.status
    ]);

    return await this.getById(result.lastID)!;
  }

  static async update(id: number, match: Partial<Match>): Promise<Match | undefined> {
    const fields = [];
    const values = [];

    Object.entries(match).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runAsync(`UPDATE matches SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const result = await runAsync('DELETE FROM matches WHERE id = ?', [id]);
    return result.changes! > 0;
  }

  static async getRecent(limit = 5): Promise<Match[]> {
    return await allAsync(`
      SELECT * FROM matches
      ORDER BY date DESC
      LIMIT ?
    `, [limit]) as Match[];
  }
}

export class PlayerMatchStatsModel {
  static async getByMatch(matchId: number): Promise<PlayerMatchStats[]> {
    return await allAsync(`
      SELECT pms.*, p.name as player_name
      FROM player_match_stats pms
      JOIN players p ON pms.player_id = p.id
      WHERE pms.match_id = ?
      ORDER BY p.name
    `, [matchId]) as PlayerMatchStats[];
  }

  static async getByPlayer(playerId: number): Promise<PlayerMatchStats[]> {
    return await allAsync(`
      SELECT pms.*, m.date, m.opponent
      FROM player_match_stats pms
      JOIN matches m ON pms.match_id = m.id
      WHERE pms.player_id = ?
      ORDER BY m.date DESC
    `, [playerId]) as PlayerMatchStats[];
  }

  static async create(stats: Omit<PlayerMatchStats, 'id' | 'created_at'>): Promise<PlayerMatchStats> {
    await runAsync(`
      INSERT OR REPLACE INTO player_match_stats (
        player_id, match_id, batting_runs, batting_balls, batting_fours,
        batting_sixes, batting_how_out, bowling_overs, bowling_runs,
        bowling_wickets, bowling_maidens, fielding_catches, fielding_stumpings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      stats.player_id,
      stats.match_id,
      stats.batting_runs,
      stats.batting_balls,
      stats.batting_fours,
      stats.batting_sixes,
      stats.batting_how_out,
      stats.bowling_overs,
      stats.bowling_runs,
      stats.bowling_wickets,
      stats.bowling_maidens,
      stats.fielding_catches,
      stats.fielding_stumpings
    ]);

    return await getAsync('SELECT * FROM player_match_stats WHERE player_id = ? AND match_id = ?', [stats.player_id, stats.match_id]) as PlayerMatchStats;
  }
}

export class EventModel {
  static async getAll(limit = 50, offset = 0): Promise<Event[]> {
    return await allAsync(`
      SELECT * FROM events
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]) as Event[];
  }

  static async getById(id: number): Promise<Event | undefined> {
    return await getAsync('SELECT * FROM events WHERE id = ?', [id]) as Event | undefined;
  }

  static async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const result = await runAsync(`
      INSERT INTO events (title, description, date, location, event_type, cover_image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      event.title,
      event.description,
      event.date,
      event.location,
      event.event_type,
      event.cover_image_url
    ]);

    return await this.getById(result.lastID)!;
  }

  static async update(id: number, event: Partial<Event>): Promise<Event | undefined> {
    const fields = [];
    const values = [];

    Object.entries(event).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runAsync(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const result = await runAsync('DELETE FROM events WHERE id = ?', [id]);
    return result.changes! > 0;
  }
}

export class BlogModel {
  static async getAll(published = true, limit = 50, offset = 0): Promise<BlogPost[]> {
    return await allAsync(`
      SELECT * FROM blog_posts
      WHERE published = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [published ? 1 : 0, limit, offset]) as BlogPost[];
  }

  static async getById(id: number): Promise<BlogPost | undefined> {
    return await getAsync('SELECT * FROM blog_posts WHERE id = ?', [id]) as BlogPost | undefined;
  }

  static async getBySlug(slug: string): Promise<BlogPost | undefined> {
    return await getAsync('SELECT * FROM blog_posts WHERE slug = ?', [slug]) as BlogPost | undefined;
  }

  static async create(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    const result = await runAsync(`
      INSERT INTO blog_posts (title, slug, content, excerpt, cover_image_url, author, published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      post.title,
      post.slug,
      post.content,
      post.excerpt,
      post.cover_image_url,
      post.author,
      post.published ? 1 : 0
    ]);

    return await this.getById(result.lastID)!;
  }

  static async update(id: number, post: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const fields = [];
    const values = [];

    Object.entries(post).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runAsync(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const result = await runAsync('DELETE FROM blog_posts WHERE id = ?', [id]);
    return result.changes! > 0;
  }
}

export class UserModel {
  static async getByEmail(email: string): Promise<User | undefined> {
    return await getAsync('SELECT * FROM users WHERE email = ?', [email]) as User | undefined;
  }

  static async getById(id: number): Promise<User | undefined> {
    return await getAsync('SELECT * FROM users WHERE id = ?', [id]) as User | undefined;
  }

  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await runAsync(`
      INSERT INTO users (email, password_hash, role)
      VALUES (?, ?, ?)
    `, [user.email, user.password_hash, user.role]);

    return await this.getById(result.lastID)!;
  }
}

export class SponsorModel {
  static async getAll(): Promise<Sponsor[]> {
    return await allAsync('SELECT * FROM sponsors WHERE is_active = 1 ORDER BY tier, name') as Sponsor[];
  }

  static async getById(id: number): Promise<Sponsor | undefined> {
    return await getAsync('SELECT * FROM sponsors WHERE id = ?', [id]) as Sponsor | undefined;
  }

  static async create(sponsor: Omit<Sponsor, 'id' | 'created_at'>): Promise<Sponsor> {
    const result = await runAsync(`
      INSERT INTO sponsors (name, logo_url, website_url, description, tier, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      sponsor.name,
      sponsor.logo_url,
      sponsor.website_url,
      sponsor.description,
      sponsor.tier,
      sponsor.is_active ? 1 : 0
    ]);

    return await this.getById(result.lastID)!;
  }
}

export class LeadershipModel {
  static async getAll(): Promise<Leadership[]> {
    return await allAsync('SELECT * FROM leadership WHERE is_active = 1 ORDER BY order_index, name') as Leadership[];
  }

  static async getById(id: number): Promise<Leadership | undefined> {
    return await getAsync('SELECT * FROM leadership WHERE id = ?', [id]) as Leadership | undefined;
  }

  static async create(leader: Omit<Leadership, 'id' | 'created_at'>): Promise<Leadership> {
    const result = await runAsync(`
      INSERT INTO leadership (name, position, photo_url, bio, email, phone, order_index, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      leader.name,
      leader.position,
      leader.photo_url,
      leader.bio,
      leader.email,
      leader.phone,
      leader.order_index,
      leader.is_active ? 1 : 0
    ]);

    return await this.getById(result.lastID)!;
  }
}