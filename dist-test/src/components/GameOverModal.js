import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DefineHints from './DefineHints.js';
import './GameOverModal.css';
const GameOverModal = ({ isOpen, wordData, isCorrect, onClose }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { className: "word-title", children: wordData.word }), onClose && (_jsx("button", { className: "modal-close", onClick: onClose, children: "\u00D7" }))] }), _jsxs("div", { className: "modal-body", children: [_jsx("p", { className: "game-result", children: isCorrect ? 'Congratulations! You got it!' : 'Better luck next time!' }), _jsx(DefineHints, { word: wordData, revealedHints: [0, 1, 2, 3, 4, 5], guessCount: 6 })] })] }) }));
};
export default GameOverModal;
//# sourceMappingURL=GameOverModal.js.map