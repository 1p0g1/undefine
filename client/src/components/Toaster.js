import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Toaster = ({ messages, onDismiss }) => {
    return (_jsx("div", { className: "fixed bottom-4 right-4 space-y-2", children: messages.map((message, index) => (_jsx("div", { className: `p-4 rounded-lg shadow ${message.type === 'success'
                ? 'bg-green-500'
                : message.type === 'error'
                    ? 'bg-red-500'
                    : message.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'} text-white`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { children: message.text }), _jsx("button", { onClick: () => onDismiss(message), className: "ml-4 text-white hover:text-gray-200", children: "\u00D7" })] }) }, index))) }));
};
