import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const GameSummary = ({ wordData, isGameOver }) => {
    if (!wordData || !isGameOver)
        return null;
    return (_jsxs("div", { className: "hints-container game-summary", children: [_jsx("h2", { className: "word-title", children: wordData.word }), _jsxs("div", { className: "game-summary-content", children: [_jsxs("p", { className: "definition-entry visible", children: [_jsx("strong", { children: "Definition:" }), " ", wordData.clues.D] }), _jsxs("p", { className: "synonyms-entry visible", children: [_jsx("strong", { children: "Synonyms:" }), " ", wordData.clues.E2] }), _jsxs("p", { className: "first-letter-entry visible", children: [_jsx("strong", { children: "First Letter:" }), " ", wordData.clues.F] }), _jsxs("p", { className: "example-entry visible", children: [_jsx("strong", { children: "Example:" }), " ", wordData.clues.I] }), _jsxs("p", { className: "letter-count-entry visible", children: [_jsx("strong", { children: "Letter Count:" }), " ", wordData.clues.N] }), _jsxs("p", { className: "etymology-entry visible", children: [_jsx("strong", { children: "Etymology:" }), " ", wordData.clues.E] })] })] }));
};
export default GameSummary;
