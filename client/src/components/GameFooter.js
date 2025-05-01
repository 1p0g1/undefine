import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const GameFooter = ({ onNewGame, onShare }) => {
    return (_jsxs("footer", { className: "flex items-center justify-between p-4 bg-white shadow", children: [_jsx("button", { onClick: onNewGame, className: "px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600", children: "New Game" }), _jsx("button", { onClick: onShare, className: "px-4 py-2 text-gray-600 hover:text-gray-800", children: "Share" })] }));
};
