import { z } from 'zod';
declare const serverEnvSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodNumber>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    DB_PROVIDER: z.ZodDefault<z.ZodEnum<["supabase"]>>;
    SUPABASE_URL: z.ZodString;
    SUPABASE_ANON_KEY: z.ZodString;
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    JWT_SECRET: z.ZodString;
    API_URL: z.ZodDefault<z.ZodString>;
    ENABLE_METRICS: z.ZodDefault<z.ZodBoolean>;
    METRICS_PORT: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    MAX_GUESSES: z.ZodDefault<z.ZodNumber>;
    HINT_DELAY: z.ZodDefault<z.ZodNumber>;
    CORS_ORIGIN: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    PORT: number;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    NODE_ENV: "development" | "production" | "test";
    DB_PROVIDER: "supabase";
    JWT_SECRET: string;
    ENABLE_METRICS: boolean;
    API_URL: string;
    METRICS_PORT: number;
    MAX_GUESSES: number;
    HINT_DELAY: number;
    DATABASE_URL?: string | undefined;
    CORS_ORIGIN?: string | undefined;
}, {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    JWT_SECRET: string;
    PORT?: number | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    DB_PROVIDER?: "supabase" | undefined;
    ENABLE_METRICS?: boolean | undefined;
    DATABASE_URL?: string | undefined;
    API_URL?: string | undefined;
    METRICS_PORT?: string | undefined;
    MAX_GUESSES?: number | undefined;
    HINT_DELAY?: number | undefined;
    CORS_ORIGIN?: string | undefined;
}>;
declare const clientEnvSchema: z.ZodObject<{
    VITE_API_URL: z.ZodDefault<z.ZodString>;
    VITE_SUPABASE_URL: z.ZodString;
    VITE_SUPABASE_ANON_KEY: z.ZodString;
}, "strip", z.ZodTypeAny, {
    VITE_API_URL: string;
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
}, {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_API_URL?: string | undefined;
}>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export declare function validateServerEnv(): ServerEnv;
export declare function validateClientEnv(): ClientEnv;
export declare function getServerEnv(): ServerEnv;
export declare function getClientEnv(): ClientEnv;
export declare const env: {
    readonly isDevelopment: boolean;
    readonly isProduction: boolean;
    readonly isTest: boolean;
    readonly port: number;
    readonly dbProvider: "supabase";
    readonly supabaseUrl: string;
    readonly supabaseKey: string;
    readonly jwtSecret: string;
    readonly apiUrl: string;
    readonly maxGuesses: number;
    readonly hintDelay: number;
    readonly corsOrigin: string | undefined;
    readonly enableMetrics: boolean;
    readonly metricsPort: number;
};
export {};
//# sourceMappingURL=env.d.ts.map