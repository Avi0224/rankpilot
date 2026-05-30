'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, signOut, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Predictor', href: '/dashboard' },
    { label: 'Compare', href: '/compare' },
    { label: 'ROI Analytics', href: '/roi' },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-[#050816]/80 backdrop-blur-md border-b border-blue-900/20 shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image 
                src="/logo.svg" 
                alt="RankPilot JEE Logo" 
                width={36} 
                height={36} 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-white font-black text-xl tracking-tight">
              RankPilot <span className="gradient-text">JEE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-slate-400 hover:text-white text-sm h-9 gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 cursor-pointer hover:bg-blue-600/20 transition-all">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                              {(profile?.name || user.email || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-xs font-bold truncate max-w-[100px]">
                              {profile?.name || user.email?.split('@')[0]}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0B1120] border-blue-900/30 text-white text-[10px] font-bold uppercase tracking-widest">
                          Logged in
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button 
                      onClick={signOut}
                      variant="ghost" 
                      className="text-slate-500 hover:text-red-400 p-2"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button variant="ghost" className="text-slate-400 hover:text-white text-sm h-9">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 h-9 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <button
            className="md:hidden text-slate-400 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0B1120] border-t border-blue-900/20 px-4 py-4 space-y-2"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-blue-900/10 space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-blue-400 font-medium"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
