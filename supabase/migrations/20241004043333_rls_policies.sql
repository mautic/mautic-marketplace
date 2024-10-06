--Table RLS policies

----Packages Table

-- Allow insert only for service_role
CREATE POLICY "Allow insert for service role" 
ON packages
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Allow update only for service_role
CREATE POLICY "Allow update for service role"
ON packages
FOR UPDATE
USING (auth.role() = 'service_role');

-- Allow select for anon
CREATE POLICY "Allow select for service role"
ON packages
FOR SELECT
USING (auth.role() = 'anon');


----------------------------------------------------

---Versions Table

-- Allow insert only for service_role
CREATE POLICY "Allow insert for service role" 
ON versions
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Allow update only for service_role
CREATE POLICY "Allow update for service role"
ON versions
FOR UPDATE
USING (auth.role() = 'service_role');

-- Allow select for anon
CREATE POLICY "Allow select for service role"
ON versions
FOR SELECT
USING (auth.role() = 'anon');


--For Rating Table

CREATE POLICY "Users can only insert their own data"
ON reviews
FOR INSERT
WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can only update their own data"
ON reviews
FOR UPDATE
USING (user_id = reviews.user_id);