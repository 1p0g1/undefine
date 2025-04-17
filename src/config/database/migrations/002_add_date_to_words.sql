-- Add date column to words table
ALTER TABLE words
ADD COLUMN IF NOT EXISTS date DATE DEFAULT NULL;

-- Add unique constraint on date to ensure only one word per day
ALTER TABLE words
ADD CONSTRAINT words_date_unique UNIQUE (date);

-- Create index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_words_date ON words(date); 