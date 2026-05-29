'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, MapPin, Calendar, Users, Award,
  DollarSign, Home, TrendingUp, BookOpen, Building2, BarChart3, Star
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const college = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'National Institute of Technology Tiruchirappalli',
  shortName: 'NIT Trichy',
  state: 'Tamil Nadu',
  city: 'Tiruchirappalli',
  type: 'NIT',
  nirfRank: 9,
  established: 1964,
  campusSize: 800,
  website: 'https://www.nitt.edu',
  accreditation: 'NAAC A++',
  totalStudents: 6000,
  avgPackage: 12.5,
  medianPackage: 8.5,
  highestPackage: 50,
  fees: 1.45,
  hostelFees: 0.85,
  placement: 94.5,
  roiScore: 8.7,
  description: 'NIT Tiruchirappalli is one of the premier technical institutions in India, consistently ranked among the top NITs. Known for its rigorous academics, strong alumni network, and excellent placement record, NIT Trichy offers B.Tech programs in multiple engineering disciplines with world-class faculty and infrastructure.',
};

const branches = [
  { name: 'Computer Science and Engineering', seats: 60, closingRank: 4850, avgPackage: 18.0, category: 'OPEN' },
  { name: 'Electronics and Communication', seats: 120, closingRank: 12800, avgPackage: 12.0, category: 'OPEN' },
  { name: 'Mechanical Engineering', seats: 120, closingRank: 28000, avgPackage: 8.5, category: 'OPEN' },
  { name: 'Civil Engineering', seats: 120, closingRank: 42000, avgPackage: 7.2, category: 'OPEN' },
  { name: 'Chemical Engineering', seats: 60, closingRank: 35000, avgPackage: 9.0, category: 'OPEN' },
];

const cutoffTrend = [
  { year: '2021', CSE: 4900, ECE: 13200, ME: 28500 },
  { year: '2022', CSE: 4700, ECE: 12500, ME: 27000 },
  { year: '2023', CSE: 5100, ECE: 13400, ME: 29000 },
  { year: '2024', CSE: 4850, ECE: 12800, ME: 28000 },
];

const placementData = [
  { year: '2020', avg: 9.8, median: 7.2, placed: 91 },
  { year: '2021', avg: 10.5, median: 7.8, placed: 92 },
  { year: '2022', avg: 11.2, median: 8.0, placed: 93 },
  { year: '2023', avg: 12.0, median: 8.3, placed: 94 },
  { year: '2024', avg: 12.5, median: 8.5, placed: 94.5 },
];

const topRecruiters = [
  'Microsoft', 'Google', 'Amazon', 'Flipkart', 'Samsung R&D',
  'Qualcomm', 'Texas Instruments', 'Infosys', 'TCS', 'Wipro',
  'Goldman Sachs', 'Morgan Stanley', 'DE Shaw', 'Dunzo', 'Razorpay',
];

const pros = [
  'Top 10 NIT by NIRF ranking',
  'Excellent CSE & ECE placement record',
  'Strong industry connections in South India',
  'Active technical clubs and hackathons',
  'Well-maintained campus infrastructure',
];

const cons = [
  'High competition for top CSE seats',
  'Hostel fees relatively higher vs. other NITs',
  'Limited PG program options in some branches',
];

const tabs = ['Overview', 'Cutoff Trends', 'Placements', 'Branches', 'Recruiters'];

export default function CollegeDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-[#050816]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Predictor
        </Link>

        {/* College header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 sm:p-8 border border-blue-500/15 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-blue-400 bg-blue-400/10 border-blue-400/25">{college.type}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-yellow-400 bg-yellow-400/10 border-yellow-400/25">NIRF #{college.nirfRank}</span>
                <span className="text-xs text-slate-500">{college.accreditation}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{college.name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{college.city}, {college.state}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Est. {college.established}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{college.campusSize} acres</span>
              </div>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <a href={college.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-blue-500/30 text-slate-300 gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />Website
                </Button>
              </a>
              <Link href="/compare">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5">
                  Compare
                </Button>
              </Link>
            </div>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-900/20">
            {[
              { label: 'Avg Package', value: `₹${college.avgPackage} LPA`, icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Median Package', value: `₹${college.medianPackage} LPA`, icon: BarChart3, color: 'text-blue-400' },
              { label: 'Annual Fees', value: `₹${college.fees}L/yr`, icon: DollarSign, color: 'text-amber-400' },
              { label: 'Placement %', value: `${college.placement}%`, icon: Users, color: 'text-cyan-400' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-[#080f1e] rounded-xl p-4 border border-blue-900/20">
                  <Icon className={`w-4 h-4 ${stat.color} mb-2`} />
                  <div className="text-white font-bold text-lg">{stat.value}</div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 glass-card rounded-xl border border-blue-500/10 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600/25 text-blue-300 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
                  <h3 className="text-white font-semibold mb-3">About</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{college.description}</p>
                </div>

                {/* ROI Analysis */}
                <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
                  <h3 className="text-white font-semibold mb-4">ROI Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#080f1e] rounded-xl p-4 border border-blue-900/20">
                      <div className="text-slate-500 text-xs mb-1">4-Year Total Cost</div>
                      <div className="text-white font-bold text-xl">₹{(college.fees * 4 + college.hostelFees * 4).toFixed(1)}L</div>
                      <div className="text-slate-600 text-xs">(Fees + Hostel)</div>
                    </div>
                    <div className="bg-[#080f1e] rounded-xl p-4 border border-blue-900/20">
                      <div className="text-slate-500 text-xs mb-1">ROI Score</div>
                      <div className="text-emerald-400 font-bold text-xl">{college.roiScore}/10</div>
                      <div className="text-slate-600 text-xs">Excellent value</div>
                    </div>
                    <div className="bg-[#080f1e] rounded-xl p-4 border border-blue-900/20">
                      <div className="text-slate-500 text-xs mb-1">Payback Period</div>
                      <div className="text-white font-bold text-xl">~{(college.fees * 4 + college.hostelFees * 4 / college.avgPackage * 12).toFixed(0)} months</div>
                      <div className="text-slate-600 text-xs">At avg package</div>
                    </div>
                    <div className="bg-[#080f1e] rounded-xl p-4 border border-blue-900/20">
                      <div className="text-slate-500 text-xs mb-1">5-Yr Earnings (est.)</div>
                      <div className="text-white font-bold text-xl">₹{(college.avgPackage * 5).toFixed(0)}L</div>
                      <div className="text-slate-600 text-xs">At avg starting salary</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pros & Cons + Info */}
              <div className="space-y-5">
                <div className="glass-card rounded-2xl p-5 border border-blue-500/10">
                  <h3 className="text-white font-semibold mb-3 text-sm">Strengths</h3>
                  <ul className="space-y-2">
                    {pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-slate-400 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-blue-500/10">
                  <h3 className="text-white font-semibold mb-3 text-sm">Considerations</h3>
                  <ul className="space-y-2">
                    {cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-slate-400 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-blue-500/10">
                  <h3 className="text-white font-semibold mb-3 text-sm">Quick Info</h3>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { label: 'Type', value: college.type },
                      { label: 'State', value: college.state },
                      { label: 'Hostel Fees', value: `₹${college.hostelFees}L/yr` },
                      { label: 'Total Students', value: college.totalStudents.toLocaleString() },
                      { label: 'Highest Package', value: `₹${college.highestPackage} LPA` },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-slate-300 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Cutoff Trends' && (
            <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
              <h3 className="text-white font-semibold mb-6">JEE Main Closing Rank Trends (OPEN · AI · Gender-Neutral)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cutoffTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} reversed />
                    <Tooltip
                      contentStyle={{ background: '#0B1120', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line type="monotone" dataKey="CSE" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                    <Line type="monotone" dataKey="ECE" stroke="#06B6D4" strokeWidth={2} dot={{ fill: '#06B6D4', r: 4 }} />
                    <Line type="monotone" dataKey="ME" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-5 mt-4">
                {[{ label: 'CSE', color: '#3B82F6' }, { label: 'ECE', color: '#06B6D4' }, { label: 'ME', color: '#F59E0B' }].map((l) => (
                  <div key={l.label} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-4 h-0.5 rounded" style={{ background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Placements' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
                <h3 className="text-white font-semibold mb-6">Package Trends (LPA)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={placementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#0B1120', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }} />
                      <Bar dataKey="avg" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Avg Package" />
                      <Bar dataKey="median" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Median Package" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
                <h3 className="text-white font-semibold mb-4">Placement Highlights</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Students Placed (2024)', value: '94.5%' },
                    { label: 'Average CTC', value: '₹12.5 LPA' },
                    { label: 'Median CTC', value: '₹8.5 LPA' },
                    { label: 'Highest CTC (CSE)', value: '₹50 LPA' },
                    { label: 'Companies Visited', value: '180+' },
                    { label: 'Pre-Placement Offers', value: '35%' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-blue-900/20 last:border-0">
                      <span className="text-slate-500 text-sm">{item.label}</span>
                      <span className="text-white font-semibold text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Branches' && (
            <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#070d1a] border-b border-blue-900/30">
                    {['Branch', 'Seats', 'Closing Rank (OPEN)', 'Avg Package'].map((h) => (
                      <th key={h} className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/20">
                  {branches.map((branch) => (
                    <tr key={branch.name} className="hover:bg-blue-950/20 transition-colors">
                      <td className="px-5 py-3.5 text-white text-sm font-medium">{branch.name}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-sm">{branch.seats}</td>
                      <td className="px-5 py-3.5 text-slate-300 text-sm font-semibold">{branch.closingRank.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-emerald-400 text-sm font-semibold">₹{branch.avgPackage} LPA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Recruiters' && (
            <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
              <h3 className="text-white font-semibold mb-4">Top Recruiters (2024)</h3>
              <div className="flex flex-wrap gap-2">
                {topRecruiters.map((r) => (
                  <span key={r} className="px-3 py-1.5 rounded-lg bg-[#0B1120] border border-blue-900/30 text-slate-300 text-sm">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
