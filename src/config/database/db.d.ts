import type { DatabaseClient } from '@undefine/shared-types';
declare function initializeDatabaseClient(): Promise<DatabaseClient>;
export declare const initDb: typeof initializeDatabaseClient;
export declare function getDb(): DatabaseClient;
export {};
