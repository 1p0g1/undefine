-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Words table
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  etymology TEXT,
  first_letter TEXT,
  in_a_sentence TEXT,
  number_of_letters INTEGER,
  equivalents TEXT,
  difficulty TEXT
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID REFERENCES words(id),
  guesses TEXT[],
  revealed_clues TEXT[],
  clue_status JSONB,
  is_complete BOOLEAN,
  is_won BOOLEAN,
  start_time TIMESTAMP,
  end_time TIMESTAMP
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY,
  player_id TEXT NOT NULL,
  nickname TEXT,
  word TEXT NOT NULL,
  guesses_used INTEGER,
  used_hint BOOLEAN,
  completion_time_seconds INTEGER,
  submitted_at TIMESTAMP DEFAULT now()
);

-- Leaderboard summary table
CREATE TABLE IF NOT EXISTS leaderboard_summary (
  id UUID PRIMARY KEY,
  player_id TEXT NOT NULL,
  word TEXT NOT NULL,
  rank INTEGER,
  was_top_10 BOOLEAN,
  best_time INTEGER,
  guesses_used INTEGER,
  date DATE DEFAULT current_date
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  player_id TEXT PRIMARY KEY,
  top_10_count INTEGER DEFAULT 0,
  best_rank INTEGER,
  longest_streak INTEGER,
  current_streak INTEGER,
  average_completion_time FLOAT,
  last_played_word TEXT
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_scores_player_id ON scores(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_submitted_at ON scores(submitted_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_summary_date ON leaderboard_summary(date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_summary_player_id ON leaderboard_summary(player_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_streaks ON user_stats(current_streak DESC, longest_streak DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_email ON leaderboard(user_email);
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

-- Insert sample words
INSERT INTO words (word, definition, etymology, first_letter, in_a_sentence, number_of_letters, equivalents, difficulty)
VALUES 
  (
    'example',
    'A representative form or pattern',
    'From Latin exemplum "sample, pattern"',
    'e',
    'This is an example sentence.',
    7,
    'sample, instance, illustration',
    'easy'
  ),
  (
    'define',
    'State or describe exactly the nature, scope, or meaning of',
    'From Latin definire "to limit, determine"',
    'd',
    'Can you define what this word means?',
    6,
    'explain, specify, establish',
    'medium'
  ),
  (
    'reverse',
    'Move backward in direction or position; change to the opposite',
    'From Latin reversus "turn back"',
    'r',
    'The car began to reverse out of the driveway.',
    7,
    'invert, flip, switch',
    'medium'
  )
ON CONFLICT (id) DO NOTHING; 