import { z } from 'zod';
// Server-side environment schema
const serverEnvSchema = z.object({
    // Server Configuration
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Database Configuration
    DB_PROVIDER: z.enum(['supabase']).default('supabase'),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    DATABASE_URL: z.string().optional(),
    // Security
    JWT_SECRET: z.string().min(1),
    // API Configuration
    API_URL: z.string().url().default('http://localhost:3001'),
    // Monitoring & Metrics
    ENABLE_METRICS: z.boolean().default(false),
    METRICS_PORT: z.string().transform(Number).default('9090'),
    // Game Configuration
    MAX_GUESSES: z.coerce.number().default(6),
    HINT_DELAY: z.coerce.number().default(1000),
    // CORS Configuration
    CORS_ORIGIN: z.string().url().optional(),
});
// Client-side environment schema (prefixed with VITE_)
const clientEnvSchema = z.object({
    VITE_API_URL: z.string().url().default('http://localhost:3001'),
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1),
});
// Validation function for server environment
export function validateServerEnv() {
    const result = serverEnvSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Invalid environment variables:', result.error.format());
        throw new Error('Invalid environment variables');
    }
    return result.data;
}
// Validation function for client environment
export function validateClientEnv() {
    try {
        return clientEnvSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
            throw new Error(`Missing or invalid client environment variables: ${missingVars}`);
        }
        throw error;
    }
}
// Centralized environment configuration
let serverEnv = null;
let clientEnv = null;
export function getServerEnv() {
    if (!serverEnv) {
        serverEnv = validateServerEnv();
    }
    return serverEnv;
}
export function getClientEnv() {
    if (!clientEnv) {
        clientEnv = validateClientEnv();
    }
    return clientEnv;
}
// Export commonly used environment variables
export const env = {
    get isDevelopment() { return getServerEnv().NODE_ENV === 'development'; },
    get isProduction() { return getServerEnv().NODE_ENV === 'production'; },
    get isTest() { return getServerEnv().NODE_ENV === 'test'; },
    get port() { return getServerEnv().PORT; },
    get dbProvider() { return getServerEnv().DB_PROVIDER; },
    get supabaseUrl() { return getServerEnv().SUPABASE_URL; },
    get supabaseKey() { return getServerEnv().SUPABASE_ANON_KEY; },
    get jwtSecret() { return getServerEnv().JWT_SECRET; },
    get apiUrl() { return getServerEnv().API_URL; },
    get maxGuesses() { return getServerEnv().MAX_GUESSES; },
    get hintDelay() { return getServerEnv().HINT_DELAY; },
    get corsOrigin() { return getServerEnv().CORS_ORIGIN; },
    get enableMetrics() { return getServerEnv().ENABLE_METRICS; },
    get metricsPort() { return getServerEnv().METRICS_PORT; },
};
//# sourceMappingURL=env.js.map