import { vi } from 'vitest';
/**
 * Creates a mock PostgrestBuilder with the specified data
 *
 * @template T - The type of data to be returned
 * @param data - The data to be returned by the mock
 * @returns A mock PostgrestBuilder that can be used to mock Supabase client
 */
export function createMockBuilder(data) {
    const mockBuilder = {
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
