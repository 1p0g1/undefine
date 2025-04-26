import { normalizeEquivalents } from './word.js';
/**
 * Safely maps a DBWord to a GameWord, ensuring equivalents is always a string[]
 * @param dbWord The database word object
 * @returns A GameWord with normalized equivalents property
 */
export function mapDBWordToGameWord(dbWord) {
    return {
        id: dbWord.id,
        word: dbWord.word,
        definition: dbWord.definition,
        etymology: dbWord.etymology,
        firstLetter: dbWord.first_letter,
        inASentence: dbWord.in_a_sentence,
        numberOfLetters: dbWord.number_of_letters,
        // Use the centralized utility function to normalize equivalents
        equivalents: normalizeEquivalents(dbWord.equivalents),
        difficulty: dbWord.difficulty,
        createdAt: dbWord.created_at,
        updatedAt: dbWord.updated_at
    };
}
export function mapDBUserStatsToUserStats(dbStats) {
    return {
        username: dbStats.username,
        gamesPlayed: dbStats.games_played,
        gamesWon: dbStats.games_won,
        averageGuesses: dbStats.average_guesses,
        averageTime: dbStats.average_time,
        currentStreak: dbStats.current_streak,
        longestStreak: dbStats.longest_streak,
        lastPlayedAt: dbStats.last_played_at
    };
}
export function mapDBGameSessionToGameSession(dbSession) {
    return {
        id: dbSession.id,
        userId: dbSession.user_id,
        wordId: dbSession.word_id,
        word: dbSession.word,
        words: dbSession.words ? mapDBWordToGameWord(dbSession.words) : undefined,
        wordSnapshot: dbSession.word_snapshot,
        startTime: dbSession.start_time,
        endTime: dbSession.end_time,
        guesses: dbSession.guesses,
        hintsRevealed: dbSession.hints_revealed,
        completed: dbSession.completed,
        won: dbSession.won,
        score: dbSession.score,
        guessesUsed: dbSession.guesses_used,
        revealedClues: dbSession.revealed_clues,
        isComplete: dbSession.is_complete,
        isWon: dbSession.is_won,
        state: dbSession.state
    };
}
export function mapDBLeaderboardEntryToLeaderboardEntry(dbEntry) {
    return {
        username: dbEntry.username,
        score: dbEntry.score,
        rank: dbEntry.rank,
        wordId: dbEntry.word_id,
        word: dbEntry.word,
        timeTaken: dbEntry.time_taken,
        guessesUsed: dbEntry.guesses_used
    };
}
export function mapDBStreakLeaderToStreakLeader(dbLeader) {
    return {
        username: dbLeader.username,
        currentStreak: dbLeader.current_streak,
        longestStreak: dbLeader.longest_streak,
        streak: dbLeader.streak
    };
}
export function mapDBDailyMetricsToDailyMetrics(dbMetrics) {
    return {
        date: dbMetrics.date,
        totalGames: dbMetrics.total_games,
        totalWins: dbMetrics.total_wins,
        averageGuesses: dbMetrics.average_guesses,
        averageTime: dbMetrics.average_time
    };
}
//# sourceMappingURL=mappers.js.map