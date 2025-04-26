import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import './DefineHints.css';
const DefineHints = ({ word, revealedHints, guessCount, onSynonymClick, isLoading = false }) => {
    if (isLoading) {
        return (_jsxs("div", { className: "define-hints loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("div", { className: "loading-text", children: "Loading hints..." })] }));
    }
    const renderHint = (index) => {
        switch (index) {
            case 0: // Definition
                return (_jsxs("div", { className: "hint-box", children: [_jsx("div", { className: "hint-label", children: "Definition" }), _jsx("blockquote", { className: "hint-content", children: word.clues?.D || 'No definition available' })] }));
            case 1: // Equivalents (E2)
                return (_jsxs("div", { className: "hint-box", children: [_jsx("div", { className: "hint-label", children: "Synonyms" }), _jsx("div", { className: "hint-content synonyms-list", children: (word.clues?.E2 ?? []).length > 0 ? ((word.clues?.E2 ?? []).map((synonym, i) => (_jsx("span", { className: "synonym-tag", onClick: () => onSynonymClick?.(synonym), children: synonym }, i)))) : (_jsx("span", { className: "no-synonyms", children: "No synonyms available" })) })] }));
            case 2: // First Letter
                return (_jsxs("div", { className: "hint-box", children: [_jsx("div", { className: "hint-label", children: "First Letter" }), _jsx("blockquote", { className: "hint-content", children: word.clues?.F || 'No first letter available' })] }));
            case 3: // In a Sentence
                return (_jsxs("div", { className: "hint-box", children: [_jsx("div", { className: "hint-label", children: "Example" }), _jsx("blockquote", { className: "hint-content", children: word.clues?.I || 'No example available' })] }));
            case 4: // Number of Letters
                return (_jsxs("div", { className: "hint-box", children: [_jsx("div", { className: "hint-label", children: "Letter Count" }), _jsx("blockquote", { className: "hint-content", children: word.clues?.N || 'No letter count available' })] }));
            case 5: // Etymology
                return (_jsxs("div", { className: "hint-box", children: [_jsx("div", { className: "hint-label", children: "Etymology" }), _jsx("blockquote", { className: "hint-content etymology-text", children: word.clues?.E || 'No etymology available' })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "define-hints", children: [[0, 1, 2, 3, 4, 5].map(type => (_jsx(React.Fragment, { children: renderHint(type) }, `hint-type-${type}`))), _jsxs("div", { className: "guesses-remaining", children: ["Guesses remaining: ", 6 - guessCount] })] }));
};
export default DefineHints;
//# sourceMappingURL=DefineHints.js.map