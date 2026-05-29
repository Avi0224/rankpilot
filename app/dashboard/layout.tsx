'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import ComparisonBar from '@/components/dashboard/ComparisonBar';
import Link from 'next/link';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-blue-900/20 bg-[#060c1a]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-400">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-[#060c1a] border-blue-900/20">
                <Sidebar isMobile onNavItemClick={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center glow-blue">
                <span className="text-white font-bold text-[10px]">RP</span>
              </div>
            </div>

            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search colleges, branches..."
                className="bg-[#0B1120] border border-blue-900/30 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 w-56 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="hidden sm:flex w-8 h-8 rounded-lg bg-[#0B1120] border border-blue-900/30 items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/30 transition-all relative">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
            </button>
            
            <Link href="/dashboard?tab=settings" className="hidden sm:block">
              <div className="w-8 h-8 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                <User className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link href="/auth">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] h-8 px-3 md:text-xs">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-none">
          {children}
        </main>

        {/* Floating Comparison Bar */}
        <ComparisonBar />
      </div>
    </div>
  );
}
