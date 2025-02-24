/*
  # Fix party member policies and function

  1. Changes
    - Drop and recreate party member policies with correct permissions
    - Update create_party_with_code function to handle security properly
    - Add explicit security policies
  
  2. Security
    - Ensure party leaders can manage their party members
    - Allow function to create initial party member entry
    - Maintain proper RLS enforcement
*/

-- Drop existing party member policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read party members" ON party_members;
  DROP POLICY IF EXISTS "Party creation function can add members" ON party_members;
  DROP POLICY IF EXISTS "Users can update their own status" ON party_members;
  DROP POLICY IF EXISTS "Users can leave parties" ON party_members;
  DROP POLICY IF EXISTS "Party leaders can manage all members" ON party_members;
END $$;

-- Create new party member policies
CREATE POLICY "Anyone can read party members"
  ON party_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join or be added to parties"
  ON party_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parties
      WHERE id = party_id
      AND leader_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own status"
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
      WHERE id = party_members.party_id
      AND leader_id = auth.uid()
    )
  );

-- Update function to properly handle security context
CREATE OR REPLACE FUNCTION create_party_with_code()
RETURNS TABLE (
  party_id uuid,
  party_code text
) AS $$
DECLARE
  new_party_id uuid;
  new_code text;
BEGIN
  -- Start transaction
  BEGIN
    -- Set local settings to bypass RLS
    SET LOCAL rls.force_policy = FALSE;

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

    -- Add party leader as member
    INSERT INTO party_members (party_id, user_id, ready)
    VALUES (new_party_id, auth.uid(), false);

    -- Return the party ID and code
    RETURN QUERY
    SELECT new_party_id, new_code;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback on any error
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;