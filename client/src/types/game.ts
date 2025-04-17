export interface GameState {
  currentWord?: {
    word: string;
    definition: string;
    part_of_speech: string;
  };
  guesses: string[];
  isCorrect: boolean;
  isGameOver: boolean;
  loading: boolean;
  error?: string;
  timer: number;
  hintLevel: number;
}

export interface GameAction {
  type: string;
  payload?: any;
}

export enum GameActionTypes {
  FETCH_WORD_START = 'FETCH_WORD_START',
  FETCH_WORD_SUCCESS = 'FETCH_WORD_SUCCESS',
  FETCH_WORD_FAILURE = 'FETCH_WORD_FAILURE',
  SUBMIT_GUESS = 'SUBMIT_GUESS',
  CHECK_GUESS = 'CHECK_GUESS',
  RESET_GAME = 'RESET_GAME',
  UPDATE_TIMER = 'UPDATE_TIMER',
  INCREASE_HINT_LEVEL = 'INCREASE_HINT_LEVEL',
  GAME_OVER = 'GAME_OVER'
}

export interface GameContext {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} 