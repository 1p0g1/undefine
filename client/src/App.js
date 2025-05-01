import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import Confetti from './components/Confetti';
import Leaderboard from './components/Leaderboard';
import { getApiUrl } from './config.js';
import { useLocalGameState } from './hooks/useLocalGameState';
import { HINT_INDICES } from '@undefine/shared-types';
import DefineBoxes from './components/DefineBoxes';
import HintContent from './components/HintContent.js';
import { ToastProvider, useToast } from './components/Toast';
import ErrorMessage from './components/ErrorMessage';
import GameOverModal from './components/GameOverModal.js';
import GameLoader from './components/GameLoader.js';
import Header from './components/Header';
import { mapWordDataToWordClues } from './utils/validation.js';
import { useGameSession } from './hooks/useGameSession';
import { useAuth } from './hooks/useAuth';
import { useGameState } from './hooks/useGameState';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useWordData } from './hooks/useWordData';
import { useGameGuess } from './hooks/useGameGuess';
import { GameHeader } from './components/GameHeader';
import { GameFooter } from './components/GameFooter';
import { GuessInput } from './components/GuessInput';
import { GameMessages } from './components/GameMessages';
const MAX_GUESSES = 6;
const normalize = (text) => {
    if (!text)
        return '';
    return text.trim().toLowerCase().replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
};
function App() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [gameState, setGameState] = useState({
        gameId: '',
        word: '',
        correctWord: '',
        guessCount: 0,
        isGameOver: false,
        isCorrect: false,
        remainingGuesses: 6,
        loading: true,
        wordData: null,
        revealedHints: [],
        hasWon: false,
        showConfetti: false,
        showLeaderboard: false,
        message: null,
        guessHistory: [],
        guessResults: [],
        timer: 0,
        fuzzyMatchPositions: [],
        guesses: [],
        hintLevel: 0
    });
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState(null);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState('');
    const [revealedHints, setRevealedHints] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [fuzzyCount, setFuzzyCount] = useState(0);
    const [leaderboardRank, setLeaderboardRank] = useState(null);
    const [guessHistory, setGuessHistory] = useState([]);
    const [guessResults, setGuessResults] = useState([]);
    const [fuzzyMatchPositions, setFuzzyMatchPositions] = useState([]);
    // ✅ useRef hooks
    const inputRef = useRef(null);
    // ✅ Custom hooks
    const { state: localGameState, updateGameStats, hasPlayedToday } = useLocalGameState();
    const { session } = useGameSession();
    const { state: gameStateHook } = useGameState();
    const { entries: leaderboardEntries, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard();
    const { wordData: wordDataFromHook, loading: wordDataLoading, error: wordDataError } = useWordData(gameState.gameId);
    const { submitGuess, isSubmitting, error: guessError } = useGameGuess();
    // Add state for modal visibility
    const [showModal, setShowModal] = useState(false);
    // ✅ All helper functions
    const initializeGame = async () => {
        console.log('Initializing game session...');
        setGameState(prev => ({ ...prev, loading: true, isGameOver: false }));
        setError('');
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(getApiUrl('/api/word'), {
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to load game' }));
                throw new Error(errorData.error || 'Failed to load game');
            }
            const data = await response.json();
            console.log('Game session response:', {
                hasGameId: !!data.gameId,
                hasWord: !!data.word,
                wordId: data.word?.id
            });
            if (data && data.gameId && data.word) {
                const wordData = {
                    id: data.word.id,
                    word: data.word.word,
                    definition: data.word.definition,
                    etymology: data.word.etymology,
                    first_letter: data.word.first_letter,
                    in_a_sentence: data.word.in_a_sentence,
                    number_of_letters: data.word.number_of_letters,
                    equivalents: data.word.equivalents,
                    difficulty: data.word.difficulty,
                    created_at: data.word.created_at,
                    updated_at: data.word.updated_at,
                    clues: {
                        D: data.word.definition,
                        E: data.word.etymology,
                        F: data.word.first_letter,
                        I: data.word.in_a_sentence,
                        N: data.word.number_of_letters,
                        E2: data.word.equivalents
                    }
                };
                setGameState({
                    gameId: data.gameId,
                    word: data.word.word,
                    correctWord: data.word.word,
                    guessCount: 0,
                    isGameOver: false,
                    isCorrect: false,
                    remainingGuesses: 6,
                    loading: false,
                    wordData,
                    revealedHints: [],
                    hasWon: false,
                    showConfetti: false,
                    showLeaderboard: false,
                    message: null,
                    guessHistory: [],
                    guessResults: [],
                    timer: 0,
                    fuzzyMatchPositions: [],
                    guesses: [],
                    hintLevel: 0
                });
            }
            else {
                throw new Error('Invalid game session data');
            }
        }
        catch (err) {
            console.error('Failed to initialize game session:', err);
            setGameState(prev => ({ ...prev, loading: false, isGameOver: true }));
            setError(err instanceof Error ? err.message : 'Failed to load game. Please try again.');
        }
    };
    const validateGameState = () => {
        // Don't validate if session isn't ready
        if (!gameState.gameId || !gameState.word) {
            return;
        }
        const isValid = gameState.gameId.length > 0 &&
            gameState.word.length > 0 &&
            typeof gameState.isGameOver === 'boolean' &&
            gameState.remainingGuesses >= 0 &&
            Array.isArray(gameState.guessHistory) &&
            Array.isArray(gameState.guessResults) &&
            Array.isArray(gameState.revealedHints);
        if (!isValid) {
            console.warn('Invalid game state detected:', gameState);
            setGameState(prev => ({ ...prev, loading: true }));
            initializeGame();
        }
    };
    const handleGameState = (result) => {
        setGameState(prev => ({
            ...prev,
            isGameOver: result.gameOver,
            isCorrect: result.isCorrect,
            hasWon: result.isCorrect,
            guessCount: prev.guessCount + 1,
            guessResults: [...prev.guessResults, result],
            guessHistory: [...prev.guessHistory, {
                    guess: result.guess,
                    timestamp: Date.now(),
                    result
                }],
            fuzzyMatchPositions: result.fuzzyPositions || [],
            correctWord: result.correctWord || prev.correctWord,
            guesses: [...prev.guesses, result.guess]
        }));
    };
    const handleInputChange = (e) => {
        const value = e.target.value;
        const cleanValue = normalize(value);
        if (revealedHints.includes(HINT_INDICES.F) && wordDataFromHook?.clues.F) {
            if (cleanValue.length === 0 || cleanValue[0] === normalize(wordDataFromHook.clues.F)) {
                setGuess(cleanValue);
            }
        }
        else {
            setGuess(cleanValue);
        }
    };
    const handleKeyDown = (e) => {
        if (revealedHints.includes(HINT_INDICES.F) && wordDataFromHook?.clues.F) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const target = e.target;
                if (target.selectionStart === 0 || target.selectionStart === 1) {
                    e.preventDefault();
                }
            }
        }
    };
    const isGuessValid = () => {
        if (!guess.trim() || gameState.isGameOver)
            return false;
        if (revealedHints.includes(HINT_INDICES.N) && wordDataFromHook?.clues.N) {
            return guess.length === wordDataFromHook.clues.N;
        }
        return true;
    };
    const handleGuess = async (guess) => {
        if (!wordDataFromHook) {
            console.error('No word data available');
            return;
        }
        const result = {
            isCorrect: guess.toLowerCase() === wordDataFromHook.word.toLowerCase(),
            guess,
            isFuzzy: false,
            fuzzyPositions: [],
            gameOver: false,
            correctWord: wordDataFromHook.word
        };
        if (result.isCorrect) {
            result.gameOver = true;
        }
        else if (gameState.guessCount >= MAX_GUESSES - 1) {
            result.gameOver = true;
        }
        handleGameState(result);
        return result;
    };
    const handleInputFocus = () => {
        if (revealedHints.includes(HINT_INDICES.F) && wordDataFromHook?.clues.F && inputRef.current) {
            if (guess.length === 0) {
                setGuess(wordDataFromHook.clues.F);
            }
            const pos = guess.length;
            inputRef.current.setSelectionRange(pos, pos);
        }
    };
    const getInputPlaceholder = () => {
        if (revealedHints.includes(HINT_INDICES.F) && wordDataFromHook?.clues.F) {
            return `${wordDataFromHook.clues.F}_______`;
        }
        return "Enter your guess...";
    };
    const getInputMaxLength = () => {
        if (revealedHints.includes(HINT_INDICES.N) && wordDataFromHook?.clues.N) {
            return wordDataFromHook.clues.N;
        }
        return undefined;
    };
    const handleHintReveal = (hint) => {
        setRevealedHints(prev => [...prev, hint]);
    };
    // ✅ All useEffect hooks
    useEffect(() => {
        if (hasPlayedToday()) {
            toast.info('You have already played today. Come back tomorrow for a new word!');
            setGameState(prev => ({ ...prev, loading: false, isGameOver: true }));
            setShowLeaderboard(true);
        }
        else {
            initializeGame();
        }
    }, []);
    useEffect(() => {
        validateGameState();
    }, [gameState.gameId, gameState.word, gameState.isGameOver]);
    useEffect(() => {
        let interval;
        if (!gameState.isGameOver) {
            interval = window.setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [gameState.isGameOver]);
    // ✅ Single return with conditional rendering
    return (_jsx("div", { className: "app", children: _jsxs(ToastProvider, { children: [_jsx(Header, {}), _jsx("main", { className: "main-content", children: gameState.loading ? (_jsx(GameLoader, { onRetry: initializeGame })) : error ? (_jsx(ErrorMessage, { message: error, onRetry: initializeGame })) : (_jsxs(_Fragment, { children: [_jsx(GameHeader, { onSettingsClick: () => setShowModal(true), onHowToPlayClick: () => { }, onStatsClick: () => { } }), _jsxs("div", { className: "game-container", children: [_jsx(DefineBoxes, { revealedHints: gameState.revealedHints, onHintReveal: handleHintReveal, isGameOver: gameState.isGameOver, isCorrect: gameState.isCorrect, guessCount: gameState.guessCount, guessResults: gameState.guessResults }), _jsx(GuessInput, { onGuess: handleGuess, disabled: gameState.isGameOver, maxLength: getInputMaxLength() }), _jsx(GameMessages, { messages: message ? [message] : [], onDismiss: (msg) => setMessage(null) }), _jsx(GameFooter, { onNewGame: initializeGame, onShare: () => { } })] }), _jsx(HintContent, { wordData: gameState.wordData ? mapWordDataToWordClues(gameState.wordData) : null, revealedHints: gameState.revealedHints, onHintReveal: handleHintReveal, isGameOver: gameState.isGameOver, isCorrect: gameState.isCorrect, guessCount: gameState.guessCount, guessResults: gameState.guessResults }), gameState.isGameOver && (_jsx(GameOverModal, { isOpen: true, onClose: () => setShowModal(false), isCorrect: gameState.isCorrect, wordData: gameState.wordData ? mapWordDataToWordClues(gameState.wordData) : null, correctWord: gameState.correctWord, guessCount: gameState.guessCount, timeTaken: timer, onPlayAgain: initializeGame })), showConfetti && _jsx(Confetti, {}), showLeaderboard && (_jsx(Leaderboard, { onClose: () => setShowLeaderboard(false), gameId: gameState.gameId, isGameOver: gameState.isGameOver, isCorrect: gameState.isCorrect, correctWord: gameState.correctWord, severity: gameState.isCorrect ? 'success' : gameState.isGameOver ? 'error' : 'info' }))] })) })] }) }));
}
export default App;
