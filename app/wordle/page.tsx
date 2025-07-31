'use client';
import React, { useState, useEffect, useCallback } from 'react';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

// Expanded word list for better gameplay
const WORDS = [
  'CRANE', 'APPLE', 'BREAD', 'HOUSE', 'PLANT', 'STONE', 'BEACH', 'NIGHT', 'LIGHT', 'WORLD',
  'WATER', 'FLAME', 'SPACE', 'DREAM', 'HEART', 'PEACE', 'SMILE', 'MUSIC', 'DANCE', 'MAGIC',
  'BRAVE', 'SWIFT', 'SHARP', 'CLEAR', 'FRESH', 'STORM', 'GHOST', 'QUEEN', 'PRIDE', 'GRACE',
  'SOUND', 'VOICE', 'LAUGH', 'SHINE', 'CHARM', 'POWER', 'TRUST', 'YOUTH', 'TRUTH', 'FAITH'
];

const WordlePage: React.FC = () => {
  const [targetWord, setTargetWord] = useState<string>(WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [usedLetters, setUsedLetters] = useState<{ [key: string]: string }>({});
  const [shakeRow, setShakeRow] = useState<number>(-1);
  const [flipRow, setFlipRow] = useState<number>(-1);
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0 });

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
    
    // Delay the letter updates to sync with flip animation
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
  }, [currentGuess, guesses, gameStatus, targetWord]);

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

  const updateUsedLetters = (guess: string) => {
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
  };

  const getTileColor = (char: string, idx: number, rowIdx: number) => {
    if (!char) return 'border-gray-600 bg-gray-800';
    
    // Don't show colors for current guess
    if (rowIdx >= guesses.length) return 'border-gray-500 bg-gray-700 text-white';

    if (targetWord[idx] === char) return 'bg-green-500 border-green-500 text-white';
    if (targetWord.includes(char)) return 'bg-yellow-500 border-yellow-500 text-white';
    return 'bg-gray-500 border-gray-500 text-white';
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

  const getKeyboardKeyStyle = (key: string) => {
    const baseStyle = 'px-3 py-4 rounded-md font-bold text-sm transition-all duration-200 hover:scale-105';
    
    if (usedLetters[key] === 'correct') return `${baseStyle} bg-green-500 text-white`;
    if (usedLetters[key] === 'present') return `${baseStyle} bg-yellow-500 text-white`;
    if (usedLetters[key] === 'absent') return `${baseStyle} bg-gray-500 text-gray-300`;
    return `${baseStyle} bg-gray-700 text-white hover:bg-gray-600`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">WORDLE</h1>
        <p className="text-gray-300">Guess the 5-letter word in 6 tries</p>
        <div className="flex gap-4 mt-2 text-sm text-gray-400">
          <span>Played: {stats.played}</span>
          <span>Won: {stats.won}</span>
          <span>Streak: {stats.streak}</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-gray-700">
        <div className="grid grid-rows-6 gap-2">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            const guess = guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : '');
            const isShaking = shakeRow === rowIdx;
            const isFlipping = flipRow === rowIdx;

            return (
              <div 
                key={rowIdx} 
                className={`grid grid-cols-5 gap-2 ${isShaking ? 'animate-pulse' : ''}`}
              >
                {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className={`
                      w-16 h-16 border-2 rounded-lg flex items-center justify-center 
                      text-2xl font-bold uppercase transition-all duration-300
                      ${getTileColor(guess[colIdx], colIdx, rowIdx)}
                      ${isFlipping ? 'animate-pulse' : ''}
                      ${guess[colIdx] ? 'scale-100' : 'scale-95'}
                    `}
                    style={{
                      animationDelay: isFlipping ? `${colIdx * 100}ms` : '0ms'
                    }}
                  >
                    {guess[colIdx] || ''}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtual Keyboard */}
      <div className="w-full max-w-lg">
        <div className="flex flex-col gap-2">
          {/* First row */}
          <div className="flex gap-1 justify-center">
            {'QWERTYUIOP'.split('').map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={getKeyboardKeyStyle(key)}
                disabled={gameStatus !== 'playing'}
              >
                {key}
              </button>
            ))}
          </div>
          
          {/* Second row */}
          <div className="flex gap-1 justify-center">
            {'ASDFGHJKL'.split('').map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={getKeyboardKeyStyle(key)}
                disabled={gameStatus !== 'playing'}
              >
                {key}
              </button>
            ))}
          </div>
          
          {/* Third row */}
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => handleKeyPress('ENTER')}
              className="px-4 py-4 bg-gray-700 text-white rounded-md font-bold text-sm hover:bg-gray-600 transition-all duration-200"
              disabled={gameStatus !== 'playing'}
            >
              ENTER
            </button>
            {'ZXCVBNM'.split('').map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={getKeyboardKeyStyle(key)}
                disabled={gameStatus !== 'playing'}
              >
                {key}
              </button>
            ))}
            <button
              onClick={() => handleKeyPress('BACKSPACE')}
              className="px-4 py-4 bg-gray-700 text-white rounded-md font-bold text-sm hover:bg-gray-600 transition-all duration-200"
              disabled={gameStatus !== 'playing'}
            >
              ⌫
            </button>
          </div>
        </div>
      </div>

      {/* Game Status */}
      {gameStatus === 'won' && (
        <div className="text-center bg-green-500/20 border border-green-500 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-green-400 text-2xl mb-2">🎉 Congratulations!</div>
          <p className="text-green-300">You guessed the word in {guesses.length} tries!</p>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="text-center bg-red-500/20 border border-red-500 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-red-400 text-2xl mb-2">😞 Game Over</div>
          <p className="text-red-300">The word was <strong className="text-white">{targetWord}</strong></p>
        </div>
      )}

      {/* Reset Button */}
      <button 
        onClick={resetGame} 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
      >
        🎮 New Game
      </button>
    </div>
  );
};

export default WordlePage;