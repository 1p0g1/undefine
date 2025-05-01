import React from 'react';
import type { Message } from '@undefine/shared-types';

interface GameMessagesProps {
  messages: Message[];
  onDismiss: (message: Message) => void;
}

export const GameMessages: React.FC<GameMessagesProps> = ({ messages, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg shadow ${
            message.type === 'success'
              ? 'bg-green-500'
              : message.type === 'error'
              ? 'bg-red-500'
              : message.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <p>{message.text}</p>
            <button
              onClick={() => onDismiss(message)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 