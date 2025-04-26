import React from 'react';
import { WordData } from '../types/game.js';
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
//# sourceMappingURL=DefineHints.d.ts.map