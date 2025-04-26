export interface WordData {
    id: string;
    word: string;
    clues: {
        D: string;
        E: string;
        F: string;
        I: string;
        N: number;
        E2: string[];
    };
}
export type HintIndex = 0 | 1 | 2 | 3 | 4 | 5;
export declare const HINT_INDICES: {
    readonly D: 0;
    readonly E2: 1;
    readonly F: 2;
    readonly I: 3;
    readonly N: 4;
    readonly E: 5;
};
export type GuessResult = 'correct' | 'incorrect' | null;
export interface GameState {
    wordData: WordData | null;
    revealedHints: HintIndex[];
    guessCount: number;
    isGameOver: boolean;
    hasWon: boolean;
    guessResults: GuessResult[];
    isLoading: boolean;
}
//# sourceMappingURL=game.d.ts.map