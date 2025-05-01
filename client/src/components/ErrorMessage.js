import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ErrorMessage = ({ message, onRetry }) => {
    return (_jsxs("div", { className: "error-message", children: [_jsx("p", { children: message }), _jsx("button", { onClick: onRetry, className: "retry-button", children: "Try Again" })] }));
};
export default ErrorMessage;
