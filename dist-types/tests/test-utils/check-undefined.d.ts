/**
 * Helper function to check for undefined values in test data
 * This is used to ensure that test data doesn't contain undefined values,
 * which can cause issues with Supabase and TypeScript during Render builds.
 *
 * @param obj - The object to check for undefined values
 * @param path - The current path in the object (used for recursion)
 * @returns An array of paths where undefined values were found
 */
export declare function findUndefinedValues(obj: any, path?: string): string[];
/**
 * Asserts that an object does not contain any undefined values
 * This is used in tests to ensure that test data is properly formatted
 * for Supabase and TypeScript compatibility.
 *
 * @param obj - The object to check
 * @param message - Optional message to include in the assertion error
 */
export declare function assertNoUndefined(obj: any, message?: string): void;
