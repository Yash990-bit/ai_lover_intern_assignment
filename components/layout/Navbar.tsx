"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/opportunities', label: 'Opportunities' },
    { href: '/saved', label: 'Saved' },
    { href: '/tracker', label: 'Tracker' },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 shadow-sm transition-all duration-200 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-[0_4px_12px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-xl font-extrabold tracking-tight text-blue-600">
            Data<span className="text-orange-500">Scout</span> <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full ml-1 uppercase tracking-wider">AI</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-all duration-200 relative py-1 ${
                  isActive
                    ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
