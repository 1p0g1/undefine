type KeyboardShortcut = {
    key: string;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    handler: () => void;
    description: string;
    disabled?: boolean;
    category?: string;
};
/**
 * Custom hook for handling keyboard shortcuts
 * @param shortcuts The shortcuts to register
 * @param enabled Whether the keyboard shortcuts are enabled
 * @returns Object containing a method to get all shortcuts
 */
export declare const useKeyboardShortcuts: (shortcuts: KeyboardShortcut[], enabled?: boolean) => {
    getShortcutsByCategory: () => Record<string, Omit<KeyboardShortcut, "handler">[]>;
    formatShortcut: (shortcut: Omit<KeyboardShortcut, "handler">) => string;
};
export default useKeyboardShortcuts;
