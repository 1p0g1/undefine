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

-- Import from CSV (replace 'new_words.csv' with your file name)
\copy new_words FROM 'new_words.csv' WITH CSV HEADER;

-- Insert new words, skipping duplicates
INSERT INTO words (
    word,
    definition,
    etymology,
    first_letter,
    example_sentence,
    part_of_speech,
    difficulty
)
SELECT
    n.word,
    CASE 
        WHEN n.equivalents IS NOT NULL AND n.equivalents != '' 
        THEN n.definition || ' Synonyms: ' || n.equivalents 
        ELSE n.definition 
    END as definition,
    n.etymology,
    n.first_letter,
    n.in_a_sentence,
    'unknown' as part_of_speech,
    n.difficulty
FROM new_words n
WHERE NOT EXISTS (
    SELECT 1 FROM words w WHERE w.word = n.word
);

-- Report results
SELECT 'Words added: ' || COUNT(*) as result FROM new_words n
WHERE NOT EXISTS (
    SELECT 1 FROM words w WHERE w.word = n.word
);

SELECT 'Duplicates skipped: ' || COUNT(*) as result FROM new_words n
WHERE EXISTS (
    SELECT 1 FROM words w WHERE w.word = n.word
);

-- Drop temporary table
DROP TABLE new_words; 