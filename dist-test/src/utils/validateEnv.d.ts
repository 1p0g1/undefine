/**
 * Environment variable validation utility
 * Checks for required variables and provides helpful error messages
 */
/**
 * Results of environment validation
 */
interface ValidationResult {
    isValid: boolean;
    missing: string[];
    invalid: string[];
    warnings: string[];
}
/**
 * Validate all environment variables based on configuration
 * @returns ValidationResult object with validation status
 */
export declare function validateEnv(): ValidationResult;
/**
 * Print validation results to console
 * @param results ValidationResult object
 */
export declare function printValidationResults(results: ValidationResult): void;
/**
 * Validate environment and exit if critical errors exist
 * @param exitOnFailure Whether to exit the process if validation fails
 * @returns True if validation passed, false otherwise
 */
export declare function validateAndExit(exitOnFailure?: boolean): boolean;
export default validateAndExit;
//# sourceMappingURL=validateEnv.d.ts.map