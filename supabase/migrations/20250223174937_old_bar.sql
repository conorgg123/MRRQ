/*
  # Final fix for party system
  
  1. Changes
    - Consolidate all party-related operations into a single function
    - Use explicit transaction management
    - Ensure proper security context
  
  2. Security
    - Maintain RLS while allowing specific operations
    - Use security definer for controlled access
    - Explicit error handling
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public party member access" ON party_members;
  DROP TRIGGER IF EXISTS create_party_member_on_party_creation ON parties;
  DROP FUNCTION IF EXISTS handle_party_creation();
END $$;

-- Create simplified RLS policy
CREATE POLICY "Party system access"
  ON party_members
  FOR ALL
  TO authenticated
  USING (
    -- Allow if user is the member or party leader
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parties
      WHERE id = party_members.party_id
      AND leader_id = auth.uid()
    )
  );

-- Create comprehensive party management function
CREATE OR REPLACE FUNCTION create_party_with_code()
RETURNS TABLE (
  party_id uuid,
  party_code text
) AS $$
DECLARE
  new_party_id uuid;
  new_code text;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  SELECT auth.uid() INTO current_user_id;
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Start explicit transaction
  BEGIN
    -- Generate unique code
    LOOP
      new_code := generate_party_code();
      BEGIN
        -- Create party
        INSERT INTO parties (id, leader_id, code)
        VALUES (gen_random_uuid(), current_user_id, new_code)
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

    -- Create party member entry directly
    EXECUTE 'INSERT INTO party_members (party_id, user_id, ready) VALUES ($1, $2, false)'
    USING new_party_id, current_user_id;

    -- Return the party ID and code
    RETURN QUERY
    SELECT new_party_id, new_code;

    -- Commit transaction
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error in create_party_with_code: %', SQLERRM;
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_party_with_code() TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_codes ENABLE ROW LEVEL SECURITY;