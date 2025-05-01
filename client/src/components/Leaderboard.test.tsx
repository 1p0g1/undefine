import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Leaderboard } from './Leaderboard';
import type { LeaderboardEntry } from '@undefine/shared-types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Leaderboard', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  const mockEntries: LeaderboardEntry[] = [
    {
      username: 'player1',
      score: 100,
      rank: 1,
      wordId: 'word1',
      word: 'test',
      timeTaken: 60000,
      guessesUsed: 3
    },
    {
      username: 'player2',
      score: 90,
      rank: 2,
      wordId: 'word2',
      word: 'test2',
      timeTaken: 70000,
      guessesUsed: 4
    }
  ];

  const mockOnClose = () => {};

  it('renders the leaderboard interface', () => {
    render(<Leaderboard />);

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

    render(<Leaderboard />);

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

    render(<Leaderboard />);

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

    render(<Leaderboard />);

    // Wait for the user stats to load
    await waitFor(() => {
      expect(screen.getByText(/your stats/i)).toBeInTheDocument();
      expect(screen.getByText(/5/i)).toBeInTheDocument(); // streak
      expect(screen.getByText(/10/i)).toBeInTheDocument(); // total games
      expect(screen.getByText(/80%/i)).toBeInTheDocument(); // win rate
    });
  });

  it('renders loading state', () => {
    render(<Leaderboard entries={[]} loading={true} error={null} onClose={mockOnClose} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const error = 'Failed to load leaderboard';
    render(<Leaderboard entries={[]} loading={false} error={error} onClose={mockOnClose} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<Leaderboard entries={[]} loading={false} error={null} onClose={mockOnClose} />);
    expect(screen.getByText(/no entries found/i)).toBeInTheDocument();
  });

  it('renders leaderboard entries', () => {
    render(<Leaderboard entries={mockEntries} loading={false} error={null} onClose={mockOnClose} />);
    expect(screen.getByText('player1')).toBeInTheDocument();
    expect(screen.getByText('player2')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Leaderboard entries={mockEntries} loading={false} error={null} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
}); 