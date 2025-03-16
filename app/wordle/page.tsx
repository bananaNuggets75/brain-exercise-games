'use client';
import React, { useState } from 'react';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const TARGET_WORD = 'CRANE'; // You can randomize this later or fetch from an API

const WordlePage: React.FC = () => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= WORD_LENGTH) {
      setCurrentGuess(e.target.value.toUpperCase());
    }
  };

  const handleSubmit = () => {
    if (currentGuess.length !== WORD_LENGTH || gameStatus !== 'playing') return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === TARGET_WORD) {
      setGameStatus('won');
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameStatus('lost');
    }
  };

  const getLetterFeedback = (guess: string) => {
    return guess.split('').map((char, index) => {
      if (char === TARGET_WORD[index]) return '🟩'; // Correct letter & position
      if (TARGET_WORD.includes(char)) return '🟨'; // Correct letter, wrong position
      return '⬛'; // Incorrect letter
    }).join('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Wordle Game</h1>

      {guesses.map((guess, idx) => (
        <div key={idx} className="text-xl font-mono">{getLetterFeedback(guess)}</div>
      ))}

      {gameStatus === 'playing' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={currentGuess}
            onChange={handleInputChange}
            className="border p-2 rounded text-xl uppercase text-center w-32"
            maxLength={WORD_LENGTH}
            placeholder="Guess"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Enter
          </button>
        </div>
      )}

      {gameStatus === 'won' && <div className="text-green-500 text-xl">🎉 You won!</div>}
      {gameStatus === 'lost' && (
        <div className="text-red-500 text-xl">
          ❌ You lost! The word was <strong>{TARGET_WORD}</strong>.
        </div>
      )}
    </div>
  );
};

export default WordlePage;
