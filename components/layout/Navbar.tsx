"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-zinc-950/75 backdrop-blur-md border-b border-zinc-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-xl font-bold tracking-tight text-white">
            Scrape<span className="text-emerald-500">Scout</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/opportunities" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Opportunities</Link>
          <Link href="/saved" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Saved</Link>
        </div>
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#09090b] border-t border-[#27272a]">
          <div className="px-4 py-4 space-y-2">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800">Dashboard</Link>
            <Link href="/opportunities" className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800">Opportunities</Link>
            <Link href="/saved" className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800">Saved</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
