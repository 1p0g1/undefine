import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface GameLoaderProps {
  onRetry: () => void;
  error?: string;
}

const GameLoader: React.FC<GameLoaderProps> = ({ onRetry, error }) => {
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
      </div>
    </div>
  );
};

export default GameLoader; 