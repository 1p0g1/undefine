import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Leaderboard from './Leaderboard';
// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;
describe('Leaderboard', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
    });
    it('renders the leaderboard interface', () => {
        render(_jsx(Leaderboard, {}));
        // Check for essential UI elements
        expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
        expect(screen.getByText(/daily/i)).toBeInTheDocument();
        expect(screen.getByText(/all time/i)).toBeInTheDocument();
    });
    it('displays daily leaderboard entries', async () => {
        // Mock the leaderboard data
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({
                entries: [
                    { username: 'user1', score: 100, rank: 1 },
                    { username: 'user2', score: 90, rank: 2 },
                    { username: 'user3', score: 80, rank: 3 }
                ],
                userStats: {
                    username: 'user1',
                    score: 100,
                    rank: 1,
                    streak: 5,
                    totalGames: 10,
                    winRate: 0.8
                }
            })
        });
        render(_jsx(Leaderboard, {}));
        // Wait for the data to load
        await waitFor(() => {
            expect(screen.getByText('user1')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });
    it('displays all-time leaderboard entries', async () => {
        // Mock the leaderboard data
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({
                entries: [
                    { username: 'user1', score: 1000, rank: 1 },
                    { username: 'user2', score: 900, rank: 2 },
                    { username: 'user3', score: 800, rank: 3 }
                ],
                userStats: {
                    username: 'user1',
                    score: 1000,
                    rank: 1,
                    streak: 5,
                    totalGames: 10,
                    winRate: 0.8
                }
            })
        });
        render(_jsx(Leaderboard, {}));
        // Click the "All Time" tab
        const allTimeTab = screen.getByText(/all time/i);
        allTimeTab.click();
        // Wait for the data to load
        await waitFor(() => {
            expect(screen.getByText('user1')).toBeInTheDocument();
            expect(screen.getByText('1000')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });
    it('displays user stats when available', async () => {
        // Mock the leaderboard data with user stats
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({
                entries: [
                    { username: 'user1', score: 100, rank: 1 }
                ],
                userStats: {
                    username: 'user1',
                    score: 100,
                    rank: 1,
                    streak: 5,
                    totalGames: 10,
                    winRate: 0.8
                }
            })
        });
        render(_jsx(Leaderboard, {}));
        // Wait for the user stats to load
        await waitFor(() => {
            expect(screen.getByText(/your stats/i)).toBeInTheDocument();
            expect(screen.getByText(/5/i)).toBeInTheDocument(); // streak
            expect(screen.getByText(/10/i)).toBeInTheDocument(); // total games
            expect(screen.getByText(/80%/i)).toBeInTheDocument(); // win rate
        });
    });
    it('handles loading state', () => {
        render(_jsx(Leaderboard, {}));
        // Check for loading indicator
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
    it('handles error state', async () => {
        // Mock a failed fetch
        mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
        render(_jsx(Leaderboard, {}));
        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });
});
