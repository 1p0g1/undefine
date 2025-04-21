import { vi } from 'vitest';
import { PostgrestSingleResponse } from '@supabase/postgrest-js';

/**
 * Use this mock builder to safely stub Supabase's PostgrestBuilder chain
 * for `.from().select().eq().single()` without triggering linter or type issues.
 *
 * This ensures Render builds do not break due to improper `vi.fn()` mocking.
 * 
 * IMPORTANT: Always use null for optional fields, never undefined.
 * Supabase + TypeScript hates undefined, and Render can flag type or shape 
 * mismatches as hard errors during build.
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
export function createMockBuilder<T>(data: T): MockPostgrestBuilder<T> {
  const mockBuilder: MockPostgrestBuilder<T> = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({
      data,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    }),
  };

  // Make the builder self-referencing for method chaining
  mockBuilder.select.mockReturnValue(mockBuilder);
  mockBuilder.eq.mockReturnValue(mockBuilder);

  return mockBuilder;
} 