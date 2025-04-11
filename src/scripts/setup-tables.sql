-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create words table
CREATE TABLE IF NOT EXISTS words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  etymology TEXT,
  first_letter CHAR(1),
  in_a_sentence TEXT,
  number_of_letters INTEGER,
  equivalents TEXT,
  date DATE UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  username TEXT PRIMARY KEY,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  average_guesses FLOAT DEFAULT 0,
  average_time INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE
);

-- Insert sample word for today
INSERT INTO words (word, definition, etymology, first_letter, in_a_sentence, number_of_letters, equivalents, date)
VALUES (
  'cogitate',
  'To reason, argue, or think carefully and thoroughly.',
  'From Latin cogitare, to think, consider, or deliberate.',
  'c',
  'She cogitated on the problem for hours before finding a solution.',
  8,
  'contemplate, ponder, deliberate',
  CURRENT_DATE
); 