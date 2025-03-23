import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the navbar interface', () => {
    render(<Navbar />);

    // Check for essential UI elements
    expect(screen.getByText(/reverse define/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /leaderboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stats/i })).toBeInTheDocument();
  });

  it('handles leaderboard button click', async () => {
    const onLeaderboardClick = vi.fn();
    render(<Navbar onLeaderboardClick={onLeaderboardClick} />);

    const leaderboardButton = screen.getByRole('button', { name: /leaderboard/i });
    await userEvent.click(leaderboardButton);

    expect(onLeaderboardClick).toHaveBeenCalled();
  });

  it('handles stats button click', async () => {
    const onStatsClick = vi.fn();
    render(<Navbar onStatsClick={onStatsClick} />);

    const statsButton = screen.getByRole('button', { name: /stats/i });
    await userEvent.click(statsButton);

    expect(onStatsClick).toHaveBeenCalled();
  });

  it('displays user info when logged in', () => {
    const user = {
      username: 'testuser',
      score: 100,
      rank: 5
    };
    render(<Navbar user={user} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays login button when not logged in', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles login button click', async () => {
    const onLoginClick = vi.fn();
    render(<Navbar onLoginClick={onLoginClick} />);

    const loginButton = screen.getByRole('button', { name: /login/i });
    await userEvent.click(loginButton);

    expect(onLoginClick).toHaveBeenCalled();
  });

  it('handles logout button click', async () => {
    const onLogoutClick = vi.fn();
    const user = {
      username: 'testuser',
      score: 100,
      rank: 5
    };
    render(<Navbar user={user} onLogoutClick={onLogoutClick} />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await userEvent.click(logoutButton);

    expect(onLogoutClick).toHaveBeenCalled();
  });

  it('displays mobile menu when hamburger is clicked', async () => {
    render(<Navbar />);

    const hamburgerButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(hamburgerButton);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('closes mobile menu when close button is clicked', async () => {
    render(<Navbar />);

    // Open menu
    const hamburgerButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(hamburgerButton);

    // Close menu
    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
}); 