/**
 * LEGACY EXAMPLE FILE
 * This file contains mock word data that was used during initial development
 * before integrating with Supabase. It is kept for reference purposes.
 *
 * Current implementation uses Supabase with the following schema:
 * - id: string
 * - word: string
 * - definition: string
 * - etymology: string
 * - first_letter: string
 * - in_a_sentence: string
 * - number_of_letters: number
 * - equivalents: string (comma-separated)
 * - difficulty: string
 */
export interface WordEntry {
    word: string;
    partOfSpeech: string;
    synonyms?: string[];
    definition: string;
    alternateDefinition?: string;
    letterCount: {
        count: number;
        display: string;
    };
}
export declare const words: WordEntry[];
export declare function getRandomWord(): WordEntry;
//# sourceMappingURL=mock-words.d.ts.map