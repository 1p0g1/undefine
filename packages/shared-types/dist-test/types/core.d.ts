/**
 * Core shared types for Un-Define game
 */
export type GameState = 'active' | 'completed' | 'expired';
export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';
export type ClueStatus = {
    [key in ClueType]: 'neutral' | 'grey' | 'correct' | 'incorrect';
};
export interface GuessResult {
    isCorrect: boolean;
    guess: string;
    isFuzzy: boolean;
    fuzzyPositions: number[];
    gameOver: boolean;
    correctWord?: string;
}
export interface WordClues {
    D: string;
    E: string | null;
    F: string;
    I: string | null;
    N: number;
    E2: string | null;
}
export interface WordData {
    id: string;
    word: string;
    definition: string;
    etymology: string | null;
    first_letter: string;
    in_a_sentence: string | null;
    number_of_letters: number;
    equivalents: string | null;
    difficulty: string | null;
    created_at: string | null;
    updated_at: string | null;
    clues: WordClues;
}
export interface SafeClueData {
    D: string;
    E: string | null;
    F: string;
    I: string | null;
    N: number;
    E2: string | null;
}
//# sourceMappingURL=core.d.ts.map