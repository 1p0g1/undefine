import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const GameTimer = ({ time, isRunning, onStart, onStop, onReset }) => {
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    return (_jsxs("div", { className: "flex items-center gap-4 p-4", children: [_jsx("div", { className: "text-2xl font-bold", children: formatTime(time) }), _jsxs("div", { className: "flex gap-2", children: [isRunning ? (_jsx("button", { onClick: onStop, className: "px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600", children: "Stop" })) : (_jsx("button", { onClick: onStart, className: "px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600", children: "Start" })), _jsx("button", { onClick: onReset, className: "px-4 py-2 text-gray-600 hover:text-gray-800", children: "Reset" })] })] }));
};
