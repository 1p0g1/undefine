import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HINT_INDICES } from '@undefine/shared-types';
const DefineBoxes = ({ revealedHints, onHintReveal, isGameOver, isCorrect, guessCount, guessResults, }) => {
    const defineLetters = Object.values(HINT_INDICES);
    return (_jsxs("div", { className: "define-boxes-container", children: [_jsx("span", { className: "un-prefix", children: "Un \u00B7" }), _jsx("div", { className: "define-boxes", children: defineLetters.map((letter, index) => {
                    let boxClass = 'define-box';
                    // Only highlight the correct box for the winning guess
                    if (isCorrect && index === guessResults.length - 1) {
                        boxClass += ' correct';
                    }
                    // Show incorrect for past guesses
                    else if (index < guessResults.length) {
                        boxClass += ' incorrect';
                    }
                    // Show hint revealed state for current guess
                    else if (index === guessResults.length && revealedHints.includes(letter)) {
                        boxClass += ' hint-revealed';
                    }
                    return (_jsx("div", { className: boxClass, onClick: () => onHintReveal(letter), children: Object.keys(HINT_INDICES)[letter] }, letter));
                }) })] }));
};
export default DefineBoxes;
