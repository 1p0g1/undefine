import React from 'react';
import { WordData } from '../types/game.js';
import './GameOverModal.css';
interface GameOverModalProps {
    isOpen: boolean;
    wordData: WordData;
    isCorrect: boolean;
    onClose?: () => void;
}
declare const GameOverModal: React.FC<GameOverModalProps>;
export default GameOverModal;
