import React from 'react';
import { WordData } from '../types/game';
import './DefineHints.css';
interface DefineHintsProps {
    word: WordData;
    revealedHints: number[];
    guessCount: number;
    onSynonymClick?: (synonym: string) => void;
    isLoading?: boolean;
}
declare const DefineHints: React.FC<DefineHintsProps>;
export default DefineHints;
