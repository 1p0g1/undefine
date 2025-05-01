import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const LeaderboardDisplay = ({ entries, loading, error }) => {
    if (loading) {
        return _jsx("div", { children: "Loading..." });
    }
    if (error) {
        return _jsxs("div", { children: ["Error: ", error] });
    }
    if (!entries.length) {
        return _jsx("div", { children: "No entries found" });
    }
    return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full bg-white", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2", children: "Rank" }), _jsx("th", { className: "px-4 py-2", children: "Username" }), _jsx("th", { className: "px-4 py-2", children: "Score" }), _jsx("th", { className: "px-4 py-2", children: "Guesses" }), _jsx("th", { className: "px-4 py-2", children: "Time" })] }) }), _jsx("tbody", { children: entries.map((entry) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "px-4 py-2", children: entry.rank }), _jsx("td", { className: "px-4 py-2", children: entry.username }), _jsx("td", { className: "px-4 py-2", children: entry.score }), _jsx("td", { className: "px-4 py-2", children: entry.guessesUsed }), _jsxs("td", { className: "px-4 py-2", children: [Math.round(entry.timeTaken / 1000), "s"] })] }, `${entry.username}-${entry.wordId}`))) })] }) }));
};
export default LeaderboardDisplay;
