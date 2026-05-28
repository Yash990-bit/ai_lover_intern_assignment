import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-surface/70 backdrop-blur-xl border-b border-border-glass shadow-lg shadow-accent-glow/10">
      <div className="flex items-center gap-4">
        {/* Using a visual placeholder logo instead of base64 to keep code clean */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">DataScout AI</span>
        </Link>
      </div>

      <nav className="hidden md:flex gap-8">
        <Link href="/" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer relative after:absolute after:bottom-[-26px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-t-full">
          Dashboard
        </Link>
        <Link href="/saved" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          My Tracker
        </Link>
      </nav>

      <button className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform hover:scale-105 active:scale-95">
        My Profile
      </button>
    </header>
  );
}
