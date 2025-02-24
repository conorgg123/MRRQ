/*
  # Fix party creation function

  1. Changes
    - Make function bypass RLS for all operations
    - Add explicit transaction handling
    - Add error handling
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - All operations happen within a single transaction
*/

-- Update function to bypass RLS and handle errors properly
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
    -- Set session level settings to bypass RLS
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