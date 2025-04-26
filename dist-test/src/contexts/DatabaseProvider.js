import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
const DatabaseContext = createContext({
    db: {}
});
export function DatabaseProvider({ children, client }) {
    return (_jsx(DatabaseContext.Provider, { value: { db: client }, children: children }));
}
export function useDatabase() {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
}
//# sourceMappingURL=DatabaseProvider.js.map