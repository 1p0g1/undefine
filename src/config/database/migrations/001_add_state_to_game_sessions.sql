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