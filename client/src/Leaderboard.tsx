import React, { useState } from 'react';
import './Leaderboard.css';

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
  // Static mock data instead of API calls
  const [userRank] = useState<number>(1);
  const [userStats] = useState<UserStats>({
    gamesPlayed: 1,
    averageGuesses: guessCount,
    averageTime: time,
    bestTime: time,
    currentStreak: 1,
    longestStreak: 1,
    topTenCount: 1
  });
  // Flag to indicate leaderboard is disabled
  const [isLeaderboardDisabled] = useState<boolean>(
    process.env.NODE_ENV !== 'production' || process.env.DISABLE_LEADERBOARD === 'true'
  );

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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

  // Function to handle sharing results
  const handleShareResults = () => {
    // Create the share text
    const shareText = `🎯 Reverse Define\n\n` +
      `Solved in ${formatTime(time)}\n` +
      `Guesses: ${guessCount}/6\n` +
      `Hints: ${hintCount}\n\n` +
      `I found the word "${word}"\n\n` +
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
          {isLeaderboardDisabled ? (
            <p className="no-entries">
              Leaderboard is temporarily disabled for early user testing.<br/>
              Your stats and streaks are still being tracked!
            </p>
          ) : (
            <p className="no-entries">Leaderboard data will be available soon!</p>
          )}
        </div>
        
        <div className="leaderboard-actions">
          <button className="share-button" onClick={handleShareResults}>
            Share Results
          </button>
          {userStats && userStats.currentStreak > 0 && (
            <div className="streak-notification">
              🔥 Your streak has been updated: {userStats.currentStreak} days!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 