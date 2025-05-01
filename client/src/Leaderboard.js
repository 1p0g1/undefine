import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, memo } from 'react';
import './Leaderboard.css';
import { getApiUrl } from './config';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const LeaderboardContent = memo(({ entries, formatTime }) => (_jsx("div", { className: "leaderboard-list", children: entries.map((entry, index) => (_jsxs("div", { className: "leaderboard-entry", children: [_jsxs("span", { className: "rank", children: ["#", index + 1] }), _jsx("span", { className: "username", children: entry.username }), _jsxs("span", { className: "score", children: [entry.guessesUsed, " guesses"] }), _jsx("span", { className: "time", children: formatTime(entry.timeTaken) })] }, `${entry.username}-${index}`))) })));
const Leaderboard = ({ isGameOver, isCorrect, correctWord, onClose }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);
    const fetchWithRetry = useCallback(async (url, retries = MAX_RETRIES) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.entries || [];
        }
        catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return fetchWithRetry(url, retries - 1);
            }
            throw error;
        }
    }, []);
    useEffect(() => {
        let mounted = true;
        let timeoutId;
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWithRetry(getApiUrl('/api/leaderboard/daily'));
                if (mounted) {
                    setEntries(data);
                }
            }
            catch (error) {
                console.error('Error fetching leaderboard:', error);
                if (mounted) {
                    setError('Failed to fetch leaderboard. Please try again later.');
                }
            }
            finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };
        if (isGameOver) {
            timeoutId = window.setTimeout(fetchLeaderboard, 0);
        }
        return () => {
            mounted = false;
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [isGameOver, fetchWithRetry]);
    if (loading) {
        return (_jsx("div", { className: "leaderboard-container", children: _jsx("div", { className: "leaderboard-loading", role: "alert", "aria-busy": "true", children: "Loading leaderboard..." }) }));
    }
    return (_jsxs("div", { className: "leaderboard-container", role: "dialog", "aria-label": "Game Over", children: [_jsx("h2", { children: "Game Over!" }), isCorrect ? (_jsx("p", { className: "success-message", role: "alert", children: "Congratulations! You found the word!" })) : (_jsxs("p", { className: "game-over-message", role: "alert", children: ["Better luck next time! The word was: ", correctWord] })), error ? (_jsxs("p", { className: "error-message", role: "alert", children: [error, _jsx("button", { onClick: () => window.location.reload(), className: "retry-button", children: "Retry" })] })) : entries.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("h3", { children: "Today's Top Players" }), _jsx(LeaderboardContent, { entries: entries, formatTime: formatTime })] })) : (_jsx("p", { className: "no-entries", children: "No entries yet - you could be the first!" })), _jsx("button", { onClick: onClose, className: "close-button", "aria-label": "Close leaderboard", children: "Close" })] }));
};
export default memo(Leaderboard);
