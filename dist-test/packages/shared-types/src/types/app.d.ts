export interface GameWord {
    id: string;
    word: string;
    definition: string;
    etymology: string | null;
    firstLetter: string;
    inASentence: string | null;
    numberOfLetters: number;
    equivalents: string[];
    difficulty: string;
    createdAt: string | null;
    updatedAt: string | null;
}
export interface UserStats {
    username: string;
    gamesPlayed: number;
    gamesWon: number;
    averageGuesses: number;
    averageTime: number;
    currentStreak: number;
    longestStreak: number;
    lastPlayedAt: string;
}
export interface GameSession {
    id: string;
    userId: string;
    wordId: string;
    word: string;
    words?: GameWord;
    wordSnapshot?: string;
    startTime: string;
    endTime?: string;
    guesses: string[];
    hintsRevealed: number[];
    completed: boolean;
    won: boolean;
    score?: number;
    guessesUsed?: number;
    revealedClues?: number[];
    isComplete?: boolean;
    isWon?: boolean;
    state?: string;
}
export interface LeaderboardEntry {
    username: string;
    score: number;
    rank: number;
    wordId: string;
    word: string;
    timeTaken: number;
    guessesUsed: number;
}
export interface StreakLeader {
    username: string;
    currentStreak: number;
    longestStreak: number;
    streak: number;
}
export interface DailyMetrics {
    date: string;
    totalGames: number;
    totalWins: number;
    averageGuesses: number;
    averageTime: number;
}
//# sourceMappingURL=app.d.ts.map