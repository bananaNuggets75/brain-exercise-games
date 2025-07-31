'use client';
import React, { useState, useEffect, useCallback } from 'react';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const WORDS = [
  'CRANE', 'APPLE', 'BREAD', 'HOUSE', 'PLANT', 'STONE', 'BEACH', 'NIGHT', 'LIGHT', 'WORLD',
  'WATER', 'FLAME', 'SPACE', 'DREAM', 'HEART', 'PEACE', 'SMILE', 'MUSIC', 'DANCE', 'MAGIC',
  'BRAVE', 'SWIFT', 'SHARP', 'CLEAR', 'FRESH', 'STORM', 'GHOST', 'QUEEN', 'PRIDE', 'GRACE',
  'SOUND', 'VOICE', 'LAUGH', 'SHINE', 'CHARM', 'POWER', 'TRUST', 'YOUTH', 'TRUTH', 'FAITH'
];

interface GameStats {
  played: number;
  won: number;
  streak: number;
}

// to do: do not enter if it is not a word (random letters)
// store the game stats
// get a library of words from an API or a file

type GameStatus = 'playing' | 'won' | 'lost';
type LetterStatus = 'correct' | 'present' | 'absent';

const WordlePage: React.FC = () => {
  const [targetWord, setTargetWord] = useState<string>(
    WORDS[Math.floor(Math.random() * WORDS.length)]
  );
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [usedLetters, setUsedLetters] = useState<{ [key: string]: LetterStatus }>({});
  const [shakeRow, setShakeRow] = useState<number>(-1);
  const [flipRow, setFlipRow] = useState<number>(-1);
  const [stats, setStats] = useState<GameStats>({ played: 0, won: 0, streak: 0 });


  const updateUsedLetters = useCallback((guess: string) => {
    const updatedLetters = { ...usedLetters };
    const targetArray = targetWord.split('');
    const guessArray = guess.split('');
  
    // First pass: Mark correct letters
    guessArray.forEach((char, idx) => {
      if (targetArray[idx] === char) {
        updatedLetters[char] = 'correct';
        targetArray[idx] = '_';
        guessArray[idx] = '*';
      }
    });
  
    // Second pass: Mark present or absent
    guessArray.forEach((char) => {
      if (char !== '*' && !updatedLetters[char]) {
        if (targetArray.includes(char)) {
          updatedLetters[char] = 'present';
          targetArray[targetArray.indexOf(char)] = '_';
        } else {
          updatedLetters[char] = 'absent';
        }
      }
    });
  
    setUsedLetters(updatedLetters);
  }, [usedLetters, targetWord]);

  
  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(-1), 600);
      return;
    }

    if (guesses.length >= MAX_ATTEMPTS || gameStatus !== 'playing') return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setFlipRow(guesses.length);
    
    setTimeout(() => {
      updateUsedLetters(currentGuess);
      setFlipRow(-1);
    }, 300);

    if (currentGuess === targetWord) {
      setTimeout(() => {
        setGameStatus('won');
        setStats(prev => ({ 
          played: prev.played + 1, 
          won: prev.won + 1, 
          streak: prev.streak + 1 
        }));
      }, 600);
    } else if (newGuesses.length === MAX_ATTEMPTS) {
      setTimeout(() => {
        setGameStatus('lost');
        setStats(prev => ({ 
          played: prev.played + 1, 
          won: prev.won, 
          streak: 0 
        }));
      }, 600);
    }

    setCurrentGuess('');
  }, [currentGuess, guesses, gameStatus, targetWord, updateUsedLetters]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameStatus !== 'playing') return;

      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameStatus, currentGuess, submitGuess]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key.toUpperCase());
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);
  

  const getTileClass = (char: string, idx: number, rowIdx: number): string => {
    if (!char) return 'tile';
    
    // Don't show colors for current guess
    if (rowIdx >= guesses.length) return 'tile filled';

    if (targetWord[idx] === char) return 'tile correct';
    if (targetWord.includes(char)) return 'tile present';
    return 'tile absent';
  };

  const getKeyClass = (key: string): string => {
    const baseClass = key === 'ENTER' || key === 'BACKSPACE' ? 'key special' : 'key';
    
    if (usedLetters[key] === 'correct') return `${baseClass} correct`;
    if (usedLetters[key] === 'present') return `${baseClass} present`;
    if (usedLetters[key] === 'absent') return `${baseClass} absent`;
    return baseClass;
  };

  const resetGame = () => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setUsedLetters({});
    setShakeRow(-1);
    setFlipRow(-1);
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  return (
    <div className="wordle-container">
      <div className="wordle-header">
        <h1 className="wordle-title">WORDLE</h1>
        <p className="wordle-subtitle">Guess the 5-letter word in 6 tries</p>
        <div className="wordle-stats">
          <span>Played: {stats.played}</span>
          <span>Won: {stats.won}</span>
          <span>Streak: {stats.streak}</span>
        </div>
      </div>

      <div className="game-board">
        <div className="guess-grid">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            const guess = guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : '');
            const isShaking = shakeRow === rowIdx;
            const isFlipping = flipRow === rowIdx;

            return (
              <div 
                key={rowIdx} 
                className={`guess-row ${isShaking ? 'shake' : ''} ${isFlipping ? 'flip' : ''}`}
              >
                {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className={getTileClass(guess[colIdx], colIdx, rowIdx)}
                  >
                    {guess[colIdx] || ''}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="keyboard">
        <div className="keyboard-container">
          {keyboardRows.map((row, rowIdx) => (
            <div key={rowIdx} className="keyboard-row">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={getKeyClass(key)}
                  disabled={gameStatus !== 'playing'}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {gameStatus === 'won' && (
        <div className="status-message status-won">
          <div className="status-title">🎉 Congratulations!</div>
          <div className="status-text">You guessed the word in {guesses.length} tries!</div>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="status-message status-lost">
          <div className="status-title">😞 Game Over</div>
          <div className="status-text">The word was <strong>{targetWord}</strong></div>
        </div>
      )}

      <button className="new-game-btn" onClick={resetGame}>
        🎮 New Game
      </button>
    </div>
  );
};

export default WordlePage;