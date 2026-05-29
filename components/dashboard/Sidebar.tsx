'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, LayoutDashboard, Search, GitCompare,
  TrendingUp, Bookmark, ListOrdered, BarChart3,
  Settings, ChevronLeft, Menu
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Predictor', icon: Search, href: '/dashboard?tab=predictor' },
  { label: 'Compare', icon: GitCompare, href: '/compare' },
  { label: 'ROI Analytics', icon: TrendingUp, href: '/roi' },
  { label: 'Saved Colleges', icon: Bookmark, href: '/saved' },
  { label: 'Choice Filling', icon: ListOrdered, href: '/choice-filling' },
  { label: 'Cutoff Trends', icon: BarChart3, href: '/dashboard?tab=trends' },
  { label: 'Settings', icon: Settings, href: '/dashboard?tab=settings' },
];

interface SidebarProps {
  isMobile?: boolean;
  onNavItemClick?: () => void;
}

export default function Sidebar({ isMobile, onNavItemClick }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const finalCollapsed = isMobile ? false : collapsed;

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-200 bg-[#060c1a] border-r border-blue-900/20',
        finalCollapsed ? 'w-16' : 'w-52',
        isMobile && 'w-full border-r-0'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 px-4 border-b border-blue-900/20', finalCollapsed ? 'justify-center' : 'gap-2.5')}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 glow-blue shadow-lg shadow-blue-600/20">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        {!finalCollapsed && (
          <span className="text-white font-bold text-base tracking-tight">
            Rank<span className="gradient-text">Pilot</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href.split('?')[0] && !item.href.includes('?');
          const isActiveQuery = item.href.includes('?') && pathname === item.href.split('?')[0];

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavItemClick}
              title={finalCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
                finalCollapsed && 'justify-center px-0'
              )}
            >
              <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors')} />
              {!finalCollapsed && <span className="text-xs">{item.label}</span>}
              {isActive && !finalCollapsed && (
                <div className="absolute right-2 w-1 h-1 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions / Settings */}
      {!isMobile && (
        <div className="px-3 py-3 border-t border-blue-900/20">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 w-full transition-all group',
              finalCollapsed && 'justify-center px-0'
            )}
          >
            {finalCollapsed ? <Menu className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />}
            {!finalCollapsed && 'Collapse Menu'}
          </button>
        </div>
      )}
    </aside>
  );
}
