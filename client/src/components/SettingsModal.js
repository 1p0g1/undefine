import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const SettingsModal = ({ isOpen, onClose, onThemeChange, onSoundToggle, onDifficultyChange, currentTheme, soundEnabled, currentDifficulty }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white p-6 rounded-lg max-w-2xl w-full mx-4", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Settings" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Theme" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => onThemeChange('light'), className: `px-4 py-2 rounded-lg ${currentTheme === 'light'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-800'}`, children: "Light" }), _jsx("button", { onClick: () => onThemeChange('dark'), className: `px-4 py-2 rounded-lg ${currentTheme === 'dark'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-800'}`, children: "Dark" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Sound" }), _jsx("button", { onClick: () => onSoundToggle(!soundEnabled), className: `px-4 py-2 rounded-lg ${soundEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`, children: soundEnabled ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Difficulty" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => onDifficultyChange('easy'), className: `px-4 py-2 rounded-lg ${currentDifficulty === 'easy'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-800'}`, children: "Easy" }), _jsx("button", { onClick: () => onDifficultyChange('medium'), className: `px-4 py-2 rounded-lg ${currentDifficulty === 'medium'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-800'}`, children: "Medium" }), _jsx("button", { onClick: () => onDifficultyChange('hard'), className: `px-4 py-2 rounded-lg ${currentDifficulty === 'hard'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-800'}`, children: "Hard" })] })] })] }), _jsx("button", { onClick: onClose, className: "mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600", children: "Close" })] }) }));
};
