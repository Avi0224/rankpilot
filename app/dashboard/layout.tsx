'use client';

import Sidebar from '@/components/features/dashboard/Sidebar';
import ComparisonBar from '@/components/features/dashboard/ComparisonBar';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search, User, Menu, LogOut, Zap } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

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

            <Link href="/" className="md:hidden flex items-center gap-2 group">
              <div className="relative w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105">
                <Image 
                  src="/logo.svg" 
                  alt="RankPilot JEE Logo" 
                  width={28} 
                  height={28} 
                  className="object-contain"
                />
              </div>
              <span className="text-white font-black text-sm tracking-tight">
                RankPilot <span className="gradient-text">JEE</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="hidden sm:flex w-8 h-8 rounded-lg bg-[#0B1120] border border-blue-900/30 items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/30 transition-all relative">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
            </button>
            
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-bold text-white leading-none">
                      {profile?.name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Aspirant
                    </span>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 cursor-pointer hover:bg-blue-600/30 transition-all">
                          <User className="w-4 h-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#0B1120] border-blue-900/30 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
                        Logged in as {user.email}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={signOut}
                    className="w-8 h-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] h-8 px-3 md:text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-blue-600/20">
                    Sign In
                  </Button>
                </Link>
              )
            )}
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

