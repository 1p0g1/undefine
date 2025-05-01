import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const GameControls = ({ onHint, onSkip, hintAvailable, skipAvailable }) => {
    return (_jsxs("div", { className: "flex gap-4 p-4", children: [_jsx("button", { onClick: onHint, disabled: !hintAvailable, className: "px-4 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50", children: "Get Hint" }), _jsx("button", { onClick: onSkip, disabled: !skipAvailable, className: "px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50", children: "Skip Word" })] }));
};
