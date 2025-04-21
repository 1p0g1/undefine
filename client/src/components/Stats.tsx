import { UserStats } from '../types/index';

interface StatsProps {
  stats: UserStats;
}

export default function Stats({ stats }: StatsProps) {
  return (
    <div className="stats">
      <h2>Your Stats</h2>
      <div className="stats-grid">
        <div className="stat">
          <h3>Total Games</h3>
          <p>{stats.totalGames}</p>
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
} 