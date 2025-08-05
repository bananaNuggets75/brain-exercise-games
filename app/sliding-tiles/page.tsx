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

  // Start new game
  const startNewGame = useCallback(async () => {
    setIsShuffling(true);
    setGameStatus('playing');
    setMoves(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setSlidingTile(null);
    
    const solvedGrid = createSolvedGrid(gridSize);
    
    // Small delay to show shuffling state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const shuffledGrid = shufflePuzzle(solvedGrid);
    
    // Ensure the puzzle isn't already solved after shuffling
    let finalGrid = shuffledGrid;
    while (isPuzzleSolved(finalGrid)) {
      finalGrid = shufflePuzzle(solvedGrid);
    }
    
    setGrid(finalGrid);
    setEmptyPos(findEmptyPosition(finalGrid));
    setIsShuffling(false);
  }, [gridSize, createSolvedGrid, shufflePuzzle, isPuzzleSolved, findEmptyPosition]);

  // Handle tile click
  const handleTileClick = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing' || isShuffling) return;
    
    const newGrid = moveTile(row, col);
    if (newGrid) {
      setSlidingTile({ row, col });
      setTimeout(() => setSlidingTile(null), 200);
      
      setGrid(newGrid);
      setEmptyPos(findEmptyPosition(newGrid));
      setMoves(prev => prev + 1);
      
      // Check if puzzle is solved
      if (isPuzzleSolved(newGrid)) {
        setGameStatus('won');
        const timeElapsed = elapsedTime;
        setStats(prev => ({
          played: prev.played + 1,
          won: prev.won + 1,
          bestMoves: prev.bestMoves === null ? moves + 1 : Math.min(prev.bestMoves, moves + 1),
          bestTime: prev.bestTime === null ? timeElapsed : Math.min(prev.bestTime, timeElapsed)
        }));
        setShowWinModal(true);
      }
    }
  }, [gameStatus, isShuffling, moveTile, findEmptyPosition, isPuzzleSolved, moves, elapsedTime]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing' || isShuffling) return;
      
      const { row, col } = emptyPos;
      let targetRow = row;
      let targetCol = col;
      
      switch (e.key) {
        case 'ArrowUp':
          targetRow = row + 1;
          break;
        case 'ArrowDown':
          targetRow = row - 1;
          break;
        case 'ArrowLeft':
          targetCol = col + 1;
          break;
        case 'ArrowRight':
          targetCol = col - 1;
          break;
        default:
          return;
      }
      
      if (targetRow >= 0 && targetRow < gridSize && targetCol >= 0 && targetCol < gridSize) {
        handleTileClick(targetRow, targetCol);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, isShuffling, emptyPos, gridSize, handleTileClick]);

  // Initialize game on mount and grid size change
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Format time
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Get tile class
  const getTileClass = (row: number, col: number, value: TileValue): string => {
    const classes = ['tile'];
    
    if (value === null) {
      classes.push('empty');
    } else {
      classes.push('filled');
      if (isValidMove(grid, row, col)) {
        classes.push('movable');
      }
      if (slidingTile?.row === row && slidingTile?.col === col) {
        classes.push('sliding');
      }
    }
    
    return classes.join(' ');
  };



  return (
    <div className="sliding-tiles-container">
      <div className="sliding-tiles-header">
        <h1 className="sliding-tiles-title">SLIDING TILES</h1>
        <p className="sliding-tiles-subtitle">Arrange the numbers in order</p>
        
        <div className="game-controls">
          <div className="size-selector">
            <label>Grid Size:</label>
            <select 
              value={gridSize} 
              onChange={(e) => setGridSize(parseInt(e.target.value) as GridSize)}
              disabled={isShuffling}
            >
              <option value={3}>3×3 (8‑puzzle)</option>
              <option value={4}>4×4 (15‑puzzle)</option>
              <option value={5}>5×5 (24‑puzzle)</option>
            </select>
          </div>
          
          <div className="game-info">
            <span>Moves: {moves}</span>
            <span>Time: {formatTime(elapsedTime)}</span>
          </div>
          
          <div className="game-stats">
            <span>Played: {stats.played}</span>
            <span>Won: {stats.won}</span>
            {stats.bestMoves !== null && <span>Best Moves: {stats.bestMoves}</span>}
            {stats.bestTime !== null && <span>Best Time: {formatTime(stats.bestTime)}</span>}
          </div>
        </div>
      </div>
  
      <div className="game-board">
        {isShuffling ? (
          <div className="shuffling-indicator">
            <div className="shuffle-spinner"></div>
            <p>Shuffling puzzle...</p>
          </div>
        ) : (
          <div className={`tiles-grid grid-${gridSize}`}>
            {grid.map((row, rowIndex) =>
              row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getTileClass(rowIndex, colIndex, value)}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                >
                  {value !== null && <span className="tile-number">{value}</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
  
      <div className="game-controls-bottom">
        <div className="action-buttons">
          <button
            onClick={() => setShowNewGameModal(true)}
            className="action-button new-game"
            disabled={isShuffling}
          >
            🎮 New Game
          </button>
          
          <button
            onClick={startNewGame}
            className="action-button shuffle"
            disabled={isShuffling}
          >
            🔀 Shuffle
          </button>
        </div>
        
        <div className="hint-text">
          Click tiles adjacent to the empty space to move them. Use arrow keys to move tiles into the empty space.
        </div>
      </div>
      {showNewGameModal && (
      <div className="modal-overlay">
        <div className="modal">
          <h3>Start New Game</h3>
          <p>Select grid size for a new puzzle:</p>
          <div className="size-options">
            {([3, 4, 5] as GridSize[]).map(size => (
              <button
                key={size}
                onClick={() => {
                  setGridSize(size);
                  setShowNewGameModal(false);
                  startNewGame();
                }}
                className="modal-button confirm"
              >
                {size}×{size} ({size === 3 ? '8' : size === 4 ? '15' : '24'}‑puzzle)
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewGameModal(false)}
            className="modal-button cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    </div>
  );
  
};

export default SlidingTilesPage;