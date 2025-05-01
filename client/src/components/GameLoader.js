import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import LoadingSpinner from './LoadingSpinner.js';
const GameLoader = ({ onRetry, error, onRandomWord }) => {
    // Use import.meta.env for Vite projects instead of process.env
    const isDevelopment = import.meta.env.DEV;
    return (_jsx("div", { className: "app-container", children: _jsxs("div", { className: "loading-content", children: [!error && _jsx(LoadingSpinner, {}), _jsx("p", { className: "loading-text", children: error ? 'Connection Error' : 'Loading game session...' }), error && (_jsxs(_Fragment, { children: [_jsx("p", { className: "error-text", children: error }), _jsx("button", { className: "retry-button", onClick: onRetry, children: "Retry Connection" })] })), isDevelopment && onRandomWord && (_jsxs("div", { className: "testing-buttons", style: { marginTop: '20px' }, children: [_jsx("p", { className: "dev-mode-text", style: { fontSize: '0.8em', color: '#888', marginBottom: '10px' }, children: "Developer Testing Tools" }), _jsx("button", { className: "random-word-button", onClick: onRandomWord, style: {
                                background: '#5c6bc0',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, children: "\uD83C\uDFB2 Test with Random Word" })] }))] }) }));
};
export default GameLoader;
