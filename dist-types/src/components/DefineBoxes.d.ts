import React from 'react';
import { HintIndex, GuessResult } from '../types/game.js';
import './DefineBoxes.css';
interface DefineBoxesProps {
    revealedHints: HintIndex[];
    onHintReveal: (hint: HintIndex) => void;
    isGameOver: boolean;
    hasWon: boolean;
    guessResults: GuessResult[];
}
declare const DefineBoxes: React.FC<DefineBoxesProps>;
export default DefineBoxes;
