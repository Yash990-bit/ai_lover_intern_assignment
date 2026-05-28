"use client";

import React from 'react';
import Link from 'next/link';
import { HomeIcon, AcademicCapIcon, FolderIcon, ChartBarIcon, BookmarkIcon } from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#09090b] border-r border-[#27272a] hidden md:block">
      <nav className="h-full flex flex-col py-6 px-3 space-y-1">
        <Link href="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <HomeIcon className="h-5 w-5 mr-3" /> Home
        </Link>
        <Link href="/dashboard" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <ChartBarIcon className="h-5 w-5 mr-3" /> Dashboard
        </Link>
        <Link href="/opportunities" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <AcademicCapIcon className="h-5 w-5 mr-3" /> Opportunities
        </Link>
        <Link href="/saved" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <BookmarkIcon className="h-5 w-5 mr-3" /> Saved
        </Link>
        <Link href="/tracker" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <FolderIcon className="h-5 w-5 mr-3" /> Tracker
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
