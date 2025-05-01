import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { DEBUG_CONFIG } from '../config/debug.js';
import './HintContent.css';
const HintContent = ({ wordData, revealedHints, onHintReveal, isGameOver, isCorrect, guessCount, guessResults, }) => {
    useEffect(() => {
        if (DEBUG_CONFIG.verboseLogging) {
            console.log('HintContent mounted with:', {
                wordData,
                revealedHints,
                isGameOver
            });
        }
    }, [wordData, revealedHints, isGameOver]);
    useEffect(() => {
        if (isGameOver) {
            // Reveal all hints when game is over
            revealedHints.forEach(hint => onHintReveal(hint));
        }
    }, [isGameOver, revealedHints, onHintReveal]);
    if (!wordData) {
        return _jsx("div", { className: "error", children: "Error: Invalid word data" });
    }
    return (_jsx("div", { className: "hints-container", children: _jsxs("div", { className: "hints-content", children: [_jsxs("p", { className: `definition-entry ${revealedHints.includes(0) ? 'visible' : ''}`, children: [_jsx("strong", { children: "Definition:" }), " ", wordData.D] }), _jsxs("p", { className: `etymology-entry ${revealedHints.includes(1) ? 'visible' : ''}`, children: [_jsx("strong", { children: "Etymology:" }), " ", wordData.E] }), _jsxs("p", { className: `first-letter-entry ${revealedHints.includes(2) ? 'visible' : ''}`, children: [_jsx("strong", { children: "First Letter:" }), " ", wordData.F] }), _jsxs("p", { className: `example-entry ${revealedHints.includes(3) ? 'visible' : ''}`, children: [_jsx("strong", { children: "Example:" }), " ", wordData.I] }), _jsxs("p", { className: `letter-count-entry ${revealedHints.includes(4) ? 'visible' : ''}`, children: [_jsx("strong", { children: "Letter Count:" }), " ", wordData.N] }), _jsxs("p", { className: `synonyms-entry ${revealedHints.includes(5) ? 'visible' : ''}`, children: [_jsx("strong", { children: "Synonyms:" }), " ", wordData.E2] })] }) }));
};
export default HintContent;
