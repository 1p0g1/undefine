import { useEffect, useCallback } from 'react';
/**
 * Custom hook for handling keyboard shortcuts
 * @param shortcuts The shortcuts to register
 * @param enabled Whether the keyboard shortcuts are enabled
 * @returns Object containing a method to get all shortcuts
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
    const handleKeyDown = useCallback((event) => {
        if (!enabled)
            return;
        const { key, altKey, ctrlKey, metaKey, shiftKey, target } = event;
        // Don't trigger shortcuts if the user is typing in an input/textarea/etc.
        if (target instanceof HTMLElement &&
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) &&
            // Allow Escape key in input fields
            key !== 'Escape') {
            return;
        }
        for (const shortcut of shortcuts) {
            if (shortcut.disabled)
                continue;
            // Check if this shortcut matches the key event
            const keyMatches = shortcut.key.toLowerCase() === key.toLowerCase();
            const altMatches = !shortcut.altKey === !altKey;
            const ctrlMatches = !shortcut.ctrlKey === !ctrlKey;
            const metaMatches = !shortcut.metaKey === !metaKey;
            const shiftMatches = !shortcut.shiftKey === !shiftKey;
            if (keyMatches &&
                altMatches &&
                ctrlMatches &&
                metaMatches &&
                shiftMatches) {
                event.preventDefault();
                shortcut.handler();
                return;
            }
        }
    }, [shortcuts, enabled]);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    // Method to get all shortcuts by category
    const getShortcutsByCategory = useCallback(() => {
        const categorized = {};
        shortcuts.forEach(({ handler, ...shortcut }) => {
            const category = shortcut.category || 'global';
            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(shortcut);
        });
        return categorized;
    }, [shortcuts]);
    // Format a single shortcut for display
    const formatShortcut = useCallback((shortcut) => {
        const parts = [];
        if (shortcut.ctrlKey)
            parts.push('Ctrl');
        if (shortcut.altKey)
            parts.push('Alt');
        if (shortcut.shiftKey)
            parts.push('Shift');
        if (shortcut.metaKey)
            parts.push('⌘');
        // Format the key name to be more readable
        let keyName = shortcut.key;
        // Handle special keys
        if (keyName === ' ')
            keyName = 'Space';
        else if (keyName === 'ArrowUp')
            keyName = '↑';
        else if (keyName === 'ArrowDown')
            keyName = '↓';
        else if (keyName === 'ArrowLeft')
            keyName = '←';
        else if (keyName === 'ArrowRight')
            keyName = '→';
        else if (keyName.length === 1)
            keyName = keyName.toUpperCase();
        parts.push(keyName);
        return parts.join(' + ');
    }, []);
    return {
        getShortcutsByCategory,
        formatShortcut
    };
};
export default useKeyboardShortcuts;
