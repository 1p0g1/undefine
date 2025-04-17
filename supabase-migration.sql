-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Add state column to game_sessions table
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'active';

-- Update existing rows to have a state
UPDATE game_sessions
SET state = CASE
    WHEN is_complete THEN 'completed'
    ELSE 'active'
END
WHERE state IS NULL;

-- Add check constraint to ensure valid states
ALTER TABLE game_sessions
ADD CONSTRAINT game_sessions_state_check
CHECK (state IN ('active', 'completed'));

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Enable all access to game_sessions"
ON game_sessions
FOR ALL
TO anon
USING (true)
WITH CHECK (true); 