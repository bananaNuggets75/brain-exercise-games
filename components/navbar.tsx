import React from 'react';
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white shadow">
      <nav className="flex items-center justify-between p-4">
        <div className="nav-container">
          <ul className="nav-list">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/wordle">Wordle</Link>
            </li>
            <li>
              <Link href="/sudoku">Sudoku</Link>
            </li>
            <li>
              <Link href="/sliding-tiles">Sliding Tiles</Link>
            </li>
            <li>
              <Link href="/human-benchmark">Human Benchmark</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
