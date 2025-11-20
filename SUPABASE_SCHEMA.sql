-- Gaming Store Dashboard Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Developers table (extends auth.users)
CREATE TABLE IF NOT EXISTS developers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name VARCHAR(255),
  bio TEXT,
  website VARCHAR(255),
  api_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  price DECIMAL(10, 2) DEFAULT 0.00,
  version VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'live', 'rejected')),
  icon_url TEXT,
  screenshots TEXT[], -- Array of image URLs
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game builds table (APK/IPA files)
CREATE TABLE IF NOT EXISTS game_builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  version VARCHAR(50) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('android', 'ios')),
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game analytics table
CREATE TABLE IF NOT EXISTS game_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_developer_id ON games(developer_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_game_builds_game_id ON game_builds(game_id);
CREATE INDEX IF NOT EXISTS idx_game_analytics_game_id ON game_analytics(game_id);
CREATE INDEX IF NOT EXISTS idx_game_analytics_date ON game_analytics(date);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_analytics ENABLE ROW LEVEL SECURITY;

-- Developers policies
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own developer profile" ON developers;
DROP POLICY IF EXISTS "Users can insert their own developer profile" ON developers;
DROP POLICY IF EXISTS "Users can update their own developer profile" ON developers;

CREATE POLICY "Users can view their own developer profile"
  ON developers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own developer profile"
  ON developers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own developer profile"
  ON developers FOR UPDATE
  USING (auth.uid() = user_id);

-- Games policies
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Developers can view their own games" ON games;
DROP POLICY IF EXISTS "Developers can insert their own games" ON games;
DROP POLICY IF EXISTS "Developers can update their own games" ON games;
DROP POLICY IF EXISTS "Developers can delete their own games" ON games;

CREATE POLICY "Developers can view their own games"
  ON games FOR SELECT
  USING (
    developer_id IN (
      SELECT id FROM developers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can insert their own games"
  ON games FOR INSERT
  WITH CHECK (
    developer_id IN (
      SELECT id FROM developers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can update their own games"
  ON games FOR UPDATE
  USING (
    developer_id IN (
      SELECT id FROM developers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can delete their own games"
  ON games FOR DELETE
  USING (
    developer_id IN (
      SELECT id FROM developers WHERE user_id = auth.uid()
    )
  );

-- Game builds policies
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Developers can manage builds for their games" ON game_builds;

CREATE POLICY "Developers can manage builds for their games"
  ON game_builds FOR ALL
  USING (
    game_id IN (
      SELECT id FROM games WHERE developer_id IN (
        SELECT id FROM developers WHERE user_id = auth.uid()
      )
    )
  );

-- Game analytics policies
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Developers can view analytics for their games" ON game_analytics;

CREATE POLICY "Developers can view analytics for their games"
  ON game_analytics FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM games WHERE developer_id IN (
        SELECT id FROM developers WHERE user_id = auth.uid()
      )
    )
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
-- Drop existing triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS update_developers_updated_at ON developers;
DROP TRIGGER IF EXISTS update_games_updated_at ON games;

CREATE TRIGGER update_developers_updated_at BEFORE UPDATE ON developers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Action', 'action', '⚔️'),
  ('Adventure', 'adventure', '🗺️'),
  ('Puzzle', 'puzzle', '🧩'),
  ('Racing', 'racing', '🏎️'),
  ('Sports', 'sports', '⚽'),
  ('Strategy', 'strategy', '♟️'),
  ('RPG', 'rpg', '⚔️'),
  ('Simulation', 'simulation', '🏗️'),
  ('Arcade', 'arcade', '🎮'),
  ('Casual', 'casual', '🎯')
ON CONFLICT (slug) DO NOTHING;

