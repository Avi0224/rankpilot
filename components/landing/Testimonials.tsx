'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I stopped opening 20 tabs during JoSAA counselling. RankPilot gave me everything in one place — cutoffs, fees, placements, and my optimized choice list.",
    name: "Arjun Sharma",
    detail: "Got CSE at NIT Warangal — OBC-NCL, Rank 8,400",
    initials: "AS",
    color: "from-blue-500 to-blue-700",
  },
  {
    quote: "Finally a clean predictor without spam calls, pop-ups, and fake guarantees. The ROI calculator alone saved me from a bad choice that would've cost 4 lakh more.",
    name: "Priya Nair",
    detail: "Got ECE at NIT Calicut — OPEN, Rank 14,200",
    initials: "PN",
    color: "from-cyan-500 to-cyan-700",
  },
  {
    quote: "The cutoff trend charts are insane. I could see that NIT Surathkal CSE cutoff has been rising, so I added it in moderate instead of dream. Got it in Round 4.",
    name: "Ravi Verma",
    detail: "Got CSE at NIT Surathkal — OPEN, Rank 7,100",
    initials: "RV",
    color: "from-teal-500 to-teal-700",
  },
  {
    quote: "As a parent, I was completely lost about JoSAA. RankPilot made it simple to understand which colleges were realistic for my son's rank and which were dream options.",
    name: "Sunita Gupta",
    detail: "Son got IT at IIIT Allahabad — EWS, Rank 11,600",
    initials: "SG",
    color: "from-blue-600 to-blue-800",
  },
  {
    quote: "Used the choice filling assistant to build my entire JoSAA list. The auto-optimize feature reordered my choices by ROI score — got admitted in Round 2.",
    name: "Deepak Patel",
    detail: "Got CSE at DTU — OPEN, Rank 2,800",
    initials: "DP",
    color: "from-sky-500 to-sky-700",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrent((c) => (c + dir + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/5 via-blue-950/10 to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <p className="text-blue-400 text-xs font-medium uppercase tracking-widest mb-2">Student Stories</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            From Confusion to <span className="gradient-text">Clarity</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Students who used RankPilot during JEE counselling.
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="glass-card rounded-xl p-6 sm:p-8 border border-blue-500/15 relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <Quote className="w-6 h-6 text-blue-500/30 mb-4" />

              <blockquote className="text-slate-200 text-base sm:text-lg leading-relaxed font-medium mb-6">
                "{testimonials[current].quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonials[current].color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {testimonials[current].initials}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{testimonials[current].name}</div>
                  <div className="text-slate-500 text-xs">{testimonials[current].detail}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full glass border border-blue-500/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`rounded-full transition-all duration-200 ${
                    i === current ? 'w-5 h-1.5 bg-blue-500' : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate(1)}
              className="w-8 h-8 rounded-full glass border border-blue-500/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
