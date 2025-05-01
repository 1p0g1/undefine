import { useEffect, useCallback, useState } from 'react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage.js';
/**
 * Returns whether keyboard shortcuts are enabled
 */
export const getKeyboardShortcutsEnabled = () => {
    return getFromStorage(STORAGE_KEYS.KEYBOARD_SHORTCUTS_ENABLED, true);
};
/**
 * Sets the keyboard shortcuts enabled state
 */
export const setKeyboardShortcutsEnabled = (enabled) => {
    saveToStorage(STORAGE_KEYS.KEYBOARD_SHORTCUTS_ENABLED, enabled);
};
/**
 * Hook to handle keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts, contextActive = true) => {
    const [helpVisible, setHelpVisible] = useState(false);
    const shortcutsEnabled = getKeyboardShortcutsEnabled();
    const handleKeyDown = useCallback((event) => {
        // Skip if shortcuts are disabled or context is not active
        if (!shortcutsEnabled || !contextActive) {
            return;
        }
        // First check if help modal shortcut (?) is pressed
        if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            setHelpVisible(prev => !prev);
            return;
        }
        // Handle help modal escape
        if (event.key === 'Escape' && helpVisible) {
            event.preventDefault();
            setHelpVisible(false);
            return;
        }
        // If help is visible, don't process other shortcuts
        if (helpVisible) {
            return;
        }
        // Process all shortcut categories
        const allShortcuts = [
            ...(shortcuts.global || []),
            ...(shortcuts.form || []),
            ...(shortcuts.table || [])
        ];
        for (const shortcut of allShortcuts) {
            const keyMatch = shortcut.key
                .toLowerCase()
                .split('+')
                .every(k => {
                if (k === 'ctrl')
                    return event.ctrlKey;
                if (k === 'alt')
                    return event.altKey;
                if (k === 'shift')
                    return event.shiftKey;
                if (k === 'meta')
                    return event.metaKey;
                return event.key.toLowerCase() === k;
            });
            if (keyMatch) {
                event.preventDefault();
                shortcut.action();
                return;
            }
        }
    }, [shortcuts, helpVisible, contextActive, shortcutsEnabled]);
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    // Return help modal state control
    return {
        helpVisible,
        setHelpVisible,
        shortcutsEnabled,
        toggleShortcutsEnabled: () => {
            const newValue = !shortcutsEnabled;
            setKeyboardShortcutsEnabled(newValue);
            // Force a reload to reflect new settings
            window.location.reload();
        }
    };
};
/**
 * Default keyboard shortcuts for the admin panel
 */
export const DEFAULT_SHORTCUTS = {
    global: [
        { key: '?', description: 'Show keyboard shortcuts', action: () => { } },
        { key: 'n', description: 'Add new word', action: () => { } },
        { key: 'Escape', description: 'Close modal / Cancel form', action: () => { } },
        { key: '/', description: 'Focus search box', action: () => { } }
    ],
    form: [
        { key: 'Ctrl+Enter', description: 'Save form', action: () => { } },
        { key: 'Tab', description: 'Navigate between fields', action: () => { } }
    ],
    table: [
        { key: 'j', description: 'Navigate to next row', action: () => { } },
        { key: 'k', description: 'Navigate to previous row', action: () => { } },
        { key: 'e', description: 'Edit selected row', action: () => { } },
        { key: 'Delete', description: 'Delete selected row', action: () => { } },
        { key: 'Space', description: 'Select/deselect row', action: () => { } },
        { key: 'Ctrl+a', description: 'Select all rows', action: () => { } }
    ]
};
export default useKeyboardShortcuts;
