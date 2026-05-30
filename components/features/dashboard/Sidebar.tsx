'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, GitCompare,
  TrendingUp, Bookmark, ListOrdered, BarChart3,
  Settings, ChevronLeft, Menu
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils';

const navItems = [
  { label: 'Predictor', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Saved Colleges', icon: Bookmark, href: '/dashboard/saved' },
  { label: 'Compare', icon: GitCompare, href: '/dashboard/compare' },
  { label: 'ROI Analytics', icon: TrendingUp, href: '/dashboard/roi' },
  { label: 'Choice Filling', icon: ListOrdered, href: '/dashboard/choice-filling' },
  { label: 'Cutoff Trends', icon: BarChart3, href: '/dashboard/trends' },
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
      <Link href="/" className={cn('flex items-center h-14 px-4 border-b border-blue-900/20 group', finalCollapsed ? 'justify-center' : 'gap-3')}>
        <div className="relative w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105">
          <Image 
            src="/logo.svg" 
            alt="RankPilot JEE Logo" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>
        {!finalCollapsed && (
          <span className="text-white font-black text-lg tracking-tight">
            RankPilot <span className="gradient-text">JEE</span>
          </span>
        )}
      </Link>

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

