/*
  # Fix party system policies

  1. Changes
    - Add safety checks for existing policies
    - Add missing RLS policies for party management
    - Update party creation function
  
  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for party management
    - Add SECURITY DEFINER to party creation function
*/

-- Add code column to parties table
ALTER TABLE parties ADD COLUMN IF NOT EXISTS code text UNIQUE;

-- Create party codes table if not exists
CREATE TABLE IF NOT EXISTS party_codes (
  code text PRIMARY KEY,
  party_id uuid REFERENCES parties(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  UNIQUE(party_id)
);

-- Enable RLS
ALTER TABLE party_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Parties policies
  DROP POLICY IF EXISTS "Anyone can read parties" ON parties;
  DROP POLICY IF EXISTS "Users can create parties" ON parties;
  DROP POLICY IF EXISTS "Party leaders can update their parties" ON parties;
  DROP POLICY IF EXISTS "Party leaders can delete their parties" ON parties;
  
  -- Party members policies
  DROP POLICY IF EXISTS "Anyone can read party members" ON party_members;
  DROP POLICY IF EXISTS "Users can join parties" ON party_members;
  DROP POLICY IF EXISTS "Users can update their party member status" ON party_members;
  DROP POLICY IF EXISTS "Users can leave parties" ON party_members;
  DROP POLICY IF EXISTS "Party leaders can manage members" ON party_members;
  
  -- Party codes policies
  DROP POLICY IF EXISTS "Anyone can read party codes" ON party_codes;
  DROP POLICY IF EXISTS "Party leaders can create codes" ON party_codes;
END $$;

-- RLS Policies for parties
CREATE POLICY "Anyone can read parties"
  ON parties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create parties"
  ON parties
  FOR INSERT
  TO authenticated
  WITH CHECK (leader_id = auth.uid());

CREATE POLICY "Party leaders can update their parties"
  ON parties
  FOR UPDATE
  TO authenticated
  USING (leader_id = auth.uid());

CREATE POLICY "Party leaders can delete their parties"
  ON parties
  FOR DELETE
  TO authenticated
  USING (leader_id = auth.uid());

-- RLS Policies for party_members
CREATE POLICY "Anyone can read party members"
  ON party_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join parties"
  ON party_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their party member status"
  ON party_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can leave parties"
  ON party_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Party leaders can manage members"
  ON party_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parties
      WHERE parties.id = party_members.party_id
      AND parties.leader_id = auth.uid()
    )
  );

-- RLS Policies for party codes
CREATE POLICY "Anyone can read party codes"
  ON party_codes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Party leaders can create codes"
  ON party_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parties
      WHERE id = party_id
      AND leader_id = auth.uid()
    )
  );

-- Function to generate unique party code
CREATE OR REPLACE FUNCTION generate_party_code()
RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create party with code
CREATE OR REPLACE FUNCTION create_party_with_code()
RETURNS TABLE (
  party_id uuid,
  party_code text
) AS $$
DECLARE
  new_party_id uuid;
  new_code text;
BEGIN
  -- Generate unique code
  LOOP
    new_code := generate_party_code();
    BEGIN
      INSERT INTO parties (id, leader_id, code)
      VALUES (gen_random_uuid(), auth.uid(), new_code)
      RETURNING id INTO new_party_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- Code already exists, try again
      CONTINUE;
    END;
  END LOOP;

  -- Create party code record
  INSERT INTO party_codes (code, party_id)
  VALUES (new_code, new_party_id);

  RETURN QUERY
  SELECT new_party_id, new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;