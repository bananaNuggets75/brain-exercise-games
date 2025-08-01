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
