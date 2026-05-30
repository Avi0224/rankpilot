'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Upload, History, CheckCircle2, Building2,
  GitBranch, BarChart3, FileText, Settings, ChevronLeft, Menu,
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils';

const adminNavItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'Upload Dataset', icon: Upload, href: '/admin/upload' },
  { label: 'Import History', icon: History, href: '/admin/history' },
  { label: 'Data Validation', icon: CheckCircle2, href: '/admin/validation' },
  { label: 'College Database', icon: Building2, href: '/admin/colleges' },
  { label: 'Branch Mapping', icon: GitBranch, href: '/admin/branches' },
  { label: 'Cutoff Records', icon: BarChart3, href: '/admin/cutoffs' },
  { label: 'Import Logs', icon: FileText, href: '/admin/logs' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-200 bg-[#060c1a] border-r border-blue-900/20',
        collapsed ? 'w-16' : 'w-52'
      )}
    >
      {/* Logo / Back */}
      <div className={cn('flex items-center h-14 px-3 border-b border-blue-900/20', collapsed ? 'justify-center' : 'gap-2')}>
        <Link href="/" className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 glow-blue hover:bg-blue-500 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 text-white" />
        </Link>
        {!collapsed && (
          <div className="flex-1">
            <span className="text-white font-bold text-sm">Admin Portal</span>
            <span className="block text-slate-500 text-[10px] uppercase tracking-wider">Data Management</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

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

