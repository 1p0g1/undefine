import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './Settings';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Settings', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the settings interface', () => {
    render(<Settings />);

    // Check for essential UI elements
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/theme/i)).toBeInTheDocument();
    expect(screen.getByText(/language/i)).toBeInTheDocument();
  });

  it('handles notification settings update', async () => {
    const onUpdateSuccess = vi.fn();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        settings: {
          notifications: {
            dailyReminder: true,
            gameResults: true,
            achievements: false
          }
        }
      })
    });

    render(<Settings onUpdateSuccess={onUpdateSuccess} />);

    // Toggle notification settings
    const dailyReminderToggle = screen.getByRole('switch', { name: /daily reminder/i });
    const gameResultsToggle = screen.getByRole('switch', { name: /game results/i });
    const achievementsToggle = screen.getByRole('switch', { name: /achievements/i });

    await userEvent.click(dailyReminderToggle);
    await userEvent.click(gameResultsToggle);
    await userEvent.click(achievementsToggle);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Verify the update request
    expect(mockFetch).toHaveBeenCalledWith('/api/settings', expect.any(Object));

    // Wait for success callback
    await waitFor(() => {
      expect(onUpdateSuccess).toHaveBeenCalledWith({
        settings: {
          notifications: {
            dailyReminder: true,
            gameResults: true,
            achievements: false
          }
        }
      });
    });
  });

  it('handles theme settings update', async () => {
    const onUpdateSuccess = vi.fn();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        settings: {
          theme: 'dark'
        }
      })
    });

    render(<Settings onUpdateSuccess={onUpdateSuccess} />);

    // Change theme
    const themeSelect = screen.getByRole('combobox', { name: /theme/i });
    await userEvent.selectOptions(themeSelect, 'dark');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Verify the update request
    expect(mockFetch).toHaveBeenCalledWith('/api/settings', expect.any(Object));

    // Wait for success callback
    await waitFor(() => {
      expect(onUpdateSuccess).toHaveBeenCalledWith({
        settings: {
          theme: 'dark'
        }
      });
    });
  });

  it('handles language settings update', async () => {
    const onUpdateSuccess = vi.fn();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        settings: {
          language: 'es'
        }
      })
    });

    render(<Settings onUpdateSuccess={onUpdateSuccess} />);

    // Change language
    const languageSelect = screen.getByRole('combobox', { name: /language/i });
    await userEvent.selectOptions(languageSelect, 'es');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Verify the update request
    expect(mockFetch).toHaveBeenCalledWith('/api/settings', expect.any(Object));

    // Wait for success callback
    await waitFor(() => {
      expect(onUpdateSuccess).toHaveBeenCalledWith({
        settings: {
          language: 'es'
        }
      });
    });
  });

  it('handles loading state during update', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Settings />);

    // Change a setting
    const dailyReminderToggle = screen.getByRole('switch', { name: /daily reminder/i });
    await userEvent.click(dailyReminderToggle);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Check for loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('handles network errors during update', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Settings />);

    // Change a setting
    const dailyReminderToggle = screen.getByRole('switch', { name: /daily reminder/i });
    await userEvent.click(dailyReminderToggle);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('handles server errors during update', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Internal server error' })
    });

    render(<Settings />);

    // Change a setting
    const dailyReminderToggle = screen.getByRole('switch', { name: /daily reminder/i });
    await userEvent.click(dailyReminderToggle);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
    });
  });

  it('loads initial settings', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        settings: {
          notifications: {
            dailyReminder: true,
            gameResults: true,
            achievements: false
          },
          theme: 'light',
          language: 'en'
        }
      })
    });

    render(<Settings />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /daily reminder/i })).toBeChecked();
      expect(screen.getByRole('switch', { name: /game results/i })).toBeChecked();
      expect(screen.getByRole('switch', { name: /achievements/i })).not.toBeChecked();
      expect(screen.getByRole('combobox', { name: /theme/i })).toHaveValue('light');
      expect(screen.getByRole('combobox', { name: /language/i })).toHaveValue('en');
    });
  });
}); 