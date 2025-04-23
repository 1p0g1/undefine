import { vi } from 'vitest';
/**
 * Mock builder interface for Supabase PostgrestBuilder
 * This allows for proper typing and mocking of the Supabase client method chain
 *
 * @template T - The type of data returned by the query
 */
export interface MockPostgrestBuilder<T> {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
}
/**
 * Creates a mock PostgrestBuilder with the specified data
 *
 * @template T - The type of data to be returned
 * @param data - The data to be returned by the mock
 * @returns A mock PostgrestBuilder that can be used to mock Supabase client
 */
export declare function createMockBuilder<T>(data: T): MockPostgrestBuilder<T>;
