/**
 * Shared types for Un-Define game
 */
import { HINT_INDICES } from './utils/game.js';
export { HINT_INDICES };
// Re-export all utility functions and types
export * from './utils/game.js';
export * from './utils/result.js';
export * from './utils/word.js';
export * from './utils/mappers.js';
// Error handling
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
