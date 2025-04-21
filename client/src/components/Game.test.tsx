import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Game', () => {
  // Create a userEvent instance for each test
  const user = userEvent.setup();
  
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

    render(<App />);

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

    render(<App />);

    // Get the input and submit button
    const input = screen.getByPlaceholderText(/enter your guess/i);
    const submitButton = screen.getByRole('button', { name: /guess/i });

    // Type a guess and submit
    await user.type(input, 'wrong');
    await user.click(submitButton);

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

    render(<App />);

    // Submit 6 wrong guesses
    const input = screen.getByPlaceholderText(/enter your guess/i);
    const submitButton = screen.getByRole('button', { name: /guess/i });

    for (let i = 0; i < 6; i++) {
      await user.type(input, 'wrong');
      await user.click(submitButton);
      await user.clear(input);
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

    render(<App />);

    // Submit correct guess
    const input = screen.getByPlaceholderText(/enter your guess/i);
    const submitButton = screen.getByRole('button', { name: /guess/i });

    await user.type(input, 'test');
    await user.click(submitButton);

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
        etymology: 'Test etymology',
        firstLetter: 't',
        isPlural: false,
        numSyllables: 3,
        exampleSentence: 'This is a test sentence.'
      })
    });

    render(<App />);

    // Check that hints are revealed in the correct order
    const synonymsHint = screen.getByRole('button', { name: /synonyms/i });
    expect(synonymsHint).toBeInTheDocument();
    await user.click(synonymsHint);
    expect(screen.getByText(/test1, test2/i)).toBeInTheDocument();

    const firstLetterHint = screen.getByRole('button', { name: /first letter/i });
    expect(firstLetterHint).toBeInTheDocument();
    await user.click(firstLetterHint);
    expect(screen.getByText(/T/i)).toBeInTheDocument();

    const exampleHint = screen.getByRole('button', { name: /example/i });
    expect(exampleHint).toBeInTheDocument();
    await user.click(exampleHint);
    expect(screen.getByText(/test in a sentence/i)).toBeInTheDocument();

    const letterCountHint = screen.getByRole('button', { name: /letter count/i });
    expect(letterCountHint).toBeInTheDocument();
    await user.click(letterCountHint);
    expect(screen.getByText(/4/i)).toBeInTheDocument();

    const etymologyHint = screen.getByRole('button', { name: /etymology/i });
    expect(etymologyHint).toBeInTheDocument();
    await user.click(etymologyHint);
    expect(screen.getByText(/test etymology/i)).toBeInTheDocument();
  });
}); 