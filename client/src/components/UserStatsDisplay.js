import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const UserStatsDisplay = ({ stats, loading }) => {
    if (loading) {
        return _jsx("div", { className: "p-4", children: "Loading stats..." });
    }
    if (!stats) {
        return _jsx("div", { className: "p-4", children: "No stats available" });
    }
    return (_jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Your Stats" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Games Played" }), _jsx("p", { className: "text-2xl font-bold", children: stats.gamesPlayed })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Games Won" }), _jsx("p", { className: "text-2xl font-bold", children: stats.gamesWon })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Win Rate" }), _jsxs("p", { className: "text-2xl font-bold", children: [((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1), "%"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Average Guesses" }), _jsx("p", { className: "text-2xl font-bold", children: stats.averageGuesses.toFixed(1) })] })] })] }));
};
