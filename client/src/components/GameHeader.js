import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const GameHeader = ({ onSettingsClick, onHowToPlayClick, onStatsClick }) => {
    return (_jsxs("header", { className: "flex items-center justify-between p-4 bg-white shadow", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "Un-Define" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: onHowToPlayClick, className: "px-4 py-2 text-gray-600 hover:text-gray-800", children: "How to Play" }), _jsx("button", { onClick: onStatsClick, className: "px-4 py-2 text-gray-600 hover:text-gray-800", children: "Stats" }), _jsx("button", { onClick: onSettingsClick, className: "px-4 py-2 text-gray-600 hover:text-gray-800", children: "Settings" })] })] }));
};
