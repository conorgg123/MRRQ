/*
  # Fix Authentication System

  1. Changes
    - Drop existing constraints safely
    - Update RLS policies
    - Improve user creation handling

  2. Security
    - Maintain existing relationships
    - Update RLS policies
    - Improve error handling
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing policies safely
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users are readable by all authenticated users" ON users;
  DROP POLICY IF EXISTS "Users can update their own record" ON users;
  DROP POLICY IF EXISTS "Allow insert during user creation" ON users;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
  DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
  DROP POLICY IF EXISTS "Users can read their own data" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
EXCEPTION 
  WHEN undefined_object THEN NULL;
END $$;

-- Drop existing constraints safely
DO $$ 
BEGIN
  ALTER TABLE public.users 
    DROP CONSTRAINT IF EXISTS users_email_key,
    DROP CONSTRAINT IF EXISTS users_username_key;
EXCEPTION 
  WHEN undefined_object THEN NULL;
END $$;

-- Update users table structure
ALTER TABLE public.users 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN username SET NOT NULL,
  ADD CONSTRAINT users_email_key UNIQUE (email),
  ADD CONSTRAINT users_username_key UNIQUE (username),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
CREATE POLICY "Allow public read access to usernames"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to update their own record"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow system to create user records"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  retry_count integer := 0;
  max_retries integer := 10;
BEGIN
  -- Get base username from metadata or email
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Clean username (remove special characters, spaces)
  base_username := regexp_replace(
    lower(base_username),
    '[^a-z0-9_-]',
    '',
    'g'
  );
  
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;

  -- Try to insert with base username first
  BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (NEW.id, NEW.email, base_username)
    RETURNING username INTO final_username;
    RETURN NEW;
  EXCEPTION WHEN unique_violation THEN
    -- If username exists, try with random numbers
    WHILE retry_count < max_retries LOOP
      BEGIN
        final_username := base_username || floor(random() * 9999)::text;
        INSERT INTO public.users (id, email, username)
        VALUES (NEW.id, NEW.email, final_username);
        RETURN NEW;
      EXCEPTION WHEN unique_violation THEN
        retry_count := retry_count + 1;
        CONTINUE;
      END;
    END LOOP;
    
    -- If all retries failed, use UUID-based username
    final_username := 'user_' || replace(gen_random_uuid()::text, '-', '');
    INSERT INTO public.users (id, email, username)
    VALUES (NEW.id, NEW.email, final_username);
    RETURN NEW;
  END;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();