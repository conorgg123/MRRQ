/*
  # Fix Authentication and Party System Issues

  1. Changes
    - Drop existing problematic policies
    - Create simplified party member policies
    - Add insert policy for users table
    - Add better error handling for user creation

  2. Security
    - Fix recursive policy issue
    - Ensure proper access control
*/

-- Drop existing problematic policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Party system access" ON party_members;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
  DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
END $$;

-- Update users table policies
CREATE POLICY "Users are readable by all authenticated users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow insert during user creation"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Fix party member policies
CREATE POLICY "Read party members"
  ON party_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage party membership"
  ON party_members
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parties
      WHERE parties.id = party_members.party_id
      AND parties.leader_id = auth.uid()
    )
  );

-- Update user creation function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  username_base text;
  username_final text;
  counter integer := 0;
BEGIN
  -- Get base username from metadata or email
  username_base := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- Try to insert with base username first
  BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (NEW.id, NEW.email, username_base)
    RETURNING username INTO username_final;
  EXCEPTION WHEN unique_violation THEN
    -- If username exists, try with incrementing numbers
    LOOP
      counter := counter + 1;
      BEGIN
        username_final := username_base || counter::text;
        INSERT INTO public.users (id, email, username)
        VALUES (NEW.id, NEW.email, username_final);
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        CONTINUE;
      END;
      EXIT WHEN counter > 1000;
    END LOOP;
  END;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log error and re-raise
  RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
  RAISE;
END;
$$;