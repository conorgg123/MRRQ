/*
  # Final fix for party member system using triggers

  1. Changes
    - Create trigger to handle party member creation
    - Simplify RLS policies
    - Add explicit error handling
  
  2. Security
    - Maintain RLS while allowing specific operations
    - Use triggers for automated member creation
    - Ensure proper authorization checks
*/

-- Drop existing party member policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read party members" ON party_members;
  DROP POLICY IF EXISTS "Party members can manage themselves" ON party_members;
END $$;

-- Create base RLS policies
CREATE POLICY "Public party member access"
  ON party_members
  FOR ALL
  TO authenticated
  USING (
    -- Allow access if user is member or party leader
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parties
      WHERE id = party_members.party_id
      AND leader_id = auth.uid()
    )
  );

-- Create trigger function to handle party member creation
CREATE OR REPLACE FUNCTION handle_party_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically create party member entry for leader
  INSERT INTO party_members (party_id, user_id, ready)
  VALUES (NEW.id, NEW.leader_id, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS create_party_member_on_party_creation ON parties;
CREATE TRIGGER create_party_member_on_party_creation
  AFTER INSERT ON parties
  FOR EACH ROW
  EXECUTE FUNCTION handle_party_creation();

-- Update party creation function
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
      -- Create party (trigger will handle member creation)
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

  -- Return the party ID and code
  RETURN QUERY
  SELECT new_party_id, new_code;

EXCEPTION WHEN OTHERS THEN
  -- Log error and re-raise
  RAISE NOTICE 'Error in create_party_with_code: %', SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;