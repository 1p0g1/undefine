-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Words table
CREATE TABLE IF NOT EXISTS words (
  word_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word VARCHAR(255) NOT NULL,
  definition TEXT NOT NULL,
  part_of_speech VARCHAR(50) NOT NULL,
  etymology TEXT,
  first_letter CHAR(1),
  is_plural BOOLEAN,
  num_syllables INTEGER,
  example_sentence TEXT,
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_email VARCHAR(255) PRIMARY KEY,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  average_time INTEGER DEFAULT 0,
  average_guesses FLOAT DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255) NOT NULL,
  word_id UUID REFERENCES words(word_id),
  word VARCHAR(255) NOT NULL,
  time_taken INTEGER NOT NULL,
  guesses_used INTEGER NOT NULL,
  fuzzy_matches INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Archive table for old leaderboard entries
CREATE TABLE IF NOT EXISTS leaderboard_archive (
  LIKE leaderboard INCLUDING ALL
);

-- Error tracking table (simple implementation)
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_type VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_email ON leaderboard(user_email);
CREATE INDEX IF NOT EXISTS idx_user_stats_streak ON user_stats(current_streak DESC, longest_streak DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);

-- Function to archive old leaderboard entries
CREATE OR REPLACE FUNCTION archive_old_leaderboard_entries()
RETURNS void AS $$
BEGIN
  WITH moved_rows AS (
    DELETE FROM leaderboard
    WHERE created_at < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')
    RETURNING *
  )
  INSERT INTO leaderboard_archive
  SELECT * FROM moved_rows;
END;
$$ LANGUAGE plpgsql;

-- Sample word data
INSERT INTO words (word, definition, etymology, first_letter, example_sentence, num_letters, synonyms, difficulty)
VALUES 
  (
    'example', 
    'A representative form or pattern',
    'From Latin exemplum, from eximere "take out, remove"',
    'e',
    'This is an example sentence.',
    7,
    ARRAY['instance', 'sample', 'illustration', 'case'],
    'Medium'
  ),
  (
    'define', 
    'State or describe exactly the nature, scope, or meaning of',
    'From Latin definire, from de- "completely" + finire "to bound, limit"',
    'd',
    'Can you define what this word means?',
    6,
    ARRAY['explain', 'specify', 'establish', 'determine'],
    'Easy'
  ),
  (
    'reverse', 
    'Move backward in direction or position; change to the opposite',
    'From Latin reversus, past participle of revertere "turn back"',
    'r',
    'The car began to reverse out of the driveway.',
    7,
    ARRAY['invert', 'flip', 'switch', 'transpose'],
    'Medium'
  )
ON CONFLICT DO NOTHING; 