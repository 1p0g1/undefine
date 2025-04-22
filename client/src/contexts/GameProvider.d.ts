import React from 'react';
import type { GameContext as GameContextType } from '../config/types.js';
export declare function GameProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useGame(): GameContextType; 