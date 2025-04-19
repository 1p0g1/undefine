import React from 'react';
import './GameOverModal.css';
import HintContent from './HintContent';

// Define WordData interface here instead of importing it
interface WordData {
  id: string;
  word: string;
  clues: {
    D: string;  // Definition
    E: string;  // Etymology
    F: string;  // First letter
    I: string;  // In a sentence
    N: number;  // Number of letters
    E2: string[];  // Equivalents/synonyms
  };
}

interface GameOverModalProps {
  isOpen: boolean;
  wordData: WordData;
  isCorrect: boolean;
  onClose?: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, wordData, isCorrect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="word-title">{wordData.word}</h2>
          {onClose && (
            <button className="modal-close" onClick={onClose}>
