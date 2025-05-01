import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Leaderboard = ({ entries, loading, error, onClose }) => {
    if (loading) {
        return (_jsx("div", { className: "p-4", children: _jsx("div", { className: "flex justify-center items-center p-8", children: "Loading..." }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "p-4 text-red-500", children: [_jsxs("p", { children: ["Error: ", error] }), _jsx("button", { onClick: onClose, children: "Close" })] }));
    }
    if (!entries.length) {
        return (_jsxs("div", { className: "p-4", children: [_jsx("p", { children: "No entries found" }), _jsx("button", { onClick: onClose, children: "Close" })] }));
    }
    return (_jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Leaderboard" }), _jsx("button", { onClick: onClose, children: "Close" })] }), _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Rank" }), _jsx("th", { children: "Player" }), _jsx("th", { children: "Score" }), _jsx("th", { children: "Word" }), _jsx("th", { children: "Guesses" }), _jsx("th", { children: "Time" })] }) }), _jsx("tbody", { children: entries.map((entry) => (_jsxs("tr", { children: [_jsx("td", { children: entry.rank }), _jsx("td", { children: entry.username }), _jsx("td", { children: entry.score }), _jsx("td", { children: entry.word }), _jsx("td", { children: entry.guessesUsed }), _jsxs("td", { children: [Math.round(entry.timeTaken / 1000), "s"] })] }, `${entry.username}-${entry.wordId}`))) })] })] }));
};
