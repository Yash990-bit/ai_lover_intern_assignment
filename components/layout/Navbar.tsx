import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SunIcon, MoonIcon, MenuIcon, XIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">AI Scout</div>
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/opportunities" className="text-sm text-text-secondary hover:text-primary transition-colors">Opportunities</Link>
          <Link href="/saved" className="text-sm text-text-secondary hover:text-primary transition-colors">Saved</Link>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            {darkMode ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-md hover:bg-white/10" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <XIcon className="h-6 w-6 text-text-primary" /> : <MenuIcon className="h-6 w-6 text-text-primary" />}
        </button>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface/90 backdrop-blur-lg border-t border-border-glass">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base text-text-secondary hover:text-primary hover:bg-white/5">Dashboard</Link>
            <Link href="/opportunities" className="block px-3 py-2 rounded-md text-base text-text-secondary hover:text-primary hover:bg-white/5">Opportunities</Link>
            <Link href="/saved" className="block px-3 py-2 rounded-md text-base text-text-secondary hover:text-primary hover:bg-white/5">Saved</Link>
            <button onClick={toggleTheme} className="w-full text-left px-3 py-2 rounded-md text-base text-text-secondary hover:text-primary hover:bg-white/5">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
