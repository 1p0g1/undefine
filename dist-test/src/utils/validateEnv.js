/**
 * Environment variable validation utility
 * Checks for required variables and provides helpful error messages
 */
/**
 * Definition of all environment variables used in the application
 */
const ENV_VARS = [
    {
        name: 'NODE_ENV',
        required: false,
        fallback: 'development',
        validator: (value) => ['development', 'production', 'test'].includes(value),
        description: 'Application environment (development, production, test)'
    },
    {
        name: 'PORT',
        required: false,
        fallback: '3001',
        validator: (value) => !isNaN(Number(value)),
        description: 'Port for the API server to listen on'
    },
    {
        name: 'DB_PROVIDER',
        required: true,
        validator: (value) => ['supabase', 'mock'].includes(value),
        description: 'Database provider to use (supabase, mock)'
    },
    {
        name: 'SUPABASE_URL',
        required: true,
        requiredIn: ['production'],
        validator: (value) => value.startsWith('https://'),
        isSecret: false,
        description: 'Supabase project URL'
    },
    {
        name: 'SUPABASE_ANON_KEY',
        required: true,
        requiredIn: ['production'],
        isSecret: true,
        description: 'Supabase anonymous key'
    },
    {
        name: 'JWT_SECRET',
        required: true,
        requiredIn: ['production'],
        isSecret: true,
        validator: (value) => value.length >= 32,
        description: 'Secret key for JWT token signing'
    },
    {
        name: 'JWT_EXPIRY',
        required: false,
        fallback: '24h',
        description: 'JWT token expiry time'
    },
    {
        name: 'ENABLE_METRICS',
        required: false,
        fallback: 'false',
        validator: (value) => ['true', 'false'].includes(value),
        description: 'Enable/disable metrics collection'
    }
];
/**
 * Validate all environment variables based on configuration
 * @returns ValidationResult object with validation status
 */
export function validateEnv() {
    const result = {
        isValid: true,
        missing: [],
        invalid: [],
        warnings: []
    };
    const currentEnv = process.env.NODE_ENV || 'development';
    // Check each environment variable
    ENV_VARS.forEach(config => {
        const value = process.env[config.name];
        const isRequired = config.required &&
            (!config.requiredIn || config.requiredIn.includes(currentEnv));
        // Check if required variable is missing
        if (isRequired && !value) {
            result.missing.push(config.name);
            result.isValid = false;
            return;
        }
        // If value exists, validate it
        if (value && config.validator && !config.validator(value)) {
            result.invalid.push(config.name);
            result.isValid = false;
            return;
        }
        // Add warnings for production environment
        if (currentEnv === 'production') {
            // Warning if using mock database in production
            if (config.name === 'DB_PROVIDER' && value === 'mock') {
                result.warnings.push('Using mock database in production environment');
            }
            // Warning if development-only features are enabled
            if (config.name === 'ENABLE_METRICS' && value === 'true') {
                result.warnings.push('Metrics collection is enabled in production');
            }
        }
    });
    return result;
}
/**
 * Print validation results to console
 * @param results ValidationResult object
 */
export function printValidationResults(results) {
    if (results.isValid && results.warnings.length === 0) {
        console.log('✅ Environment validation passed: All variables are valid');
        return;
    }
    if (!results.isValid) {
        console.error('❌ Environment validation failed:');
        if (results.missing.length > 0) {
            console.error(`  Missing required variables: ${results.missing.join(', ')}`);
        }
        if (results.invalid.length > 0) {
            console.error(`  Invalid variables: ${results.invalid.join(', ')}`);
        }
    }
    if (results.warnings.length > 0) {
        console.warn('⚠️ Environment warnings:');
        results.warnings.forEach(warning => {
            console.warn(`  - ${warning}`);
        });
    }
}
/**
 * Validate environment and exit if critical errors exist
 * @param exitOnFailure Whether to exit the process if validation fails
 * @returns True if validation passed, false otherwise
 */
export function validateAndExit(exitOnFailure = true) {
    const results = validateEnv();
    printValidationResults(results);
    if (!results.isValid && exitOnFailure) {
        console.error('Exiting due to invalid environment configuration');
        process.exit(1);
    }
    return results.isValid;
}
export default validateAndExit;
//# sourceMappingURL=validateEnv.js.map