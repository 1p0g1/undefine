import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onSoundToggle: (enabled: boolean) => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  currentTheme: 'light' | 'dark';
  soundEnabled: boolean;
  currentDifficulty: 'easy' | 'medium' | 'hard';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onThemeChange,
  onSoundToggle,
  onDifficultyChange,
  currentTheme,
  soundEnabled,
  currentDifficulty
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Theme</h3>
            <div className="flex gap-4">
              <button
                onClick={() => onThemeChange('light')}
                className={`px-4 py-2 rounded-lg ${
                  currentTheme === 'light'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`px-4 py-2 rounded-lg ${
                  currentTheme === 'dark'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Sound</h3>
            <button
              onClick={() => onSoundToggle(!soundEnabled)}
              className={`px-4 py-2 rounded-lg ${
                soundEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
            <div className="flex gap-4">
              <button
                onClick={() => onDifficultyChange('easy')}
                className={`px-4 py-2 rounded-lg ${
                  currentDifficulty === 'easy'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => onDifficultyChange('medium')}
                className={`px-4 py-2 rounded-lg ${
                  currentDifficulty === 'medium'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => onDifficultyChange('hard')}
                className={`px-4 py-2 rounded-lg ${
                  currentDifficulty === 'hard'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Hard
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}; 