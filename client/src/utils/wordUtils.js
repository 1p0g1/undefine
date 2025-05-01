/**
 * Maps a WordData object to a WordClues object, extracting only the hint-related fields
 */
export const mapWordDataToWordClues = (wordData) => {
    if (!wordData)
        return null;
    return {
        D: wordData.definition,
        E: wordData.etymology,
        F: wordData.first_letter,
        I: wordData.in_a_sentence,
        N: wordData.number_of_letters,
        E2: wordData.equivalents
    };
};
