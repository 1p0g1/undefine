import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './GameOverModal.css';
const GameOverModal = ({ isOpen, onClose, isCorrect, wordData, correctWord, guessCount, timeTaken, onPlayAgain }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsx("h2", { children: isCorrect ? 'Congratulations!' : 'Game Over' }), _jsx("p", { children: isCorrect
                        ? `You won in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`
                        : `The word was: ${correctWord}` }), _jsxs("p", { children: ["Time taken: ", timeTaken, " seconds"] }), _jsxs("div", { className: "modal-buttons", children: [_jsx("button", { onClick: onPlayAgain, children: "Play Again" }), _jsx("button", { onClick: onClose, children: "Close" })] })] }) }));
};
export default GameOverModal;
