'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Database, RefreshCw, Save, Bell,
  Shield, Globe, FileJson, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure data ingestion and platform settings.</p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm">
          {saved ? <><CheckCircle2 className="w-4 h-4" />Saved</> : <><Save className="w-4 h-4" />Save Changes</>}
        </Button>
      </div>

      {/* General Settings */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-4 h-4 text-slate-400" />
          <h3 className="text-white font-semibold text-sm">General Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Import Year Default</label>
              <select className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                {[2025, 2024, 2023].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Counselling System Default</label>
              <select className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option value="josaa">JoSAA</option>
                <option value="csab">CSAB</option>
                <option value="jac-delhi">JAC Delhi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Settings */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Validation Settings</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Skip duplicate entries', desc: 'Automatically skip rows with duplicate institute/branch/category combinations', checked: true },
            { label: 'Strict validation mode', desc: 'Reject entire import if any validation errors are found', checked: false },
            { label: 'Auto-normalize values', desc: 'Automatically apply normalization rules during import', checked: true },
            { label: 'Generate import report', desc: 'Create detailed report after each import', checked: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-start justify-between p-3 bg-[#080f1e] rounded-xl border border-blue-900/20">
              <div>
                <div className="text-white text-sm font-medium">{setting.label}</div>
                <div className="text-slate-500 text-xs mt-0.5">{setting.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={setting.checked} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Email on import completion', checked: true },
            { label: 'Email on import failure', checked: true },
            { label: 'Email on validation warnings', checked: false },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{setting.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={setting.checked} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Cache & Storage */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
        <div className="flex items-center gap-2 mb-5">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Cache & Storage</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white text-sm font-medium">Normalization Cache</div>
            <div className="text-slate-500 text-xs">48 rules cached in memory</div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0B1120] border border-blue-900/30 rounded-xl text-slate-400 hover:text-white transition-colors text-sm">
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}

