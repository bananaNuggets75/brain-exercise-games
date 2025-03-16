import React from 'react';
import Link from "next/link";

export default function Navbar() {
    return (
<header className="bg-white shadow">
    <nav className="flex items-center justify-between p-4">
        <div className="flex items-center lg:flex-1">
        <ul className="flex space-x-6 text-gray-700">
          <li>
            <Link href="/" className="hover:text-blue-500">
              Home
            </Link>
          </li>
          <li>
            <Link href="/wordle" className="hover:text-blue-500">
              Wordle
            </Link>
          </li>
          <li>
            <Link href="/sudoku" className="hover:text-blue-500">
              Sudoku
            </Link>
          </li>
          <li>
            <Link href="/sliding-tiles" className="hover:text-blue-500">
               Sliding Tiles
            </Link>
          </li>
          <li>
            <Link href="/human-benchmark" className="hover:text-blue-500">
              Human Benchmark
            </Link>
          </li>
        </ul>
        </div>
    </nav>
</header>
    );
}