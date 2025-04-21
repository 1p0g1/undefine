/**
 * Helper function to check for undefined values in test data
 * This is used to ensure that test data doesn't contain undefined values,
 * which can cause issues with Supabase and TypeScript during Render builds.
 * 
 * @param obj - The object to check for undefined values
 * @param path - The current path in the object (used for recursion)
 * @returns An array of paths where undefined values were found
 */
export function findUndefinedValues(obj: any, path: string = ''): string[] {
  const undefinedPaths: string[] = [];
  
  if (obj === undefined) {
    return [path || 'root'];
  }
  
  if (obj === null || typeof obj !== 'object') {
    return [];
  }
  
  for (const key in obj) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (obj[key] === undefined) {
      undefinedPaths.push(currentPath);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      undefinedPaths.push(...findUndefinedValues(obj[key], currentPath));
    }
  }
  
  return undefinedPaths;
}

/**
 * Asserts that an object does not contain any undefined values
 * This is used in tests to ensure that test data is properly formatted
 * for Supabase and TypeScript compatibility.
 * 
 * @param obj - The object to check
 * @param message - Optional message to include in the assertion error
 */
export function assertNoUndefined(obj: any, message?: string): void {
  const undefinedPaths = findUndefinedValues(obj);
  
  if (undefinedPaths.length > 0) {
    throw new Error(
      `${message || 'Object contains undefined values'} at paths: ${undefinedPaths.join(', ')}`
    );
  }
} 