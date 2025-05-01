import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const GuessInput = ({ onGuess, disabled, maxLength = 20 }) => {
    const [guess, setGuess] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (guess.trim()) {
            onGuess(guess.trim());
            setGuess('');
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex gap-2", children: [_jsx("input", { type: "text", value: guess, onChange: (e) => setGuess(e.target.value), disabled: disabled, maxLength: maxLength, className: "flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter your guess..." }), _jsx("button", { type: "submit", disabled: disabled || !guess.trim(), className: "px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50", children: "Guess" })] }));
};
