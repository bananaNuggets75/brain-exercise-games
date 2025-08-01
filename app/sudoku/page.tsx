'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

type CellValue = number | null;
type SudokuGrid = CellValue[][];
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameStats {
  played: number;
  won: number;
  bestTime: number | null;
}

interface CellError {
  row: number;
  col: number;
}

const SudokuPage: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<SudokuGrid>(() => Array(9).fill(null).map(() => Array(9).fill(null)));
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>(() => Array(9).fill(null).map(() => Array(9).fill(null)));
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'paused'>('playing');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [stats, setStats] = useState<GameStats>({ played: 0, won: 0, bestTime: null });
  const [errors, setErrors] = useState<CellError[]>([]);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<number[][][]>(() => 
    Array(9).fill(null).map(() => Array(9).fill(null).map(() => []))    
  );

  return (
    <div>
      Sudoku Game
    </div>
  );
};




export default SudokuPage;
