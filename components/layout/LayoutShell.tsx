"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  return (
    <>
      <Navbar />
      {/* Add top padding equal to header height (h-16) so content isn’t hidden behind the fixed header */}
      <div className="pt-16 flex flex-1 overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Sidebar should take full height of the remaining viewport */}
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 bg-transparent text-slate-800">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};

export default LayoutShell;
