-- Disable RLS on the words table
ALTER TABLE words DISABLE ROW LEVEL SECURITY;

-- Enable RLS on the words table
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for anonymous users
CREATE POLICY "Enable all operations for anonymous users"
ON words
FOR ALL
USING (true)
WITH CHECK (true);

-- Create a policy that allows read-only access for anonymous users
CREATE POLICY "Enable read-only access for anonymous users"
ON words
FOR SELECT
USING (true); 