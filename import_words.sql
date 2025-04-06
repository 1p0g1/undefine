-- Create temporary table
CREATE TEMP TABLE temp_words (
    word VARCHAR(255),
    definition TEXT,
    etymology TEXT,
    first_letter CHAR(1),
    in_a_sentence TEXT,
    number_of_letters INTEGER,
    equivalents TEXT,
    difficulty VARCHAR(50)
);

-- Copy data from CSV
\copy temp_words FROM 'un_define_all_unique_word_clues_v2.csv' WITH CSV HEADER;

-- Insert data into words table
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
    word,
    CASE 
        WHEN equivalents IS NOT NULL AND equivalents != '' 
        THEN definition || ' Synonyms: ' || equivalents 
        ELSE definition 
    END as definition,
    etymology,
    first_letter,
    in_a_sentence,
    'unknown' as part_of_speech,
    difficulty
FROM temp_words;

-- Drop temporary table
DROP TABLE temp_words; 