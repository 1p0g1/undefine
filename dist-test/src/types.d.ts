export interface GameSession {
    id: string;
    word_id: string;
    word: string;
    guesses: string[];
    revealed_clues: string[];
    clue_status: Record<string, 'red' | 'grey' | 'green' | 'neutral'>;
    is_complete: boolean;
    is_won: boolean;
    start_time: string;
    end_time?: string;
}
export interface WordData {
    id: string;
    word: string;
    definition: string;
    etymology?: string;
    first_letter: string;
    in_a_sentence?: string;
    number_of_letters: number;
    equivalents?: string;
}
export interface GuessResult {
    isCorrect: boolean;
    guess: string;
    isFuzzy: boolean;
    fuzzyPositions: number[];
    gameOver: boolean;
    correctWord?: string;
}
//# sourceMappingURL=types.d.ts.map