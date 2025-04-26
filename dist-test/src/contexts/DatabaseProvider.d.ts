import React from 'react';
import { DatabaseClient } from '../config/database/index.js';
interface DatabaseContextType {
    db: DatabaseClient;
}
export declare function DatabaseProvider({ children, client }: {
    children: React.ReactNode;
    client: DatabaseClient;
}): import("react/jsx-runtime").JSX.Element;
export declare function useDatabase(): DatabaseContextType;
export {};
//# sourceMappingURL=DatabaseProvider.d.ts.map