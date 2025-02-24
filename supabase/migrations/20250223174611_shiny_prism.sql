/*
  # Fix party creation function

  1. Changes
    - Update create_party_with_code function to handle party member creation
    - Add transaction to ensure atomicity
  
  2. Security
    - Maintain SECURITY DEFINER to bypass RLS
    - Ensure party leader is automatically added as member
*/

-- Update function to handle party member creation
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