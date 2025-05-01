import { useState, useCallback, useRef } from 'react';
/**
 * Custom hook for undo/redo functionality
 * @param initialState Initial state
 * @param maxHistorySize Maximum number of history states to store
 * @returns State and methods to manipulate it with undo/redo
 */
export const useUndoRedo = (initialState, maxHistorySize = 100) => {
    // Current state
    const [state, setState] = useState(initialState);
    // History of states for undo
    const past = useRef([]);
    // Future states for redo
    const future = useRef([]);
    // Flag to prevent history recording during undo/redo
    const skipRecord = useRef(false);
    // Update state and record history
    const set = useCallback((newState) => {
        setState(currentState => {
            // Calculate the new state
            const nextState = typeof newState === 'function'
                ? newState(currentState)
                : newState;
            // Only record history if the state has changed and we're not in the middle of undo/redo
            if (!skipRecord.current && JSON.stringify(currentState) !== JSON.stringify(nextState)) {
                // Add current state to past
                past.current = [...past.current, currentState].slice(-maxHistorySize);
                // Clear future since we're creating a new history branch
                future.current = [];
            }
            // Reset skip flag
            skipRecord.current = false;
            return nextState;
        });
    }, [maxHistorySize]);
    // Undo the last change
    const undo = useCallback(() => {
        if (past.current.length === 0)
            return false;
        // Get the last state from past
        const previous = past.current[past.current.length - 1];
        // Remove the last state from past
        past.current = past.current.slice(0, -1);
        // Add current state to future
        future.current = [state, ...future.current];
        // Set flag to prevent recording this change in history
        skipRecord.current = true;
        // Update state to the previous one
        setState(previous);
        return true;
    }, [state]);
    // Redo the last undone change
    const redo = useCallback(() => {
        if (future.current.length === 0)
            return false;
        // Get the first state from future
        const next = future.current[0];
        // Remove the first state from future
        future.current = future.current.slice(1);
        // Add current state to past
        past.current = [...past.current, state];
        // Set flag to prevent recording this change in history
        skipRecord.current = true;
        // Update state to the next one
        setState(next);
        return true;
    }, [state]);
    // Clear history
    const clearHistory = useCallback(() => {
        past.current = [];
        future.current = [];
    }, []);
    // Reset state to initial and clear history
    const reset = useCallback(() => {
        past.current = [];
        future.current = [];
        setState(initialState);
    }, [initialState]);
    return {
        state,
        set,
        undo,
        redo,
        clearHistory,
        reset,
        canUndo: past.current.length > 0,
        canRedo: future.current.length > 0
    };
};
export default useUndoRedo;
