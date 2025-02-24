/*
  # Fix party member policies

  1. Changes
    - Drop and recreate party member policies with correct permissions
    - Add explicit policy for party creation function
  
  2. Security
    - Allow party leaders to manage members
    - Allow users to manage their own membership
    - Ensure function can create initial member record
*/

-- Drop existing party member policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read party members" ON party_members;
  DROP POLICY IF EXISTS "Users can join parties" ON party_members;
  DROP POLICY IF EXISTS "Users can update their party member status" ON party_members;
  DROP POLICY IF EXISTS "Users can leave parties" ON party_members;
  DROP POLICY IF EXISTS "Party leaders can manage members" ON party_members;
END $$;

-- Recreate party member policies with correct permissions
CREATE POLICY "Anyone can read party members"
  ON party_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Party creation function can add members"
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

CREATE POLICY "Party leaders can manage all members"
  ON party_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parties
      WHERE id = party_id
      AND leader_id = auth.uid()
    )
  );