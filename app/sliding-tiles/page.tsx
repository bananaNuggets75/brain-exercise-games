'use client';
import React, { useState, useEffect, useCallback } from 'react';

type GridSize = 3 | 4 | 5;
type TileValue = number | null;
type GameGrid = TileValue[][];
type Direction = 'up' | 'down' | 'left' | 'right';

interface GameStats {
  played: number;
  won: number;
  bestMoves: number | null;
  bestTime: number | null;
}

interface Position {
  row: number;
  col: number;
} 

const SlidingTilesPage: React.FC = () => {
  // Game states
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [grid, setGrid] = useState<GameGrid>([]);
  const [emptyPos, setEmptyPos] = useState<Position>({ row: 0, col: 0 });
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [moves, setMoves] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [stats, setStats] = useState<GameStats>({ played: 0, won: 0, bestMoves: null, bestTime: null });
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [showNewGameModal, setShowNewGameModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [slidingTile, setSlidingTile] = useState<Position | null>(null); 

  // Timer effect
  useEffect(() => {
    if (gameStatus === 'playing') {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus, startTime]);

  // Create solved grid
  const createSolvedGrid = useCallback((size: GridSize): GameGrid => {
    const grid: GameGrid = [];
    let number = 1;
    
    for (let row = 0; row < size; row++) {
      grid[row] = [];
      for (let col = 0; col < size; col++) {
        if (row === size - 1 && col === size - 1) {
          grid[row][col] = null; // Empty space
        } else {
          grid[row][col] = number++;
        }
      }
    }
    
    return grid;
  }, []);

  // Check if puzzle is solved
  const isPuzzleSolved = useCallback((grid: GameGrid): boolean => {
    const size = grid.length;
    let expectedNumber = 1;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (row === size - 1 && col === size - 1) {
          return grid[row][col] === null;
        }
        if (grid[row][col] !== expectedNumber) {
          return false;
        }
        expectedNumber++;
      }
    }
    
    return true;
  }, []);

  // Find empty position
  const findEmptyPosition = useCallback((grid: GameGrid): Position => {
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === null) {
          return { row, col };
        }
      }
    }
    return { row: 0, col: 0 };
  }, []);

  // Check if move is valid
  const isValidMove = useCallback((grid: GameGrid, fromRow: number, fromCol: number): boolean => {
    const emptyPos = findEmptyPosition(grid);
    const rowDiff = Math.abs(emptyPos.row - fromRow);
    const colDiff = Math.abs(emptyPos.col - fromCol);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }, [findEmptyPosition]);

  // Move tile
  const moveTile = useCallback((fromRow: number, fromCol: number): GameGrid | null => {
    if (!isValidMove(grid, fromRow, fromCol)) return null;
    
    const newGrid = grid.map(row => [...row]);
    const emptyPos = findEmptyPosition(grid);
    
    // Swap tile with empty space
    newGrid[emptyPos.row][emptyPos.col] = grid[fromRow][fromCol];
    newGrid[fromRow][fromCol] = null;
    
    return newGrid;
  }, [grid, isValidMove, findEmptyPosition]);

  // Shuffle puzzle
  const shufflePuzzle = useCallback((grid: GameGrid, shuffleMoves: number = 1000): GameGrid => {
    let currentGrid = grid.map(row => [...row]);
    let currentEmpty = findEmptyPosition(currentGrid);
    
    for (let i = 0; i < shuffleMoves; i++) {
      const possibleMoves: Position[] = [];
      
      // Find all valid moves
      const directions = [
        { row: -1, col: 0 }, // up
        { row: 1, col: 0 },  // down
        { row: 0, col: -1 }, // left
        { row: 0, col: 1 }   // right
      ];
      
      directions.forEach(({ row: dRow, col: dCol }) => {
        const newRow = currentEmpty.row + dRow;
        const newCol = currentEmpty.col + dCol;
        
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
          possibleMoves.push({ row: newRow, col: newCol });
        }
      });
      
      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        
        // Swap
        currentGrid[currentEmpty.row][currentEmpty.col] = currentGrid[randomMove.row][randomMove.col];
        currentGrid[randomMove.row][randomMove.col] = null;
        currentEmpty = randomMove;
      }
    }
    
    return currentGrid;
  }, [gridSize, findEmptyPosition]);



return (
  <div></div>
);
};

export default SlidingTilesPage;