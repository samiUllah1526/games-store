// Supabase Database Types for Gaming Store

export type GameStatus = 'pending_review' | 'live' | 'rejected' | 'draft';

export interface Game {
  id: string;
  developer_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  version: string;
  status: GameStatus;
  icon_url?: string;
  screenshots?: string[];
  downloads: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface GameBuild {
  id: string;
  game_id: string;
  version: string;
  platform: 'android' | 'ios';
  file_url: string;
  file_size: number;
  file_name: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Developer {
  id: string;
  user_id: string;
  company_name?: string;
  bio?: string;
  website?: string;
  api_key?: string;
  created_at: string;
}

export interface GameAnalytics {
  game_id: string;
  date: string;
  downloads: number;
  views: number;
  revenue: number;
}

