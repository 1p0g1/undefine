import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;
describe('App', () => {
    // Create a userEvent instance for each test
    const user = userEvent.setup();
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
        };
        global.localStorage = localStorageMock;
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
        render(_jsx(App, {}));
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
        render(_jsx(App, {}));
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
        render(_jsx(App, {}));
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
        render(_jsx(App, {}));
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
        render(_jsx(App, {}));
        // Find and click hint buttons
        const etymologyHint = screen.getByRole('button', { name: /etymology/i });
        const firstLetterHint = screen.getByRole('button', { name: /first letter/i });
        const pluralHint = screen.getByRole('button', { name: /plural/i });
        await user.click(etymologyHint);
        await user.click(firstLetterHint);
        await user.click(pluralHint);
        // Verify hints are displayed
        expect(screen.getByText(/test etymology/i)).toBeInTheDocument();
        expect(screen.getByText(/first letter: t/i)).toBeInTheDocument();
        expect(screen.getByText(/this word is singular/i)).toBeInTheDocument();
    });
});
