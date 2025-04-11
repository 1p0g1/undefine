-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Words table
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word VARCHAR(255) NOT NULL,
  definition TEXT NOT NULL,
  etymology TEXT,
  first_letter CHAR(1),
  in_a_sentence TEXT,
  number_of_letters INTEGER,
  equivalents TEXT,
  difficulty VARCHAR(50),
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID REFERENCES words(id),
  word VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  guesses TEXT[] DEFAULT ARRAY[]::TEXT[],
  guesses_used INTEGER DEFAULT 0,
  revealed_clues TEXT[] DEFAULT ARRAY['D']::TEXT[],
  clue_status JSONB NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE,
  is_won BOOLEAN DEFAULT FALSE,
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
  word_id UUID REFERENCES words(id),
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

-- Insert some sample words
INSERT INTO words (word, definition, etymology, first_letter, in_a_sentence, number_of_letters, equivalents, difficulty, date)
VALUES 
  (
    'example',
    'A representative form or pattern',
    'From Latin exemplum "sample, pattern"',
    'e',
    'This is an example sentence.',
    7,
    'sample, instance, illustration',
    'easy',
    CURRENT_DATE
  ),
  (
    'define',
    'State or describe exactly the nature, scope, or meaning of',
    'From Latin definire "to limit, determine"',
    'd',
    'Can you define what this word means?',
    6,
    'explain, specify, establish',
    'medium',
    CURRENT_DATE + INTERVAL '1 day'
  ),
  (
    'reverse',
    'Move backward in direction or position; change to the opposite',
    'From Latin reversus "turn back"',
    'r',
    'The car began to reverse out of the driveway.',
    7,
    'invert, flip, switch',
    'medium',
    CURRENT_DATE + INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING; 