import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Stats from './Stats';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Stats', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the stats interface', () => {
    render(<Stats />);

    // Check for essential UI elements
    expect(screen.getByText(/stats/i)).toBeInTheDocument();
    expect(screen.getByText(/daily metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/top streaks/i)).toBeInTheDocument();
  });

  it('displays daily metrics', async () => {
    // Mock the daily stats data
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        totalPlayers: 100,
        averageScore: 85,
        totalGames: 500,
        winRate: 0.75,
        topStreaks: [
          { username: 'user1', streak: 10 },
          { username: 'user2', streak: 8 },
          { username: 'user3', streak: 5 }
        ]
      })
    });

    render(<Stats />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // total players
      expect(screen.getByText('85')).toBeInTheDocument(); // average score
      expect(screen.getByText('500')).toBeInTheDocument(); // total games
      expect(screen.getByText('75%')).toBeInTheDocument(); // win rate
    });
  });

  it('displays top streaks', async () => {
    // Mock the daily stats data
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        totalPlayers: 100,
        averageScore: 85,
        totalGames: 500,
        winRate: 0.75,
        topStreaks: [
          { username: 'user1', streak: 10 },
          { username: 'user2', streak: 8 },
          { username: 'user3', streak: 5 }
        ]
      })
    });

    render(<Stats />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('user3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    render(<Stats />);

    // Check for loading indicator
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock a failed fetch
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<Stats />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no data is available', async () => {
    // Mock empty data
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        totalPlayers: 0,
        averageScore: 0,
        totalGames: 0,
        winRate: 0,
        topStreaks: []
      })
    });

    render(<Stats />);

    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });
  });
}); 