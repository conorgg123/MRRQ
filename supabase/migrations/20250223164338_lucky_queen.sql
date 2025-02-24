/*
  # Social and Achievement System Enhancement

  1. New Tables
    - `achievements`
      - Track player achievements and milestones
    - `player_achievements`
      - Link achievements to players
    - `messages`
      - Player-to-player messaging
    - `endorsements`
      - Player commendation system
    - `seasons`
      - Seasonal ranking data

  2. Security
    - Enable RLS on all new tables
    - Add policies for data access
    - Secure messaging system

  3. Changes
    - Add achievement triggers
    - Create seasonal ranking calculations
*/

-- Achievements system
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon_url text,
  category text NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  achievement_id uuid REFERENCES achievements(id),
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Messaging system
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id),
  recipient_id uuid REFERENCES users(id),
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Endorsement system
CREATE TABLE IF NOT EXISTS endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES users(id),
  to_user_id uuid REFERENCES users(id),
  category text NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_user_id, to_user_id, category)
);

-- Seasonal rankings
CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seasonal_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  season_id uuid REFERENCES seasons(id),
  rank_tier text NOT NULL,
  rank_division text NOT NULL,
  points integer DEFAULT 0,
  peak_points integer DEFAULT 0,
  games_played integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, season_id)
);

-- User preferences extension
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{
  "notifications": {
    "queue_pop": true,
    "friend_requests": true,
    "messages": true,
    "achievements": true
  },
  "accessibility": {
    "colorblind_mode": false,
    "high_contrast": false
  },
  "gameplay": {
    "auto_accept_queue": false,
    "preferred_characters": [],
    "quick_chat_phrases": []
  }
}'::jsonb;

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_ranks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Achievements are public"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can view their achievements"
  ON player_achievements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR sender_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can manage endorsements"
  ON endorsements
  FOR ALL
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Seasons are public"
  ON seasons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view seasonal ranks"
  ON seasonal_ranks
  FOR SELECT
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_player_achievements_user_id ON player_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_to_user_id ON endorsements(to_user_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_ranks_user_season ON seasonal_ranks(user_id, season_id);

-- Functions
CREATE OR REPLACE FUNCTION check_achievement_unlock()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for match count achievements
  IF NEW.matches_played IN (10, 50, 100, 500, 1000) THEN
    INSERT INTO player_achievements (user_id, achievement_id)
    SELECT NEW.user_id, a.id
    FROM achievements a
    WHERE a.category = 'matches_played'
    AND a.points <= NEW.matches_played
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check for win streak achievements
  IF NEW.wins - OLD.wins = 1 THEN
    -- Calculate current win streak
    -- Add achievement if applicable
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER check_achievements_after_stats_update
  AFTER UPDATE ON character_stats
  FOR EACH ROW
  EXECUTE FUNCTION check_achievement_unlock();

-- Initial Achievements
INSERT INTO achievements (name, description, category, points) VALUES
  ('Rookie', 'Play your first 10 matches', 'matches_played', 10),
  ('Veteran', 'Play 100 matches', 'matches_played', 100),
  ('Master', 'Play 1000 matches', 'matches_played', 1000),
  ('Team Player', 'Receive 10 endorsements', 'social', 50),
  ('Popular', 'Receive 50 endorsements', 'social', 200),
  ('Win Streak', 'Win 5 matches in a row', 'performance', 100),
  ('Perfect Match', 'Complete a match with no deaths', 'performance', 150),
  ('Strategist', 'Play all strategist characters at least once', 'variety', 100),
  ('Jack of All Trades', 'Play every character at least once', 'variety', 200)
ON CONFLICT DO NOTHING;