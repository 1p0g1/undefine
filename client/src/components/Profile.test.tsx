import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profile } from './Profile';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Profile', () => {
  // Create a userEvent instance for each test
  const user = userEvent.setup();
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    score: 100,
    rank: 1,
    streak: 5,
    totalGames: 10,
    winRate: 0.8
  };

  it('renders the profile interface', () => {
    render(<Profile user={mockUser} onClose={() => {}} />);

    // Check for essential UI elements
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('handles profile update', async () => {
    const mockOnClose = vi.fn();
    render(<Profile user={mockUser} onClose={mockOnClose} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'updated@example.com');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('validates email format during update', async () => {
    render(<Profile user={mockUser} />);

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Enter invalid email
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'invalid-email');

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Check for validation message
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('handles loading state during update', async () => {
    render(<Profile user={mockUser} />);

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Update email
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'updated@example.com');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Check for loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('handles network errors during update', async () => {
    render(<Profile user={mockUser} />);

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Update email
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'updated@example.com');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('handles server errors during update', async () => {
    render(<Profile user={mockUser} />);

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Update email
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'updated@example.com');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
    });
  });

  it('displays game history', async () => {
    // Mock game history data
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        games: [
          { date: '2024-03-20', word: 'test', score: 100, isWin: true },
          { date: '2024-03-19', word: 'word', score: 80, isWin: false }
        ]
      })
    });

    render(<Profile user={mockUser} />);

    // Wait for game history to load
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('word')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
    });
  });
}); 