import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import { buildApiUrl } from './config';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  time: number;
  guessCount: number;
  fuzzyCount: number;
  hintCount: number;
}

interface UserStats {
  gamesPlayed: number;
  averageGuesses: number;
  averageTime: number;
  bestTime: number;
  currentStreak: number;
  longestStreak: number;
  topTenCount: number;
}

interface Hint {
  letterCount: boolean;
  alternateDefinition: boolean;
  synonyms: boolean;
}

interface LeaderboardProps {
  userId: string;
  time: number;
  guessCount: number;
  fuzzyCount: number;
  hintCount: number;
  word: string;
  guessResults: string[];
  fuzzyMatchPositions: number[];
  hints: Hint;
  onClose: () => void;
  userEmail: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  userId,
  time,
  guessCount,
  fuzzyCount,
  hintCount,
  word,
  guessResults,
  fuzzyMatchPositions,
  hints,
  onClose,
  userEmail
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a valid userEmail before making the request
      if (!userEmail) {
        console.log('No userEmail provided, using anonymous leaderboard data');
      }
      
      // Fetch the leaderboard data
      const url = buildApiUrl(`/api/leaderboard`); // Remove the userEmail parameter that's causing 404s
      console.log('Fetching leaderboard from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Leaderboard API error:', response.status, response.statusText);
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Leaderboard data received:', data);
      
      // Handle the response data, providing defaults
      setEntries(data.entries || []);
      setUserRank(data.userRank || null);
      setUserStats(data.userStats || null);
      setTotalPlayers(data.entries ? data.entries.length : 0);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard. Please try again later.');
      // Set default values on error
      setEntries([]);
      setUserRank(null);
      setUserStats(null);
      setTotalPlayers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchLeaderboard();
    }
  }, [userEmail]);

  // Render the DEFINE boxes to show the user's performance
  const renderDefineBoxes = () => {
    const defineLetters = ['D', 'E', 'F', 'I', 'N', 'E'];
    
    return (
      <div className="leaderboard-define-boxes">
        {defineLetters.map((letter, index) => {
          let boxClass = 'define-box';
          
          // First check if this position has a guess result
          if (guessResults && guessResults[index]) {
            boxClass += ` ${guessResults[index]}`;
          }
          
          // Then check if this position is a fuzzy match
          // If it is, add the fuzzy class regardless of the guess result
          if (fuzzyMatchPositions && fuzzyMatchPositions.includes(index)) {
            boxClass += ' fuzzy';
          }
          
          return (
            <div key={index} className={boxClass}>
              {letter}
            </div>
          );
        })}
      </div>
    );
  };

  // Render hint usage icons
  const renderHintIcons = (count: number) => {
    if (count === 0) return <span className="no-hints">None</span>;
    
    const icons = [];
    
    // Add icons based on which hints were used
    if (hints.letterCount) {
      icons.push(<span key="letter" className="hint-icon" title="# of letters">🔢</span>);
    }
    
    if (hints.alternateDefinition) {
      icons.push(<span key="alt" className="hint-icon" title="Alternate Definition">📖</span>);
    }
    
    if (hints.synonyms) {
      icons.push(<span key="syn" className="hint-icon" title="Synonyms">🔄</span>);
    }
    
    return <div className="hint-icons">{icons}</div>;
  };

  // Function to render hint icons for leaderboard entries
  const renderLeaderboardHintIcons = (count: number) => {
    if (count === 0) return <span className="no-hints">None</span>;
    
    // Use specific hint icons if count is 3 or less (assuming max 3 hints)
    if (count <= 3) {
      const icons = [];
      
      // First hint is always Letter Count
      if (count >= 1) {
        icons.push(<span key="letter" className="hint-icon" title="# of letters">🔢</span>);
      }
      
      // Second hint is always Alternate Definition
      if (count >= 2) {
        icons.push(<span key="alt" className="hint-icon" title="Alternate Definition">📖</span>);
      }
      
      // Third hint is always Synonyms
      if (count >= 3) {
        icons.push(<span key="syn" className="hint-icon" title="Synonyms">🔄</span>);
      }
      
      return <div className="hint-icons">{icons}</div>;
    }
    
    // If more than 3 hints (future-proofing), just show the count with a generic icon
    return (
      <div className="hint-icons">
        <span className="hint-icon" title={`${count} hints used`}>💡</span>
        <span className="hint-count">×{count}</span>
      </div>
    );
  };

  // Function to handle sharing results
  const handleShareResults = () => {
    // Create emoji boxes based on guess results
    const emojiBoxes = guessResults.map(result => {
      if (result === 'correct') return '🟩'; // Green for correct
      if (result === 'incorrect') return '🟥'; // Red for incorrect
      return '⬜'; // White for unused
    }).join('');
    
    // Create hint emoji string
    const hintEmojis = hintCount > 0 
      ? ' ' + Array(hintCount).fill('💡').join('')
      : '';
    
    // Format the date as DD/MM/YY
    const today = new Date();
    const dateString = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
    
    // Create the share text
    const shareText = `🎯 Reverse Define #1\n\n` +
      `Solved in ${formatTime(time)}\n` +
      `Guesses: ${guessCount}/6\n` +
      `Hints: ${hintCount}\n` +
      `Rank: #${userRank || '?'}\n\n` +
      `Current Streak: ${userStats?.currentStreak || 0}\n` +
      `Best Streak: ${userStats?.longestStreak || 0}\n` +
      `🏆 Top 10 Finishes: ${userStats?.topTenCount || 0}\n\n` +
      `Play at: https://reversedefine.com`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText)
      .then(() => {
        // Show a temporary success message
        const shareButton = document.querySelector('.share-button');
        if (shareButton) {
          const originalText = shareButton.textContent;
          shareButton.textContent = 'Copied!';
          setTimeout(() => {
            shareButton.textContent = originalText;
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard. Please try again.');
      });
  };

  return (
    <div className="leaderboard-modal">
      <div className="leaderboard-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Today's Challenge Results</h2>
        
        <div className="user-performance">
          {renderDefineBoxes()}
          <p className="performance-summary">
            You guessed <strong>{word}</strong> in <strong>{formatTime(time)}</strong>
            {userRank && userRank > 0 && (
              <>, ranking <strong>#{userRank}</strong> in the world</>
            )}
          </p>
          <p className="performance-details">
            Guesses used: <strong>{guessCount}/6</strong> • 
            Fuzzy matches: <strong>{fuzzyCount}</strong> •
            Hints used: {renderHintIcons(hintCount)}
          </p>
        </div>
        
        <div className="user-stats">
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-value">{userStats?.currentStreak || 0}</div>
              <div className="stat-label">Current Streak</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{userStats?.longestStreak || 0}</div>
              <div className="stat-label">Longest Streak</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{userStats?.topTenCount || 0}</div>
              <div className="stat-label">Top 10 Finishes</div>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-value">{userStats?.gamesPlayed || 0}</div>
              <div className="stat-label">Games Played</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{userStats?.averageGuesses?.toFixed(1) || '0.0'}</div>
              <div className="stat-label">Avg. Guesses</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{formatTime(userStats?.bestTime || 0)}</div>
              <div className="stat-label">Best Time</div>
            </div>
          </div>
        </div>
        
        <div className="leaderboard-section">
          <h3>Today's Leaderboard</h3>
          {loading ? (
            <p className="loading">Loading leaderboard...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : entries.length === 0 ? (
            <p className="no-entries">Be the first to complete today's challenge!</p>
          ) : (
            <>
              <div className="leaderboard-stats">
                <p>Total players today: <strong>{totalPlayers}</strong></p>
              </div>
              <div className="leaderboard-entries">
                {entries.map((entry, index) => (
                  <div key={entry.userId} className={`leaderboard-entry ${entry.userName === userEmail ? 'current-user' : ''}`}>
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{entry.userName}</span>
                    <span className="time">{formatTime(entry.time)}</span>
                    <span className="guesses">{entry.guessCount} guesses</span>
                    <span className="hints">{renderLeaderboardHintIcons(entry.hintCount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="leaderboard-actions">
          <button className="share-button" onClick={handleShareResults}>
            Share Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 