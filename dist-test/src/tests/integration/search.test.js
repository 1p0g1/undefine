import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SupabaseClient } from '../../config/database/SupabaseClient';
describe('Word Search Integration Tests', () => {
    let client;
    beforeAll(async () => {
        client = SupabaseClient.getInstance();
        await client.connect();
    });
    afterAll(async () => {
        await client.disconnect();
    });
    describe('searchWords', () => {
        it('should return error for queries less than 2 characters', async () => {
            const result = await client.searchWords('a');
            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('INVALID_QUERY');
        });
        it('should return error for empty query', async () => {
            const result = await client.searchWords('');
            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('INVALID_QUERY');
        });
        it('should find words matching the search query', async () => {
            const result = await client.searchWords('test');
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
            if (result.data && result.data.length > 0) {
                const word = result.data[0];
                expect(word).toHaveProperty('id');
                expect(word).toHaveProperty('word');
                expect(word).toHaveProperty('definition');
                expect(word).toHaveProperty('clues');
            }
        });
        it('should handle special characters in search query', async () => {
            const result = await client.searchWords('test%');
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });
        it('should limit results to 20 words', async () => {
            const result = await client.searchWords('the');
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            if (result.data) {
                expect(result.data.length).toBeLessThanOrEqual(20);
            }
        });
        it('should return empty array when no matches found', async () => {
            const result = await client.searchWords('xyzabc123');
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=search.test.js.map