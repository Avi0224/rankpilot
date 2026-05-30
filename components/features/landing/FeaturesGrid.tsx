'use client';

import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, GitBranch, BarChart3,
  GitCompare, Filter, ListOrdered, Bookmark, Users
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI College Predictor',
    description: 'Get personalized college predictions based on your rank, category, and preferences with probability scores.',
    tag: 'Core',
  },
  {
    icon: TrendingUp,
    title: 'ROI Calculator',
    description: 'Compare return on investment across colleges — fees vs. average placement package with 5-year projections.',
    tag: 'Analytics',
  },
  {
    icon: GitBranch,
    title: 'Branch Explorer',
    description: 'Explore all available branches with cutoffs, placement stats, and salary trends per specialization.',
    tag: 'Explore',
  },
  {
    icon: BarChart3,
    title: 'Cutoff Trend Analysis',
    description: 'Visualize 5-year JoSAA cutoff trends to understand rank movement and predict future cutoffs.',
    tag: 'Trends',
  },
  {
    icon: GitCompare,
    title: 'College Comparison',
    description: 'Compare up to 4 colleges side-by-side across fees, placements, hostel, NIRF rank, and more.',
    tag: 'Compare',
  },
  {
    icon: Filter,
    title: 'Smart Filters',
    description: 'Filter by state, budget, branch, college type, NIRF rank, and placement percentage simultaneously.',
    tag: 'Filter',
  },
  {
    icon: ListOrdered,
    title: 'Choice Filling Assistant',
    description: 'Drag-and-drop interface to build, optimize, and export your JoSAA counselling preference list.',
    tag: 'Counselling',
  },
  {
    icon: Bookmark,
    title: 'Saved Lists',
    description: 'Shortlist colleges, add notes, and organize them into multiple named lists for different strategies.',
    tag: 'Save',
  },
  {
    icon: Users,
    title: 'Placement Analytics',
    description: 'Deep placement data — top recruiters, offer breakdowns, sector trends, and hiring patterns.',
    tag: 'Placements',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <p className="text-blue-400 text-xs font-medium uppercase tracking-widest mb-2">Everything You Need</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            One Platform. <span className="gradient-text">Zero Confusion.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Every tool a JEE Main student needs during counselling — in one place, with no noise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="group p-4 rounded-xl glass-card border border-blue-500/10 hover:border-blue-500/25 transition-all cursor-default relative overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-transparent transition-all duration-200 rounded-xl" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:border-blue-500/35 transition-all">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400/60 bg-blue-400/8 px-2 py-0.5 rounded-full border border-blue-400/15">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-blue-50 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
