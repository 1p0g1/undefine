import type { Message } from '@undefine/shared-types';

export interface TimerProps {
  initialTime: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export interface LeaderboardProps {
  entries: Array<{
    username: string;
    score: number;
    rank: number;
  }>;
}

export interface ToastProps {
  id: string;
  type?: Message['type'];
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

export interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    guesses: number;
    time: number;
    hints: number;
  };
}

export interface StatsProps {
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    averageGuesses: number;
    averageTime: number;
  };
}

export interface HintContentProps {
  hint: string;
  type: string;
  isRevealed: boolean;
}

export interface GameLoaderProps {
  isLoading: boolean;
  error?: string;
}

export interface ErrorMessageProps {
  message: string;
}

export interface DefineBoxesProps {
  word: string;
  isRevealed: boolean;
}

export interface DefineHintsProps {
  hints: Array<{
    type: string;
    content: string;
    isRevealed: boolean;
  }>;
  onRevealHint: (index: number) => void;
}

export interface GameSummaryProps {
  stats: {
    guesses: number;
    time: number;
    hints: number;
  };
  onPlayAgain: () => void;
} 