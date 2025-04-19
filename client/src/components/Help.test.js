import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Help from './Help';
// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;
describe('Help', () => {
    // Create a userEvent instance for each test
    const user = userEvent.setup();
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
    });
    it('renders the help interface', () => {
        render(_jsx(Help, {}));
        // Check for essential UI elements
        expect(screen.getByText(/help/i)).toBeInTheDocument();
        expect(screen.getByText(/how to play/i)).toBeInTheDocument();
        expect(screen.getByText(/faq/i)).toBeInTheDocument();
        expect(screen.getByText(/contact/i)).toBeInTheDocument();
    });
    it('displays how to play section', () => {
        render(_jsx(Help, {}));
        // Check for how to play content
        expect(screen.getByText(/how to play/i)).toBeInTheDocument();
        expect(screen.getByText(/guess the word/i)).toBeInTheDocument();
        expect(screen.getByText(/hints/i)).toBeInTheDocument();
        expect(screen.getByText(/scoring/i)).toBeInTheDocument();
    });
    it('displays FAQ section', () => {
        render(_jsx(Help, {}));
        // Check for FAQ content
        expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
        expect(screen.getByText(/what is reverse define/i)).toBeInTheDocument();
        expect(screen.getByText(/how do i get points/i)).toBeInTheDocument();
        expect(screen.getByText(/what are streaks/i)).toBeInTheDocument();
    });
    it('displays contact section', () => {
        render(_jsx(Help, {}));
        // Check for contact content
        expect(screen.getByText(/contact us/i)).toBeInTheDocument();
        expect(screen.getByText(/email/i)).toBeInTheDocument();
        expect(screen.getByText(/support/i)).toBeInTheDocument();
    });
    it('handles FAQ accordion expansion', async () => {
        render(_jsx(Help, {}));
        // Find and click FAQ items
        const faqItems = screen.getAllByRole('button', { name: /what/i });
        for (const item of faqItems) {
            await user.click(item);
            expect(item).toHaveAttribute('aria-expanded', 'true');
        }
    });
    it('handles FAQ accordion collapse', async () => {
        render(_jsx(Help, {}));
        // Find and click FAQ items
        const faqItems = screen.getAllByRole('button', { name: /what/i });
        for (const item of faqItems) {
            // Expand
            await user.click(item);
            expect(item).toHaveAttribute('aria-expanded', 'true');
            // Collapse
            await user.click(item);
            expect(item).toHaveAttribute('aria-expanded', 'false');
        }
    });
    it('handles contact form submission', async () => {
        const onSubmitSuccess = vi.fn();
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({
                message: 'Message sent successfully'
            })
        });
        render(_jsx(Help, { onSubmitSuccess: onSubmitSuccess }));
        // Fill in the contact form
        const nameInput = screen.getByPlaceholderText(/name/i);
        const emailInput = screen.getByPlaceholderText(/email/i);
        const messageInput = screen.getByPlaceholderText(/message/i);
        const submitButton = screen.getByRole('button', { name: /send/i });
        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(messageInput, 'Test message');
        await user.click(submitButton);
        // Verify the submission request
        expect(mockFetch).toHaveBeenCalledWith('/api/contact', expect.any(Object));
        // Wait for success callback
        await waitFor(() => {
            expect(onSubmitSuccess).toHaveBeenCalledWith({
                message: 'Message sent successfully'
            });
        });
    });
    it('validates contact form fields', async () => {
        render(_jsx(Help, {}));
        // Try to submit without filling in fields
        const submitButton = screen.getByRole('button', { name: /send/i });
        await user.click(submitButton);
        // Check for validation messages
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
    it('validates email format in contact form', async () => {
        render(_jsx(Help, {}));
        // Fill in the form with invalid email
        const nameInput = screen.getByPlaceholderText(/name/i);
        const emailInput = screen.getByPlaceholderText(/email/i);
        const messageInput = screen.getByPlaceholderText(/message/i);
        const submitButton = screen.getByRole('button', { name: /send/i });
        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'invalid-email');
        await user.type(messageInput, 'Test message');
        await user.click(submitButton);
        // Check for validation message
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
    it('handles loading state during contact form submission', async () => {
        mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(_jsx(Help, {}));
        // Fill in the form
        const nameInput = screen.getByPlaceholderText(/name/i);
        const emailInput = screen.getByPlaceholderText(/email/i);
        const messageInput = screen.getByPlaceholderText(/message/i);
        const submitButton = screen.getByRole('button', { name: /send/i });
        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(messageInput, 'Test message');
        await user.click(submitButton);
        // Check for loading state
        expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });
    it('handles network errors during contact form submission', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        render(_jsx(Help, {}));
        // Fill in the form
        const nameInput = screen.getByPlaceholderText(/name/i);
        const emailInput = screen.getByPlaceholderText(/email/i);
        const messageInput = screen.getByPlaceholderText(/message/i);
        const submitButton = screen.getByRole('button', { name: /send/i });
        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(messageInput, 'Test message');
        await user.click(submitButton);
        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });
    });
    it('handles server errors during contact form submission', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: 'Internal server error' })
        });
        render(_jsx(Help, {}));
        // Fill in the form
        const nameInput = screen.getByPlaceholderText(/name/i);
        const emailInput = screen.getByPlaceholderText(/email/i);
        const messageInput = screen.getByPlaceholderText(/message/i);
        const submitButton = screen.getByRole('button', { name: /send/i });
        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(messageInput, 'Test message');
        await user.click(submitButton);
        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
        });
    });
});
