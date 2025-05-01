/**
 * Utility functions for handling Result<T> values safely
 */
/**
 * Safely unwraps a Result<T> value, throwing an error if the result is unsuccessful
 * @param result The Result<T> to unwrap
 * @returns The unwrapped T value
 * @throws Error if the result is unsuccessful
 */
export function unwrapResult(result) {
    if (!result.success) {
        throw new Error(result.error?.message || 'Operation failed');
    }
    if (!result.data) {
        throw new Error('Result is successful but contains no data');
    }
    return result.data;
}
/**
 * Safely unwraps a Result<T> value, returning a default value if the result is unsuccessful
 * @param result The Result<T> to unwrap
 * @param defaultValue The default value to return if the result is unsuccessful
 * @returns The unwrapped T value or the default value
 */
export function unwrapResultOr(result, defaultValue) {
    if (!result.success || !result.data) {
        return defaultValue;
    }
    return result.data;
}
/**
 * Maps a Result<T> to a Result<U> using a transformation function
 * @param result The Result<T> to map
 * @param fn The transformation function
 * @returns A new Result<U>
 */
export function mapResult(result, fn) {
    if (!result.success || !result.data) {
        return {
            success: false,
            error: result.error || { code: 'MAPPING_ERROR', message: 'Failed to map result' }
        };
    }
    return {
        success: true,
        data: fn(result.data)
    };
}
/**
 * Checks if a Result<T> is successful
 * @param result The Result<T> to check
 * @returns true if the result is successful
 */
export function isSuccess(result) {
    return result.success && result.data !== undefined;
}
/**
 * Checks if a Result<T> is unsuccessful
 * @param result The Result<T> to check
 * @returns true if the result is unsuccessful
 */
export function isError(result) {
    return !result.success && result.error !== undefined;
}
