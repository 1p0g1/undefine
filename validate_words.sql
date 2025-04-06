-- Create temporary table for new words
CREATE TEMP TABLE new_words (
    word VARCHAR(255),
    definition TEXT,
    etymology TEXT,
    first_letter CHAR(1),
    in_a_sentence TEXT,
    number_of_letters INTEGER,
    equivalents TEXT,
    difficulty VARCHAR(50)
);

-- Import from CSV
\copy new_words FROM PROGRAM 'cat new_words.csv | iconv -f utf-8 -t utf-8 -c' WITH CSV HEADER;

-- Validation Report
WITH validation AS (
    SELECT 
        word,
        CASE
            WHEN word IS NULL OR word = '' THEN 'Word is empty'
            WHEN length(word) > 255 THEN 'Word is too long (max 255 characters)'
            WHEN word !~ '^[a-zA-Z]+$' THEN 'Word contains invalid characters (only letters allowed)'
            WHEN definition IS NULL OR definition = '' THEN 'Definition is empty'
            WHEN first_letter != lower(left(word, 1)) THEN 'First letter does not match word'
            WHEN number_of_letters != length(word) THEN 'Number of letters does not match word length'
            WHEN difficulty NOT IN ('Easy', 'Medium', 'Hard') THEN 'Invalid difficulty (must be Easy, Medium, or Hard)'
            WHEN EXISTS (SELECT 1 FROM words w WHERE w.word = new_words.word) THEN 'Word already exists in database'
            ELSE 'VALID'
        END as validation_status
    FROM new_words
)
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'ERROR: No words found in CSV'
        ELSE 'Found ' || COUNT(*) || ' words to validate'
    END as summary
FROM new_words
UNION ALL
SELECT '-------------------'
UNION ALL
SELECT 'Validation Results:'
UNION ALL
SELECT '-------------------'
UNION ALL
SELECT 'Invalid Words:'
UNION ALL
SELECT word || ': ' || validation_status 
FROM validation 
WHERE validation_status != 'VALID'
UNION ALL
SELECT '-------------------'
UNION ALL
SELECT 'Statistics:'
UNION ALL
SELECT 'Total words: ' || COUNT(*) || 
       ', Valid: ' || SUM(CASE WHEN validation_status = 'VALID' THEN 1 ELSE 0 END) ||
       ', Invalid: ' || SUM(CASE WHEN validation_status != 'VALID' THEN 1 ELSE 0 END)
FROM validation;

-- Drop temporary table
DROP TABLE new_words; 