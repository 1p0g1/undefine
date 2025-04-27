import { type UserStats } from '@undefine/shared-types/index.js';

interface StatsProps {
  stats: UserStats;
}

export const Stats = ({ stats }: StatsProps) => {
  return (
    <div className="stats">
      <h2>Your Stats</h2>
      <div className="stats-grid">
        <div className="stat">
          <h3>Total Games</h3>
          <p>{stats.gamesPlayed}</p>
        </div>
        <div className="stat">
          <h3>Games Won</h3>
          <p>{stats.gamesWon}</p>
        </div>
        <div className="stat">
          <h3>Average Guesses</h3>
          <p>{stats.averageGuesses.toFixed(1)}</p>
        </div>
        <div className="stat">
          <h3>Average Time</h3>
          <p>{Math.round(stats.averageTime / 1000)}s</p>
        </div>
        <div className="stat">
          <h3>Current Streak</h3>
          <p>{stats.currentStreak}</p>
        </div>
        <div className="stat">
          <h3>Longest Streak</h3>
          <p>{stats.longestStreak}</p>
        </div>
      </div>
    </div>
  );
}; 