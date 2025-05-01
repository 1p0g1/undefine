import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Stats } from './Stats';

describe('Stats', () => {
  const mockStats = {
    gamesPlayed: 10,
    gamesWon: 8,
    averageGuesses: 3.5,
    averageTime: 60000, // 60 seconds
    currentStreak: 5,
    longestStreak: 7
  };

  const defaultProps = {
    ...mockStats,
    onClose: () => {}
  };

  it('renders statistics correctly', () => {
    render(<Stats {...defaultProps} />);
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // gamesPlayed
    expect(screen.getByText('80%')).toBeInTheDocument(); // winRate
    expect(screen.getByText('3.5')).toBeInTheDocument(); // averageGuesses
    expect(screen.getByText('60s')).toBeInTheDocument(); // averageTime
    expect(screen.getByText('5')).toBeInTheDocument(); // currentStreak
    expect(screen.getByText('7')).toBeInTheDocument(); // longestStreak
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Stats {...mockStats} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles zero games played', () => {
    const emptyStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      averageGuesses: 0,
      averageTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      onClose: () => {}
    };
    render(<Stats {...emptyStats} />);
    expect(screen.getByText('0%')).toBeInTheDocument(); // winRate
  });
}); 