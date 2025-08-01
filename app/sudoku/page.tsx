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

  // Remove cells based on difficulty
  const createPuzzle = useCallback((completeGrid: SudokuGrid, difficulty: Difficulty): SudokuGrid => {
    const puzzle = completeGrid.map(row => [...row]);
    const cellsToRemove = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 50 : 60;
    
    const emptyCells: Array<[number, number]> = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        emptyCells.push([i, j]);
      }
    }

    // Shuffle and remove cells
    emptyCells.sort(() => Math.random() - 0.5);
    for (let i = 0; i < cellsToRemove && i < emptyCells.length; i++) {
      const [row, col] = emptyCells[i];
      puzzle[row][col] = null;
    }
    
    return puzzle;
  }, []);

  // Check for errors in the current grid
  const findErrors = useCallback((grid: SudokuGrid): CellError[] => {
    const errors: CellError[] = [];
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value === null) continue;
        
        // Check for duplicates in row
        for (let c = 0; c < 9; c++) {
          if (c !== col && grid[row][c] === value) {
            errors.push({ row, col });
            break;
          }
        }
        
        // Check for duplicates in column
        for (let r = 0; r < 9; r++) {
          if (r !== row && grid[r][col] === value) {
            errors.push({ row, col });
            break;
          }
        }
        
        // Check for duplicates in 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const r = startRow + i;
            const c = startCol + j;
            if ((r !== row || c !== col) && grid[r][c] === value) {
              errors.push({ row, col });
              break;
            }
          }
        }
      }
    }
    
    return errors;
  }, []);

  // Check if the puzzle is complete and valid
  const isPuzzleComplete = useCallback((grid: SudokuGrid): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) return false;
      }
    }
    return findErrors(grid).length === 0;
  }, [findErrors]);

  // Initialize new game
  const startNewGame = useCallback(() => {
    const completeGrid = generateCompleteGrid();
    const puzzleGrid = createPuzzle(completeGrid, difficulty);
    
    setGrid(puzzleGrid);
    setInitialGrid(puzzleGrid.map(row => [...row]));
    setSelectedCell(null);
    setGameStatus('playing');
    setStartTime(Date.now());
    setElapsedTime(0);
    setErrors([]);
    setNotes(Array(9).fill(null).map(() => Array(9).fill(null).map(() => [])));
  }, [generateCompleteGrid, createPuzzle, difficulty]);

  // Handle cell selection
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    setSelectedCell({ row, col });
  }, [gameStatus]);

  // Handle number input
  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || gameStatus !== 'playing') return;
    
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== null) return; // Can't modify initial cells
    
    if (showNotes) {
      // Toggle note
      setNotes(prev => {
        const newNotes = prev.map(r => r.map(c => [...c]));
        const cellNotes = newNotes[row][col];
        const noteIndex = cellNotes.indexOf(num);
        
        if (noteIndex > -1) {
          cellNotes.splice(noteIndex, 1);
        } else {
          cellNotes.push(num);
          cellNotes.sort();
        }
        
        return newNotes;
      });
    } else {
      // Place number
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = newGrid[row][col] === num ? null : num;
      
      // Clear notes for this cell
      setNotes(prev => {
        const newNotes = prev.map(r => r.map(c => [...c]));
        newNotes[row][col] = [];
        return newNotes;
      });
      
      setGrid(newGrid);
      
      // Check for completion
      if (isPuzzleComplete(newGrid)) {
        setGameStatus('won');
        const timeElapsed = Date.now() - startTime;
        setStats(prev => ({
          played: prev.played + 1,
          won: prev.won + 1,
          bestTime: prev.bestTime === null ? timeElapsed : Math.min(prev.bestTime, timeElapsed)
        }));
      }
    }
  }, [selectedCell, gameStatus, initialGrid, showNotes, grid, isPuzzleComplete, startTime]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing' || !selectedCell) return;
      
      const { row, col } = selectedCell;
      
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (initialGrid[row][col] === null) {
          const newGrid = grid.map(r => [...r]);
          newGrid[row][col] = null;
          setGrid(newGrid);
          
          // Clear notes
          setNotes(prev => {
            const newNotes = prev.map(r => r.map(c => [...c]));
            newNotes[row][col] = [];
            return newNotes;
          });
        }
      } else if (e.key === 'ArrowUp' && row > 0) {
        setSelectedCell({ row: row - 1, col });
      } else if (e.key === 'ArrowDown' && row < 8) {
        setSelectedCell({ row: row + 1, col });
      } else if (e.key === 'ArrowLeft' && col > 0) {
        setSelectedCell({ row, col: col - 1 });
      } else if (e.key === 'ArrowRight' && col < 8) {
        setSelectedCell({ row, col: col + 1 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, selectedCell, handleNumberInput, initialGrid, grid]);

  // Update errors when grid changes
  useEffect(() => {
    setErrors(findErrors(grid));
  }, [grid, findErrors]);

  // Format time
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Get cell class
  const getCellClass = (row: number, col: number): string => {
    const classes = ['sudoku-cell'];
    
    if (initialGrid[row][col] !== null) classes.push('initial');
    if (selectedCell?.row === row && selectedCell?.col === col) classes.push('selected');
    if (selectedCell && (selectedCell.row === row || selectedCell.col === col)) classes.push('highlighted');
    if (selectedCell && Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && 
        Math.floor(selectedCell.col / 3) === Math.floor(col / 3)) classes.push('box-highlighted');
    if (errors.some(e => e.row === row && e.col === col)) classes.push('error');
    if (grid[row][col] !== null) classes.push('filled');
    
    return classes.join(' ');
  };

  // Initialize game on mount
  useEffect(() => {
    startNewGame();
  }, []); // Only run once on mount

  return (
    <div>
      Sudoku Game
    </div>
  );
};




export default SudokuPage;
