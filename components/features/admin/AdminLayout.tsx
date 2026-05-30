'use client';

import { Suspense } from 'react';
import AdminSidebar from '@/components/features/admin/AdminSidebar';
import { RefreshCw, Bell, User } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats] = useState({ colleges: 12, branches: 22, cutoffs: 40, imports: 3 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !profile?.is_admin)) {
      router.push('/dashboard');
    }
  }, [user, profile, authLoading, router]);

  if (authLoading || !profile?.is_admin) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050816]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-blue-900/20 bg-[#060c1a]/50 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            {/* Live stats mini bar */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-lg bg-[#0B1120] border border-blue-900/30 text-xs">
              <span className="text-slate-400">
                <span className="text-blue-400 font-semibold">{stats.colleges}</span> colleges
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                <span className="text-cyan-400 font-semibold">{stats.branches}</span> branches
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                <span className="text-emerald-400 font-semibold">{stats.cutoffs.toLocaleString()}</span> cutoffs
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`w-8 h-8 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/30 transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/30 transition-all relative">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
            </button>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0B1120] border border-blue-900/30">
              <div className="w-6 h-6 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <User className="w-3 h-3 text-blue-400" />
              </div>
              <div className="hidden sm:block">
                <div className="text-white text-xs font-medium">Admin</div>
                <div className="text-slate-500 text-[10px]">admin@rankpilot.in</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#050816] via-[#070d1a] to-[#050816]">
          <Suspense fallback={<div className="p-6 animate-in">Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

