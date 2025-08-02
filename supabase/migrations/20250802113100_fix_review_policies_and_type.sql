-- Drop existing policies on the 'reviews' table to allow for the column type change(TEXT to uUID)
DROP POLICY IF EXISTS "Users can only insert their own data" ON reviews;
DROP POLICY IF EXISTS "Users can only update their own data" ON reviews;
DROP POLICY IF EXISTS "Allow select rating" ON reviews;

-- Alter the user_id column(TEXT to UUID)
ALTER TABLE reviews
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- UPDATE all policies.
CREATE POLICY "Users can only insert their own data"
ON reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own data"
ON reviews
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow select rating"
ON reviews
FOR SELECT
USING (auth.role() = 'anon');