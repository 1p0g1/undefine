import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from './Profile';
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
    it('renders the profile interface', () => {
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            score: 100,
            rank: 5,
            streak: 3,
            totalGames: 10,
            winRate: 0.8
        };
        render(_jsx(Profile, { user: user }));
        // Check for essential UI elements
        expect(screen.getByText(/profile/i)).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('80%')).toBeInTheDocument();
    });
    it('handles profile update', async () => {
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            score: 100,
            rank: 5,
            streak: 3,
            totalGames: 10,
            winRate: 0.8
        };
        const onUpdateSuccess = vi.fn();
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({
                user: {
                    ...user,
                    email: 'updated@example.com'
                }
            })
        });
        render(_jsx(Profile, { user: user, onUpdateSuccess: onUpdateSuccess }));
        // Click edit button
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        await user.click(editButton);
        // Update email
        const emailInput = screen.getByPlaceholderText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, 'updated@example.com');
        // Save changes
        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);
        // Verify the update request
        expect(mockFetch).toHaveBeenCalledWith('/api/profile', expect.any(Object));
        // Wait for success callback
        await waitFor(() => {
            expect(onUpdateSuccess).toHaveBeenCalledWith({
                user: {
                    ...user,
                    email: 'updated@example.com'
                }
            });
        });
    });
    it('validates email format during update', async () => {
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            score: 100,
            rank: 5,
            streak: 3,
            totalGames: 10,
            winRate: 0.8
        };
        render(_jsx(Profile, { user: user }));
        // Click edit button
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        await user.click(editButton);
        // Enter invalid email
        const emailInput = screen.getByPlaceholderText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, 'invalid-email');
        // Try to save
        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);
        // Check for validation message
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
    it('handles loading state during update', async () => {
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            score: 100,
            rank: 5,
            streak: 3,
            totalGames: 10,
            winRate: 0.8
        };
        mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(_jsx(Profile, { user: user }));
        // Click edit button
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        await user.click(editButton);
        // Update email
        const emailInput = screen.getByPlaceholderText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, 'updated@example.com');
        // Save changes
        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);
        // Check for loading state
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
    it('handles network errors during update', async () => {
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            score: 100,
            rank: 5,
            streak: 3,
            totalGames: 10,
            winRate: 0.8
        };
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        render(_jsx(Profile, { user: user }));
        // Click edit button
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        await user.click(editButton);
        // Update email
        const emailInput = screen.getByPlaceholderText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, 'updated@example.com');
        // Save changes
        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);
        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });
    });
    it('handles server errors during update', async () => {
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            score: 100,
            rank: 5,
            streak: 3,
            totalGames: 10,
            winRate: 0.8
        };
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: 'Internal server error' })
        });
        render(_jsx(Profile, { user: user }));
        // Click edit button
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        await user.click(editButton);
        // Update email
        const emailInput = screen.getByPlaceholderText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, 'updated@example.com');
        // Save changes
        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);
        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
        });
    });
    it('displays game history', async () => {
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            score: 100,
            rank: 5,
            streak: 3,
            totalGames: 10,
            winRate: 0.8
        };
        // Mock game history data
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({
                games: [
                    { date: '2024-03-20', word: 'test', score: 100, isWin: true },
                    { date: '2024-03-19', word: 'word', score: 80, isWin: false }
                ]
            })
        });
        render(_jsx(Profile, { user: user }));
        // Wait for game history to load
        await waitFor(() => {
            expect(screen.getByText('test')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('word')).toBeInTheDocument();
            expect(screen.getByText('80')).toBeInTheDocument();
        });
    });
});
