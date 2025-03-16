'use client';
import React, { useState } from 'react';
import clsx from 'clsx';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const TARGET_WORD = 'CRANE';
const KEYS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

const WordlePage: React.FC = () => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [usedLetters, setUsedLetters] = useState<{ [key: string]: string }>({});

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'Enter') {
      if (currentGuess.length === WORD_LENGTH) submitGuess();
    } else if (key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const submitGuess = () => {
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    updateUsedLetters(currentGuess);

    if (currentGuess === TARGET_WORD) {
      setGameStatus('won');
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameStatus('lost');
    }

    setCurrentGuess('');
  };

  const updateUsedLetters = (guess: string) => {
    const updatedLetters = { ...usedLetters };

    guess.split('').forEach((char, idx) => {
      if (TARGET_WORD[idx] === char) {
        updatedLetters[char] = 'correct';
      } else if (TARGET_WORD.includes(char)) {
        if (updatedLetters[char] !== 'correct') updatedLetters[char] = 'present';
      } else {
        updatedLetters[char] = 'absent';
      }
    });

    setUsedLetters(updatedLetters);
  };

  const getTileColor = (char: string, idx: number) => {
    if (!guesses.includes(currentGuess)) return 'border-gray-500';

    if (TARGET_WORD[idx] === char) return 'bg-green-500';
    if (TARGET_WORD.includes(char)) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Wordle Clone</h1>

      {/* Guess grid */}
      <div className="grid grid-rows-6 gap-2">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
          const guess = guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : '');

          return (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className={clsx(
                    'w-12 h-12 border rounded-md flex items-center justify-center text-xl font-bold uppercase transition-transform duration-300 ease-in-out',
                    guess[colIdx] ? getTileColor(guess[colIdx], colIdx) : 'border-gray-500'
                  )}
                >
                  {guess[colIdx] || ''}
                </div>
              ))}
            </div>
          );
        })}
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
                  gameStatus !== 'playing' ? 'bg-gray-500 opacity-50' :
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

        {/* Control buttons */}
        <div className="flex justify-center gap-1">
          <button
            onClick={() => handleKeyPress('Backspace')}
            className="p-2 rounded bg-red-500 text-white font-bold w-20"
            disabled={gameStatus !== 'playing'}
          >
            ⌫
          </button>
          <button
            onClick={() => handleKeyPress('Enter')}
            className="p-2 rounded bg-blue-500 text-white font-bold w-20"
            disabled={gameStatus !== 'playing'}
          >
            Enter
          </button>
        </div>
      </div>

      {/* Game Status */}
      {gameStatus === 'won' && (
        <div className="text-green-600 text-2xl">🎉 You won!</div>
      )}
      {gameStatus === 'lost' && (
        <div className="text-red-600 text-2xl">
          ❌ You lost! The word was <strong>{TARGET_WORD}</strong>.
        </div>
      )}
    </div>
  );
};

export default WordlePage;
