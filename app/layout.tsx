import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ScrapeScout AI — Global AI-Powered Opportunity Discovery',
  description:
    'Discover scholarships, fellowships, accelerators, grants, competitions, and more. Curated for students, founders, researchers, and creators worldwide.',
  keywords: [
    'scholarship', 'fellowship', 'accelerator', 'grant', 'startup', 'opportunity',
    'india', 'global', 'students', 'women founders',
  ],
  openGraph: {
    title: 'ScrapeScout AI',
    description: 'AI-Powered Global Opportunity Discovery',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-slate-950 text-white flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4">
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
      </body>
    </html>
  );
}
