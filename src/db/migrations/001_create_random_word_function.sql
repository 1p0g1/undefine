-- Add UUID validation constraint
ALTER TABLE words ADD CONSTRAINT words_id_check CHECK (
  id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- Create function for efficient random word selection
CREATE OR REPLACE FUNCTION get_random_unassigned_word()
RETURNS TABLE (
  id uuid,
  word text,
  clues jsonb
) AS $$
BEGIN
  -- Use TABLESAMPLE for efficient random selection
  RETURN QUERY
  SELECT w.id, w.word, w.clues
  FROM words w
  TABLESAMPLE SYSTEM (1)
  WHERE NOT EXISTS (
    SELECT 1 
    FROM game_sessions gs 
    WHERE gs.word_id = w.id 
    AND gs.created_at > NOW() - INTERVAL '24 hours'
  )
  LIMIT 1;
  
  -- Fallback to full table scan if TABLESAMPLE returns no results
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT w.id, w.word, w.clues
    FROM words w
    WHERE NOT EXISTS (
      SELECT 1 
      FROM game_sessions gs 
      WHERE gs.word_id = w.id 
      AND gs.created_at > NOW() - INTERVAL '24 hours'
    )
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql; 