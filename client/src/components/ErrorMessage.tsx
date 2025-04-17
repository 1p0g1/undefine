import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <p>{message}</p>
      <button onClick={onRetry} className="retry-button">
        Try Again
      </button>
    </div>
  );
};

export default ErrorMessage; 