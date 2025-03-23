import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Game from './Game';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Game', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the game interface', async () => {
    // Mock the initial word fetch
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        definition: 'A test definition',
        totalGuesses: 6,
        partOfSpeech: 'noun',
        letterCount: { count: 5, display: '5 letters' }
      })
    });

    render(<Game />);

    // Check for essential UI elements
    expect(screen.getByText(/reverse define/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your guess/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guess/i })).toBeInTheDocument();
  });

  it('handles user input and guess submission', async () => {
    // Mock the initial word fetch
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        definition: 'A test definition',
        totalGuesses: 6,
        partOfSpeech: 'noun',
        letterCount: { count: 5, display: '5 letters' }
      })
    });

    // Mock the guess submission
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        isCorrect: false,
        correctWord: 'test',
        guessedWord: 'wrong',
        isFuzzy: false
      })
    });

    render(<Game />);

    // Get the input and submit button
    const input = screen.getByPlaceholderText(/enter your guess/i);
    const submitButton = screen.getByRole('button', { name: /guess/i });

    // Type a guess and submit
    await userEvent.type(input, 'wrong');
    await userEvent.click(submitButton);

    // Verify the guess was submitted
    expect(mockFetch).toHaveBeenCalledWith('/api/guess', expect.any(Object));
  });

  it('displays game over message when guesses are exhausted', async () => {
    // Mock the initial word fetch
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        definition: 'A test definition',
        totalGuesses: 6,
        partOfSpeech: 'noun',
        letterCount: { count: 5, display: '5 letters' }
      })
    });

    // Mock incorrect guesses until game over
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        isCorrect: false,
        correctWord: 'test',
        guessedWord: 'wrong',
        isFuzzy: false
      })
    });

    render(<Game />);

    // Submit 6 wrong guesses
    const input = screen.getByPlaceholderText(/enter your guess/i);
    const submitButton = screen.getByRole('button', { name: /guess/i });

    for (let i = 0; i < 6; i++) {
      await userEvent.type(input, 'wrong');
      await userEvent.click(submitButton);
      await userEvent.clear(input);
    }

    // Check for game over message
    await waitFor(() => {
      expect(screen.getByText(/game over/i)).toBeInTheDocument();
    });
  });

  it('displays success message and confetti on correct guess', async () => {
    // Mock the initial word fetch
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        definition: 'A test definition',
        totalGuesses: 6,
        partOfSpeech: 'noun',
        letterCount: { count: 5, display: '5 letters' }
      })
    });

    // Mock a correct guess
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        isCorrect: true,
        correctWord: 'test',
        guessedWord: 'test',
        isFuzzy: false,
        leaderboardRank: 1
      })
    });

    render(<Game />);

    // Submit correct guess
    const input = screen.getByPlaceholderText(/enter your guess/i);
    const submitButton = screen.getByRole('button', { name: /guess/i });

    await userEvent.type(input, 'test');
    await userEvent.click(submitButton);

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });
  });

  it('handles hint revelation', async () => {
    // Mock the initial word fetch
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        definition: 'A test definition',
        totalGuesses: 6,
        partOfSpeech: 'noun',
        letterCount: { count: 5, display: '5 letters' },
        alternateDefinition: 'Another definition',
        synonyms: ['synonym1', 'synonym2']
      })
    });

    render(<Game />);

    // Find and click hint buttons
    const letterCountHint = screen.getByRole('button', { name: /letter count/i });
    const alternateDefHint = screen.getByRole('button', { name: /alternate definition/i });
    const synonymsHint = screen.getByRole('button', { name: /synonyms/i });

    await userEvent.click(letterCountHint);
    await userEvent.click(alternateDefHint);
    await userEvent.click(synonymsHint);

    // Verify hints are displayed
    expect(screen.getByText(/5 letters/i)).toBeInTheDocument();
    expect(screen.getByText(/another definition/i)).toBeInTheDocument();
    expect(screen.getByText(/synonym1/i)).toBeInTheDocument();
  });
}); 