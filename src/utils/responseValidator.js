import { ApiError } from '../middleware/errorHandler.js';
// Type guard functions to validate response shapes
export const isWord = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    const word = data;
    return (typeof word.word === 'string' &&
        typeof word.partOfSpeech === 'string' &&
        typeof word.definition === 'string' &&
        typeof word.dateAdded === 'string' &&
        typeof word.letterCount === 'object' &&
        word.letterCount !== null &&
        typeof word.letterCount.count === 'number' &&
        typeof word.letterCount.display === 'string' &&
        typeof word.createdAt === 'string' &&
        typeof word.updatedAt === 'string');
};
export const isUserStats = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    const stats = data;
    return (typeof stats.username === 'string' &&
        typeof stats.games_played === 'number' &&
        typeof stats.games_won === 'number' &&
        typeof stats.average_guesses === 'number' &&
        typeof stats.average_time === 'number' &&
        typeof stats.current_streak === 'number' &&
        typeof stats.longest_streak === 'number');
};
export const isDailyMetrics = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    const metrics = data;
    return (typeof metrics.date === 'string' &&
        typeof metrics.totalPlays === 'number' &&
        typeof metrics.uniqueUsers === 'number' &&
        typeof metrics.averageGuesses === 'number' &&
        typeof metrics.averageTime === 'number');
};
export const isLeaderboardEntry = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    const entry = data;
    return (typeof entry.username === 'string' &&
        typeof entry.wordId === 'string' &&
        typeof entry.word === 'string' &&
        typeof entry.timeTaken === 'number' &&
        typeof entry.guessesUsed === 'number');
};
export const isStreakLeader = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    const leader = data;
    return (typeof leader.username === 'string' &&
        typeof leader.streak === 'number');
};
export const isGameSession = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    const session = data;
    return (typeof session.id === 'string' &&
        typeof session.word_id === 'string' &&
        typeof session.word === 'string' &&
        typeof session.start_time === 'string' &&
        typeof session.guesses_used === 'number' &&
        typeof session.revealed_clues === 'object' &&
        typeof session.is_complete === 'boolean' &&
        typeof session.is_won === 'boolean');
};
// Validation functions that throw errors if validation fails
export const validateWord = (data) => {
    if (!isWord(data)) {
        throw new ApiError(500, 'Invalid word data structure');
    }
    return data;
};
export const validateUserStats = (data) => {
    if (!isUserStats(data)) {
        throw new ApiError(500, 'Invalid user stats data structure');
    }
    return data;
};
export const validateDailyMetrics = (data) => {
    if (!isDailyMetrics(data)) {
        throw new ApiError(500, 'Invalid daily metrics data structure');
    }
    return data;
};
export const validateLeaderboardEntry = (data) => {
    if (!isLeaderboardEntry(data)) {
        throw new ApiError(500, 'Invalid leaderboard entry data structure');
    }
    return data;
};
export const validateStreakLeader = (data) => {
    if (!isStreakLeader(data)) {
        throw new ApiError(500, 'Invalid streak leader data structure');
    }
    return data;
};
export const validateGameSession = (data) => {
    if (!isGameSession(data)) {
        throw new ApiError(500, 'Invalid game session data structure');
    }
    return data;
};
