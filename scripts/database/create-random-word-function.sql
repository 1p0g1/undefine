-- Function to get a random unassigned word safely
CREATE OR REPLACE FUNCTION get_random_unassigned_word()
RETURNS TABLE (
  id uuid,
  word text,
  definition text,
  etymology text,
  first_letter text,
  in_a_sentence text,
  number_of_letters integer,
  equivalents text[],
  difficulty text,
  date text
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM words
  WHERE date IS NULL
  ORDER BY random()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Usage example:
-- SELECT * FROM get_random_unassigned_word(); 