/**
 * Custom hook for undo/redo functionality
 * @param initialState Initial state
 * @param maxHistorySize Maximum number of history states to store
 * @returns State and methods to manipulate it with undo/redo
 */
export declare const useUndoRedo: <T>(initialState: T, maxHistorySize?: number) => {
    state: T;
    set: (newState: T | ((prevState: T) => T)) => void;
    undo: () => boolean;
    redo: () => boolean;
    clearHistory: () => void;
    reset: () => void;
    canUndo: boolean;
    canRedo: boolean;
};
export default useUndoRedo;
