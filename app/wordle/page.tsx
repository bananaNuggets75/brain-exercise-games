'use client';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const WORDS = ['CRANE', 'APPLE', 'BREAD', 'HOUSE', 'PLANT'];
const KEYS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

const WordlePage: React.FC = () => {
  const [targetWord, setTargetWord] = useState<string>(WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [usedLetters, setUsedLetters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key.toUpperCase());
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameStatus]);

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const submitGuess = () => {
    if (guesses.length >= MAX_ATTEMPTS || gameStatus !== 'playing') return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    updateUsedLetters(currentGuess);

    if (currentGuess === targetWord) {
      setGameStatus('won');
    } else if (newGuesses.length === MAX_ATTEMPTS) {
      setGameStatus('lost');
    }

    setCurrentGuess('');
  };

  const updateUsedLetters = (guess: string) => {
    const updatedLetters = { ...usedLetters };
    const targetArray = targetWord.split('');
    const guessArray = guess.split('');

    // First pass: Mark correct letters
    guessArray.forEach((char, idx) => {
      if (targetArray[idx] === char) {
        updatedLetters[char] = 'correct';
        targetArray[idx] = '_'; // Mark as used
        guessArray[idx] = '*'; // Avoid duplicate counting
      }
    });

    // Second pass: Mark present or absent
    guessArray.forEach((char) => {
      if (char !== '*' && targetArray.includes(char)) {
        updatedLetters[char] = 'present';
        targetArray[targetArray.indexOf(char)] = '_';
      } else if (char !== '*' && !targetArray.includes(char)) {
        updatedLetters[char] = 'absent';
      }
    });

    setUsedLetters(updatedLetters);
  };

  const getTileColor = (char: string, idx: number) => {
    if (!char) return 'border-gray-500';

    if (targetWord[idx] === char) return 'bg-green-500 text-white';
    if (targetWord.includes(char)) return 'bg-yellow-500 text-white';
    return 'bg-gray-400 text-white';
  };

  const resetGame = () => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setUsedLetters({});
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-gray-900">
      <h1 className="text-3xl font-bold text-white">Wordle Clone</h1>

      {/* Guess Container */}
      <div className="bg-gray-800 p-4 rounded-md shadow-md">
        <div className="grid grid-rows-6 gap-2">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            const guess = guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : '');

            return (
              <div key={rowIdx} className="grid grid-cols-5 gap-2">
                {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className={clsx(
                      'w-14 h-14 border rounded-md flex items-center justify-center text-2xl font-bold uppercase transition-transform duration-300 ease-in-out',
                      guess[colIdx] ? getTileColor(guess[colIdx], colIdx) : 'border-gray-600 bg-gray-700'
                    )}
                  >
                    {guess[colIdx] || ''}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* On-screen keyboard */}
      <div className="mt-4 grid grid-rows-3 gap-2">
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, idx) => (
          <div key={idx} className="flex justify-center gap-1">
            {row.split('').map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={clsx(
                  'p-2 w-10 rounded font-bold text-white',
                  usedLetters[key] === 'correct' ? 'bg-green-500' :
                  usedLetters[key] === 'present' ? 'bg-yellow-500' :
                  usedLetters[key] === 'absent' ? 'bg-gray-500' :
                  'bg-gray-700'
                )}
                disabled={gameStatus !== 'playing'}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Control buttons */}
      <div className="flex justify-center gap-2 mt-2">
        <button onClick={resetGame} className="p-2 bg-gray-700 text-white rounded">
          🔄 Reset
        </button>
        <button onClick={() => handleKeyPress('ENTER')} className="p-2 bg-blue-500 text-white rounded">
          Enter
        </button>
      </div>

      {/* Game Status */}
      {gameStatus === 'won' && (
        <div className="text-green-400 text-2xl mt-4">🎉 You won!</div>
      )}
      {gameStatus === 'lost' && (
        <div className="text-red-400 text-2xl mt-4">
          ❌ You lost! The word was <strong>{targetWord}</strong>.
        </div>
      )}
    </div>
  );
};

export default WordlePage;
