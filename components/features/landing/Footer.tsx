import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter } from 'lucide-react';

const links = {
  Product: [
    { label: 'College Predictor', href: '/dashboard' },
    { label: 'Compare Colleges', href: '/compare' },
    { label: 'ROI Analytics', href: '/roi' },
    { label: 'Branch Explorer', href: '/dashboard?tab=branches' },
    { label: 'Choice Filling', href: '/choice-filling' },
  ],
  Counselling: [
    { label: 'JoSAA Guide', href: '#' },
    { label: 'CSAB Counselling', href: '#' },
    { label: 'JAC Delhi', href: '#' },
    { label: 'COMEDK', href: '#' },
    { label: 'MHT CET', href: '#' },
  ],
  Resources: [
    { label: 'Cutoff Data 2024', href: '#' },
    { label: 'College Rankings', href: '#' },
    { label: 'Placement Reports', href: '#' },
    { label: 'Blog', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-blue-900/20 bg-[#040710] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-7 h-7 flex items-center justify-center">
                <Image 
                  src="/logo.svg" 
                  alt="RankPilot JEE Logo" 
                  width={28} 
                  height={28} 
                  className="object-contain"
                />
              </div>
              <span className="text-white font-black text-base tracking-tight">
                RankPilot <span className="gradient-text">JEE</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              AI-powered JEE Main college predictor and counselling assistant for Indian engineering students.
            </p>
            <div className="flex gap-2.5">
              <a href="#" className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/30 transition-all">
                <Twitter className="w-3 h-3" />
              </a>
              <a href="#" className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/30 transition-all">
                <Github className="w-3 h-3" />
              </a>
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-xs mb-3">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-blue-900/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            © 2025 RankPilot. Built for JEE Main 2025 counselling season.
          </p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Use', 'Data Sources'].map((label) => (
              <a key={label} href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
