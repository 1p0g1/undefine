import { WordData } from '../../packages/shared-types/src/utils/word.js';
/**
 * Creates a mock WordData object with enforced null defaults for optional fields
 * This ensures that no undefined values can sneak into test data.
 *
 * @param overrides - Optional overrides for the default values
 * @returns A mock WordData object with all optional fields explicitly set to null if not overridden
 */
export declare function createMockWordData(overrides?: Partial<WordData>): WordData;
