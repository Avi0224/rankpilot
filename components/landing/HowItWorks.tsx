'use client';

import { motion } from 'framer-motion';
import { ClipboardList, BarChart2, ListOrdered, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Enter Your Rank',
    description: 'Input your JEE Main rank, category, preferred branches, budget, and home state. Our engine handles the rest.',
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/25',
    iconColor: 'text-blue-400',
  },
  {
    step: '02',
    icon: BarChart2,
    title: 'Compare Colleges',
    description: 'Compare colleges side-by-side on fees, placements, ROI, median packages, and 5 years of cutoff data.',
    color: 'from-cyan-500/20 to-cyan-600/10',
    borderColor: 'border-cyan-500/25',
    iconColor: 'text-cyan-400',
  },
  {
    step: '03',
    icon: ListOrdered,
    title: 'Build Choice List',
    description: 'Generate an optimized counselling preference order. Drag, reorder, and export your final JoSAA choice list.',
    color: 'from-teal-500/20 to-teal-600/10',
    borderColor: 'border-teal-500/25',
    iconColor: 'text-teal-400',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <p className="text-blue-400 text-xs font-medium uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            From Rank to Choice List in{' '}
            <span className="gradient-text">3 Steps</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            No more opening 20 tabs. RankPilot gives you everything you need in one clean, fast interface.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-teal-500/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className={`relative p-5 rounded-xl bg-gradient-to-br ${step.color} border ${step.borderColor} glass-card group cursor-default`}
              >
                {/* Step number */}
                <div className="text-[60px] font-black text-white/[0.03] absolute top-1 right-3 leading-none select-none">
                  {step.step}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg bg-[#0B1120] border ${step.borderColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className={`w-5 h-5 ${step.iconColor}`} />
                </div>

                <h3 className="text-white font-semibold text-sm mb-1.5">{step.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{step.description}</p>

                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/40 z-10" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
