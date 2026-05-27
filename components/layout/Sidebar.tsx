import React from 'react';
import Link from 'next/link';
import { HomeIcon, AcademicCapIcon, FolderIcon, ChartBarIcon, BookmarkIcon } from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-surface/80 backdrop-blur-xl border-r border-border-glass hidden md:block">
      <nav className="h-full flex flex-col py-6">
        <Link href="/" className="flex items-center px-4 py-2 text-text-secondary hover:text-primary hover:bg-white/5 transition-colors">
          <HomeIcon className="h-5 w-5 mr-2" /> Home
        </Link>
        <Link href="/dashboard" className="flex items-center px-4 py-2 text-text-secondary hover:text-primary hover:bg-white/5 transition-colors">
          <ChartBarIcon className="h-5 w-5 mr-2" /> Dashboard
        </Link>
        <Link href="/opportunities" className="flex items-center px-4 py-2 text-text-secondary hover:text-primary hover:bg-white/5 transition-colors">
          <AcademicCapIcon className="h-5 w-5 mr-2" /> Opportunities
        </Link>
        <Link href="/saved" className="flex items-center px-4 py-2 text-text-secondary hover:text-primary hover:bg-white/5 transition-colors">
          <BookmarkIcon className="h-5 w-5 mr-2" /> Saved
        </Link>
        <Link href="/tracker" className="flex items-center px-4 py-2 text-text-secondary hover:text-primary hover:bg-white/5 transition-colors">
          <FolderIcon className="h-5 w-5 mr-2" /> Tracker
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
