import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

interface LeaderboardEntry {
  id: string;
  time: number;
  guessCount: number;
  fuzzyCount: number;
  hintCount?: number;
  date: string;
  word: string;
  name?: string;
}

interface LeaderboardProps {
  userId: string;
  time: number;
  guessCount: number;
  fuzzyCount: number;
  hintCount: number;
  word: string;
  guessResults: Array<'correct' | 'incorrect' | null>;
  fuzzyMatchPositions: number[];
  hints: {
    letterCount: boolean;
    alternateDefinition: boolean;
    synonyms: boolean;
  };
  onClose: () => void;
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
  onClose
}) => {
  const [leaderboardData, setLeaderboardData] = useState<{
    leaderboard: LeaderboardEntry[];
    userRank: number;
    totalEntries: number;
    startRank: number;
  } | null>(null);
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
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/leaderboard?userId=${userId}&t=${timestamp}`);
      
      if (!response.ok) {
        // If we get a 404 for user not found, create a fallback leaderboard
        if (response.status === 404) {
          // Create a simple fallback with just the user
          setLeaderboardData({
            leaderboard: [{
              id: userId,
              time,
              guessCount,
              fuzzyCount,
              date: new Date().toISOString(),
              word,
              name: 'You'
            }],
            userRank: 1,
            totalEntries: 1,
            startRank: 1
          });
          setLoading(false);
          return;
        }
        
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [userId]);

  // Render the DEFINE boxes to show the user's performance
  const renderDefineBoxes = () => {
    const defineLetters = ['D', 'E', 'F', 'I', 'N', 'E'];
    
    return (
      <div className="leaderboard-define-boxes">
        {defineLetters.map((letter, index) => {
          // Check if this position is a fuzzy match
          const isFuzzyMatch = fuzzyMatchPositions && fuzzyMatchPositions.includes(index);
          
          // Determine the appropriate class based on the guess result and fuzzy match status
          let boxClass = 'define-box';
          
          // Only add result class if we have a result for this position
          if (guessResults[index]) {
            boxClass += ` ${guessResults[index]}`;
          }
          
          // Add fuzzy class if this is a fuzzy match position
          if (isFuzzyMatch) {
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
    const shareText = `UN·DEFINE ${dateString}\n${emojiBoxes}\n${formatTime(time)}${hintEmojis}\nwww.undefine.io`;
    
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
    <div className="leaderboard-overlay">
      <div className="leaderboard-container">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Today's Challenge Results</h2>
        
        <div className="user-performance">
          {renderDefineBoxes()}
          <p className="performance-summary">
            You guessed <strong>{word}</strong> in <strong>{formatTime(time)}</strong>
            {leaderboardData && leaderboardData.userRank > 0 && (
              <>, ranking <strong>#{leaderboardData.userRank}</strong> in the world</>
            )}
          </p>
          <p className="performance-details">
            Guesses used: <strong>{guessCount}/6</strong> • 
            Fuzzy matches: <strong>{fuzzyCount}</strong> •
            Hints used: {renderHintIcons(hintCount)}
          </p>
        </div>
        
        {loading && <div className="loading-spinner">Loading leaderboard...</div>}
        
        {error && (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button className="retry-button" onClick={fetchLeaderboard}>
              Retry
            </button>
          </div>
        )}
        
        {leaderboardData && !loading && !error && (
          <div className="leaderboard-table-container">
            <h3>Leaderboard</h3>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Time</th>
                  <th>Guesses</th>
                  <th>Fuzzy</th>
                  <th>Hints</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.leaderboard.map((entry, index) => {
                  const rank = leaderboardData.startRank + index;
                  const isCurrentUser = entry.id === userId;
                  
                  return (
                    <tr key={entry.id} className={isCurrentUser ? 'current-user' : ''}>
                      <td>{rank}</td>
                      <td>{isCurrentUser ? 'You' : (entry.name || `Player ${rank}`)}</td>
                      <td>{formatTime(entry.time)}</td>
                      <td>{entry.guessCount}/6</td>
                      <td>{entry.fuzzyCount}</td>
                      <td>{renderLeaderboardHintIcons(entry.hintCount || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="leaderboard-total">
              Total players today: {leaderboardData.totalEntries}
            </p>
          </div>
        )}
        
        <div className="leaderboard-actions">
          <button className="share-button" onClick={handleShareResults}>Share Results</button>
          <button className="play-again-button" onClick={onClose}>Play Again</button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 