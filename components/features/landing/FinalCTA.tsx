'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinalCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[120px] animate-pulse-subtle" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-2xl p-8 sm:p-12 border border-blue-500/20 relative overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

          <div className="relative w-12 h-12 flex items-center justify-center mx-auto mb-6 glow-blue">
            <Image 
              src="/logo.svg" 
              alt="RankPilot JEE Logo" 
              width={48} 
              height={48} 
              className="object-contain"
            />
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight tracking-tight">
            Your Counselling Strategy{' '}
            <span className="gradient-text">Starts Here.</span>
          </h2>

          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
            Join 50,000+ students who used RankPilot JEE to make data-driven college decisions.
            Free to use. No spam. Always accurate.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 text-sm font-semibold glow-blue transition-all hover:scale-[1.02] group">
                Predict My Colleges
                <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-blue-500/30 text-slate-300 hover:text-white hover:bg-blue-500/10 px-8 py-5 text-sm">
                Create Free Account
              </Button>
            </Link>
          </div>

          <p className="text-slate-600 text-xs mt-5">
            No credit card required. Works with JoSAA, CSAB, JAC Delhi, COMEDK & state counselling.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
