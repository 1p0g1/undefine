import type { DatabaseClient } from '../../types/shared.js';
declare function initializeDatabaseClient(): Promise<DatabaseClient>;
export declare const initDb: typeof initializeDatabaseClient;
export declare function getDb(): DatabaseClient;
export {};
