'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-transparent text-slate-800">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 space-y-6">
        <div className="relative flex justify-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-4xl font-black shadow-[0_8px_20px_rgba(37,99,235,0.25)] animate-bounce">
            404
          </div>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Page Not Found</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          The opportunity or view you are looking for does not exist or has been relocated by the system.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex w-full justify-center py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-[0_4px_15px_rgba(37,99,235,0.2)] transition-all transform active:scale-95 text-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
