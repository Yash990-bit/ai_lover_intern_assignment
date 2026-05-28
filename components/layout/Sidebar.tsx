"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, AcademicCapIcon, BookmarkIcon, FolderIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { href: '/opportunities', label: 'Opportunities', icon: AcademicCapIcon },
    { href: '/saved', label: 'Saved', icon: BookmarkIcon },
    { href: '/tracker', label: 'Tracker', icon: FolderIcon },
  ];

  return (
    <aside className="w-64 bg-white/45 backdrop-blur-xl border-r border-slate-200/80 hidden md:block h-[calc(100vh-4rem)] sticky top-0">
      <nav className="h-full flex flex-col py-6 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600/10 text-blue-600 font-bold shadow-[0_4px_12px_-2px_rgba(37,99,235,0.12)]'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 shrink-0 transition-transform group-hover:scale-105 ${
                isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
              }`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
