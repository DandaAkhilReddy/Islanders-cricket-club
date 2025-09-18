export interface Player {
  id: number;
  name: string;
  jersey_number?: number;
  role: string;
  batting_style?: string;
  bowling_style?: string;
  photo_url?: string;
  bio?: string;
  date_of_birth?: string;
  nationality: string;
  is_active: boolean;
  position?: string;
  runs: number;
  wickets: number;
  matches_played: number;
  batting_average: number;
  bowling_average: number;
  strike_rate: number;
  economy_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  date: string;
  opponent: string;
  venue: string;
  match_type: string;
  result?: string;
  our_score?: string;
  opponent_score?: string;
  man_of_match?: number;
  description?: string;
  is_home: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerMatchStats {
  id: number;
  player_id: number;
  match_id: number;
  batting_runs: number;
  batting_balls: number;
  batting_fours: number;
  batting_sixes: number;
  batting_how_out?: string;
  bowling_overs: number;
  bowling_runs: number;
  bowling_wickets: number;
  bowling_maidens: number;
  fielding_catches: number;
  fielding_stumpings: number;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  event_type: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EventPhoto {
  id: number;
  event_id: number;
  photo_url: string;
  caption?: string;
  uploaded_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Highlight {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  match_id?: number;
  created_at: string;
}

export interface Sponsor {
  id: number;
  name: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  tier: string;
  is_active: boolean;
  created_at: string;
}

export interface Leadership {
  id: number;
  name: string;
  position: string;
  photo_url?: string;
  bio?: string;
  email?: string;
  phone?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}