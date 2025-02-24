/*
  # Party System Implementation

  1. New Tables
    - `party_codes`
      - `code` (text, primary key) - Unique party code
      - `party_id` (uuid) - Reference to parties table
      - `created_at` (timestamp)
      - `expires_at` (timestamp)

  2. Changes
    - Add `code` column to parties table
    - Add unique constraint on party code
    - Add expiration handling for codes

  3. Security
    - Enable RLS on new tables
    - Add policies for party code access
*/

-- Add code column to parties table
ALTER TABLE parties ADD COLUMN IF NOT EXISTS code text UNIQUE;

-- Create party codes table
CREATE TABLE IF NOT EXISTS party_codes (
  code text PRIMARY KEY,
  party_id uuid REFERENCES parties(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  UNIQUE(party_id)
);

-- Enable RLS
ALTER TABLE party_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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