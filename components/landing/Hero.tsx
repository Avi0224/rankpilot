'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Building2, BarChart3, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Ranks Analyzed', value: '2.5L+', icon: TrendingUp },
  { label: 'Colleges', value: '500+', icon: Building2 },
  { label: 'Years of Data', value: '5 Years', icon: BarChart3 },
  { label: 'Students Helped', value: '50K+', icon: Star },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-mesh pt-16 -mt-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-400/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[180px]" />
      </div>

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          JEE Main 2025 Counselling
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-5"
        >
          Find the Best Engineering{' '}
          <br className="hidden sm:block" />
          <span className="gradient-text">Colleges for Your Rank</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Compare cutoffs, ROI, placements, and fees across 500+ colleges.
          <br className="hidden sm:block" />
          Data-driven decisions, not guesswork.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-14"
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-6 font-medium glow-blue transition-all group"
            >
              Predict My Colleges
              <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <Link href="/compare">
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 font-medium border-slate-700 text-slate-300 hover:text-white hover:bg-white/5 hover:border-slate-600"
            >
              Compare Colleges
            </Button>
          </Link>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Glow behind mockup */}
          <div className="absolute inset-0 bg-blue-600/8 blur-3xl rounded-3xl scale-95" />

          {/* Mockup frame */}
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0d1a] border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-[#0f1219] rounded px-3 py-1 text-xs text-slate-600 max-w-[240px] mx-auto">
                  rankpilot.in/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 sm:p-5 bg-[#06080f]">
              {/* Input chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['Rank: 12,450', 'Category: OBC-NCL', 'CSE / ECE', 'All India'].map((chip) => (
                  <div
                    key={chip}
                    className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs"
                  >
                    {chip}
                  </div>
                ))}
                <div className="px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-medium">
                  Predict
                </div>
              </div>

              {/* Results grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Safe', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', items: ['NIT Rourkela — CSE', 'MANIT Bhopal — CSE'] },
                  { label: 'Moderate', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', items: ['NIT Warangal — CSE', 'NIT Surathkal — CSE'] },
                  { label: 'Dream', color: 'bg-red-500/10 border-red-500/20 text-red-400', items: ['NIT Trichy — CSE', 'DTU — CSE'] },
                ].map((group) => (
                  <div key={group.label} className="rounded-lg bg-[#0a0d1a] border border-white/5 p-3">
                    <div className={`text-[10px] font-semibold px-2 py-0.5 rounded inline-block mb-2 border ${group.color}`}>
                      {group.label}
                    </div>
                    <div className="space-y-1.5">
                      {group.items.map((item) => (
                        <div key={item} className="text-xs text-slate-400 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-slate-600" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mt-12"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2.5 text-slate-400">
                <Icon className="w-4 h-4 text-blue-500/60" />
                <div className="text-sm">
                  <span className="text-white font-semibold">{stat.value}</span>
                  <span className="text-slate-500 ml-1">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
