import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface GameLoaderProps {
  onRetry: () => void;
  error?: string;
  onRandomWord?: () => void;
}

const GameLoader: React.FC<GameLoaderProps> = ({ onRetry, error, onRandomWord }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="app-container">
      <div className="loading-content">
        {!error && <LoadingSpinner />}
        <p className="loading-text">{error ? 'Connection Error' : 'Loading game session...'}</p>
        {error && (
          <>
            <p className="error-text">{error}</p>
            <button 
              className="retry-button" 
              onClick={onRetry}
            >
              Retry Connection
            </button>
          </>
        )}
        
        {isDevelopment && onRandomWord && (
          <div className="testing-buttons" style={{ marginTop: '20px' }}>
            <p className="dev-mode-text" style={{ fontSize: '0.8em', color: '#888', marginBottom: '10px' }}>
              Developer Testing Tools
            </p>
            <button 
              className="random-word-button" 
              onClick={onRandomWord}
              style={{ 
                background: '#5c6bc0', 
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🎲 Test with Random Word
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLoader; 