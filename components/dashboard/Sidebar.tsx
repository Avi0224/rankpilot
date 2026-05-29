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

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-200 bg-[#060c1a] border-r border-blue-900/20',
        collapsed ? 'w-16' : 'w-52'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 px-3 border-b border-blue-900/20', collapsed ? 'justify-center' : 'gap-2')}>
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 glow-blue">
          <Zap className="w-3.5 h-3.5 text-white" fill="white" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-sm tracking-tight">
            Rank<span className="gradient-text">Pilot</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href.split('?')[0] && !item.href.includes('?');
          const isActiveQuery = item.href.includes('?') && pathname === item.href.split('?')[0];

          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-blue-600/15 text-blue-300 border border-blue-500/25'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors')} />
              {!collapsed && <span className="text-xs">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-2 border-t border-blue-900/20">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 w-full transition-all',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
