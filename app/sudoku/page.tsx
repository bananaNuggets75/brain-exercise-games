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

  // Timer effect
  useEffect(() => {
    if (gameStatus === 'playing') {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus, startTime]);

  // Generate a complete valid Sudoku grid
  const generateCompleteGrid = useCallback((): SudokuGrid => {
    const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    
    const isValid = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
      }
      
      // Check column
      for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
      }
      
      // Check 3x3 box
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[startRow + i][startCol + j] === num) return false;
        }
      }
      
      return true;
    };

    const fillGrid = (grid: SudokuGrid): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === null) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numbers) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (fillGrid(grid)) return true;
                grid[row][col] = null;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    fillGrid(grid);
    return grid;
  }, []);

  return (
    <div>
      Sudoku Game
    </div>
  );
};




export default SudokuPage;
