/*
  # Final fix for party member policies

  1. Changes
    - Simplify party member policies to ensure proper access
    - Update function to use SECURITY DEFINER with search_path
    - Add explicit transaction handling
  
  2. Security
    - Ensure proper RLS bypass for function
    - Maintain data integrity with transactions
    - Set explicit search_path for security
*/

-- Drop existing party member policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read party members" ON party_members;
  DROP POLICY IF EXISTS "Users can join or be added to parties" ON party_members;
  DROP POLICY IF EXISTS "Users can update their own status" ON party_members;
  DROP POLICY IF EXISTS "Users can leave parties" ON party_members;
  DROP POLICY IF EXISTS "Party leaders can manage members" ON party_members;
END $$;

-- Create simplified party member policies
CREATE POLICY "Anyone can read party members"
  ON party_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Party members can manage themselves"
  ON party_members
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parties
      WHERE id = party_members.party_id
      AND leader_id = auth.uid()
    )
  );

-- Update function with proper security context
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
      -- Create party
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

  -- Add party leader as member
  INSERT INTO party_members (party_id, user_id, ready)
  VALUES (new_party_id, auth.uid(), false);

  -- Return the party ID and code
  RETURN QUERY
  SELECT new_party_id, new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;