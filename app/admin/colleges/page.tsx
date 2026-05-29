'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Plus, Edit, Trash2, ExternalLink,
  X, Save, Loader2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { College, CollegeType } from '@/lib/types';

const COLLEGE_TYPES: CollegeType[] = ['IIT', 'NIT', 'IIIT', 'GFTIs', 'State'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

const typeColors: Record<string, string> = {
  NIT: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  IIIT: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
  State: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
  IIT: 'text-orange-400 bg-orange-400/10 border-orange-400/25',
  GFTIs: 'text-slate-400 bg-slate-400/10 border-slate-400/25',
};

interface CollegeFormData {
  name: string;
  short_name: string;
  state: string;
  city: string;
  type: CollegeType;
  nirf_rank: number | null;
  avg_package: number | null;
  median_package: number | null;
  highest_package: number | null;
  fees_per_year: number | null;
  hostel_fees_per_year: number | null;
  campus_size_acres: number | null;
  established_year: number | null;
  total_seats: number | null;
  placement_percentage: number | null;
  roi_score: number | null;
  website: string;
}

const emptyForm: CollegeFormData = {
  name: '', short_name: '', state: '', city: '', type: 'NIT',
  nirf_rank: null, avg_package: null, median_package: null, highest_package: null,
  fees_per_year: null, hostel_fees_per_year: null, campus_size_acres: null,
  established_year: null, total_seats: null, placement_percentage: null,
  roi_score: null, website: ''
};

export default function CollegesDatabasePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState<CollegeFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch colleges from Supabase
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('colleges')
        .select('*')
        .order('nirf_rank', { ascending: true, nullsFirst: false });

      if (fetchError) throw fetchError;
      setColleges(data || []);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Filtered colleges - memoized
  const filteredColleges = useMemo(() => {
    return colleges.filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.short_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [colleges, typeFilter, search]);

  // Stats - memoized
  const stats = useMemo(() => ({
    total: colleges.length,
    nits: colleges.filter((c) => c.type === 'NIT').length,
    iiits: colleges.filter((c) => c.type === 'IIIT').length,
    state: colleges.filter((c) => c.type === 'State').length,
  }), [colleges]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingCollege) {
        // Update existing college
        const { error: updateError } = await supabase
          .from('colleges')
          .update({
            name: formData.name,
            short_name: formData.short_name,
            state: formData.state,
            city: formData.city,
            type: formData.type,
            nirf_rank: formData.nirf_rank || null,
            avg_package: formData.avg_package || null,
            median_package: formData.median_package || null,
            highest_package: formData.highest_package || null,
            fees_per_year: formData.fees_per_year || null,
            hostel_fees_per_year: formData.hostel_fees_per_year || null,
            campus_size_acres: formData.campus_size_acres || null,
            established_year: formData.established_year || null,
            total_seats: formData.total_seats || null,
            placement_percentage: formData.placement_percentage || null,
            roi_score: formData.roi_score || null,
            website: formData.website || null,
          })
          .eq('id', editingCollege.id);

        if (updateError) throw updateError;
      } else {
        // Insert new college
        const { error: insertError } = await supabase
          .from('colleges')
          .insert({
            name: formData.name,
            short_name: formData.short_name,
            state: formData.state,
            city: formData.city,
            type: formData.type,
            nirf_rank: formData.nirf_rank || null,
            avg_package: formData.avg_package || null,
            median_package: formData.median_package || null,
            highest_package: formData.highest_package || null,
            fees_per_year: formData.fees_per_year || null,
            hostel_fees_per_year: formData.hostel_fees_per_year || null,
            campus_size_acres: formData.campus_size_acres || null,
            established_year: formData.established_year || null,
            total_seats: formData.total_seats || null,
            placement_percentage: formData.placement_percentage || null,
            roi_score: formData.roi_score || null,
            website: formData.website || null,
          });

        if (insertError) throw insertError;
      }

      await fetchColleges();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save college');
    } finally {
      setSaving(false);
    }
  };

  // Delete college
  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('colleges')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setColleges(colleges.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting college:', err);
    }
  };

  // Open modal for editing
  const openEditModal = (college: College) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      short_name: college.short_name,
      state: college.state,
      city: college.city,
      type: college.type,
      nirf_rank: college.nirf_rank,
      avg_package: college.avg_package,
      median_package: college.median_package,
      highest_package: college.highest_package,
      fees_per_year: college.fees_per_year,
      hostel_fees_per_year: college.hostel_fees_per_year,
      campus_size_acres: college.campus_size_acres,
      established_year: college.established_year,
      total_seats: college.total_seats,
      placement_percentage: college.placement_percentage,
      roi_score: college.roi_score,
      website: college.website || '',
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingCollege(null);
    setFormData(emptyForm);
    setError('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">College Database</h1>
          <p className="text-slate-500 text-sm mt-1">Manage college records and metadata.</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add College
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Colleges', value: stats.total, color: 'text-white' },
          { label: 'NITs', value: stats.nits, color: 'text-blue-400' },
          { label: 'IIITs', value: stats.iiits, color: 'text-cyan-400' },
          { label: 'State Institutes', value: stats.state, color: 'text-teal-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 border border-blue-500/10">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {loading ? <span className="animate-pulse">...</span> : stat.value}
            </div>
            <div className="text-slate-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleges..."
            className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <div className="flex gap-1 p-1 bg-[#0B1120] rounded-xl border border-blue-900/30">
          {['all', ...COLLEGE_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === t ? 'bg-blue-600/25 border border-blue-500/40 text-blue-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading colleges...</div>
        ) : filteredColleges.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No colleges found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#070d1a]">
              <tr>
                <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">College</th>
                <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Type</th>
                <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">State</th>
                <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">NIRF</th>
                <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Avg Pkg</th>
                <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">ROI</th>
                <th className="px-5 py-3 text-center text-xs text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/15 bg-[#080e1d]">
              {filteredColleges.map((college) => (
                <tr key={college.id} className="hover:bg-blue-950/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="text-white text-sm font-medium">{college.name}</div>
                      <div className="text-slate-500 text-xs">{college.short_name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[college.type]}`}>{college.type}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-sm">{college.state}</td>
                  <td className="px-5 py-3.5">
                    {college.nirf_rank ? <span className="text-amber-300 text-sm">#{college.nirf_rank}</span> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {college.avg_package ? <span className="text-emerald-400 text-sm font-semibold">₹{college.avg_package}L</span> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {college.roi_score ? <span className="text-blue-400 text-sm">{college.roi_score}/10</span> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      {college.website && (
                        <a href={college.website} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(college)}
                        className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(college.id)}
                        className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 max-w-md w-full border border-red-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Delete College</h3>
                  <p className="text-slate-500 text-sm">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete this college? All associated branches and cutoff data will also be removed.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-slate-400">Cancel</Button>
                <Button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-500 text-white">Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit College Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full border border-blue-500/20 my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">
                  {editingCollege ? 'Edit College' : 'Add New College'}
                </h3>
                <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">College Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="National Institute of Technology Tiruchirappalli"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Short Name *</label>
                    <input
                      type="text"
                      value={formData.short_name}
                      onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                      required
                      placeholder="NIT Trichy"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as CollegeType })}
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    >
                      {COLLEGE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      placeholder="Tiruchirappalli"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Rankings & Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">NIRF Rank</label>
                    <input
                      type="number"
                      value={formData.nirf_rank || ''}
                      onChange={(e) => setFormData({ ...formData, nirf_rank: e.target.value ? Number(e.target.value) : null })}
                      placeholder="9"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Established Year</label>
                    <input
                      type="number"
                      value={formData.established_year || ''}
                      onChange={(e) => setFormData({ ...formData, established_year: e.target.value ? Number(e.target.value) : null })}
                      placeholder="1964"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Total Seats</label>
                    <input
                      type="number"
                      value={formData.total_seats || ''}
                      onChange={(e) => setFormData({ ...formData, total_seats: e.target.value ? Number(e.target.value) : null })}
                      placeholder="900"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Package Details */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Avg Package (LPA)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.avg_package || ''}
                      onChange={(e) => setFormData({ ...formData, avg_package: e.target.value ? Number(e.target.value) : null })}
                      placeholder="12.5"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Median (LPA)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.median_package || ''}
                      onChange={(e) => setFormData({ ...formData, median_package: e.target.value ? Number(e.target.value) : null })}
                      placeholder="8.5"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Highest (LPA)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.highest_package || ''}
                      onChange={(e) => setFormData({ ...formData, highest_package: e.target.value ? Number(e.target.value) : null })}
                      placeholder="50"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Placement %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.placement_percentage || ''}
                      onChange={(e) => setFormData({ ...formData, placement_percentage: e.target.value ? Number(e.target.value) : null })}
                      placeholder="94.5"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Fees */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Annual Fees (L)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fees_per_year || ''}
                      onChange={(e) => setFormData({ ...formData, fees_per_year: e.target.value ? Number(e.target.value) : null })}
                      placeholder="1.45"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Hostel Fees (L)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hostel_fees_per_year || ''}
                      onChange={(e) => setFormData({ ...formData, hostel_fees_per_year: e.target.value ? Number(e.target.value) : null })}
                      placeholder="0.85"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">ROI Score</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.roi_score || ''}
                      onChange={(e) => setFormData({ ...formData, roi_score: e.target.value ? Number(e.target.value) : null })}
                      placeholder="8.7"
                      className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.nitt.edu"
                    className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-blue-900/20">
                  <Button type="button" variant="ghost" onClick={closeModal} className="text-slate-400">Cancel</Button>
                  <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-8">
                    {saving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />{editingCollege ? 'Update College' : 'Add College'}</>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
