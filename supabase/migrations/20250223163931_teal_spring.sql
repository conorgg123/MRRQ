/*
  # Queue System Database Schema

  1. New Tables
    - `users`
      - Core user data and preferences
    - `matches`
      - Match history and results
    - `queue_stats`
      - Historical queue data for wait time estimation
    - `player_stats`
      - Player performance metrics
    - `characters`
      - Character data and statistics
    - `friends`
      - Friend relationships between users
    - `parties`
      - Group queuing system

  2. Security
    - Enable RLS on all tables
    - Add policies for data access
    - Secure friend relationships

  3. Changes
    - Add foreign key relationships
    - Create indexes for performance
    - Add triggers for stats updates
*/

-- Users table with preferences
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  preferred_region text,
  preferred_role text,
  main_characters text[],
  selected_characters jsonb,
  mmr integer DEFAULT 1000,
  reputation_score float DEFAULT 5.0
);

-- Match history
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  map text,
  mode text,
  duration interval,
  region text,
  average_mmr integer
);

-- Player match data
CREATE TABLE IF NOT EXISTS player_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id),
  user_id uuid REFERENCES users(id),
  character_id text NOT NULL,
  role text NOT NULL,
  team integer,
  kills integer DEFAULT 0,
  deaths integer DEFAULT 0,
  assists integer DEFAULT 0,
  damage_dealt integer DEFAULT 0,
  healing_done integer DEFAULT 0,
  result text,
  performance_score float,
  mmr_change integer,
  created_at timestamptz DEFAULT now()
);

-- Queue statistics for wait time estimation
CREATE TABLE IF NOT EXISTS queue_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  role text NOT NULL,
  rank_tier text NOT NULL,
  players_in_queue integer DEFAULT 0,
  average_wait_time interval,
  timestamp timestamptz DEFAULT now()
);

-- Character statistics
CREATE TABLE IF NOT EXISTS character_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  character_id text NOT NULL,
  matches_played integer DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  average_kills float DEFAULT 0,
  average_deaths float DEFAULT 0,
  average_assists float DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Friends system
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  friend_id uuid REFERENCES users(id),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Party system
CREATE TABLE IF NOT EXISTS parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'forming',
  max_size integer DEFAULT 5
);

CREATE TABLE IF NOT EXISTS party_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid REFERENCES parties(id),
  user_id uuid REFERENCES users(id),
  role text,
  ready boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Match history is public"
  ON matches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can read match stats"
  ON player_matches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own character stats"
  ON character_stats
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage friend requests"
  ON friends
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Party members can read party data"
  ON parties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM party_members
      WHERE party_members.party_id = parties.id
      AND party_members.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);
CREATE INDEX IF NOT EXISTS idx_player_matches_user_id ON player_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_character_stats_user_id ON character_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_party_members_user_id ON party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_party_members_party_id ON party_members(party_id);

-- Function to update character stats after a match
CREATE OR REPLACE FUNCTION update_character_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO character_stats (user_id, character_id)
  VALUES (NEW.user_id, NEW.character_id)
  ON CONFLICT (user_id, character_id) DO UPDATE
  SET
    matches_played = character_stats.matches_played + 1,
    wins = CASE WHEN NEW.result = 'victory' THEN character_stats.wins + 1 ELSE character_stats.wins END,
    losses = CASE WHEN NEW.result = 'defeat' THEN character_stats.losses + 1 ELSE character_stats.losses END,
    draws = CASE WHEN NEW.result = 'draw' THEN character_stats.draws + 1 ELSE character_stats.draws END,
    average_kills = (character_stats.average_kills * character_stats.matches_played + NEW.kills) / (character_stats.matches_played + 1),
    average_deaths = (character_stats.average_deaths * character_stats.matches_played + NEW.deaths) / (character_stats.matches_played + 1),
    average_assists = (character_stats.average_assists * character_stats.matches_played + NEW.assists) / (character_stats.matches_played + 1),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update character stats after match
CREATE TRIGGER update_character_stats_after_match
  AFTER INSERT ON player_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_character_stats();