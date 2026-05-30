'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Plus, Edit, Trash2, ExternalLink,
  X, Save, Loader2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/services/supabase';
import { type College, type CollegeType } from '@/types';
import { INDIAN_STATES } from '@/constants';

const COLLEGE_TYPES: CollegeType[] = ['IIT', 'NIT', 'IIIT', 'GFTIs', 'State'];

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
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      const matchesSearch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.short_name.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
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
          } as any)
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
          } as any);

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
      total_seats: college.total_seats ?? null,
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
          { label: 'State Colleges', value: stats.state, color: 'text-teal-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0B1120] border border-blue-900/20 rounded-xl p-4">
            <div className="text-slate-500 text-xs font-medium">{s.label}</div>
            <div className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0B1120]/50 p-4 rounded-xl border border-blue-900/20">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or short name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050816] border border-blue-900/30 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-40 bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
          >
            <option value="all">All Types</option>
            {COLLEGE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B1120] border border-blue-900/20 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#050816] border-b border-blue-900/20 text-slate-500 font-medium">
                <th className="px-6 py-4">College Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">NIRF</th>
                <th className="px-6 py-4 text-right">Avg Package</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="text-slate-500">Loading database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No colleges found matching your search.
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => (
                  <tr key={college.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{college.name}</span>
                        <span className="text-slate-500 text-xs">{college.short_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColors[college.type]}`}>
                        {college.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {college.city}, {college.state}
                    </td>
                    <td className="px-6 py-4 text-center text-white">
                      {college.nirf_rank || '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 font-medium">
                      {college.avg_package ? `${college.avg_package} LPA` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(college)}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(college.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0B1120] border border-blue-900/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/20 bg-[#050816]">
                <h3 className="text-white font-bold">{editingCollege ? 'Edit College' : 'Add New College'}</h3>
                <button onClick={closeModal} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Full Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                      placeholder="e.g. National Institute of Technology..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Short Name</label>
                    <input
                      required
                      value={formData.short_name}
                      onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                      placeholder="e.g. NIT Trichy"
                    />
                  </div>
                </div>

                {/* Location & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as CollegeType })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    >
                      {COLLEGE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">City</label>
                    <input
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                      placeholder="e.g. Tiruchirappalli"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">NIRF Rank</label>
                    <input
                      type="number"
                      value={formData.nirf_rank || ''}
                      onChange={(e) => setFormData({ ...formData, nirf_rank: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Avg Package</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.avg_package || ''}
                      onChange={(e) => setFormData({ ...formData, avg_package: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Fees/Yr</label>
                    <input
                      type="number"
                      value={formData.fees_per_year || ''}
                      onChange={(e) => setFormData({ ...formData, fees_per_year: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">ROI Score</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.roi_score || ''}
                      onChange={(e) => setFormData({ ...formData, roi_score: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Website URL</label>
                  <input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-[#050816] border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    placeholder="https://www.example.edu"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </form>

              <div className="px-6 py-4 border-t border-blue-900/20 bg-[#050816] flex justify-end gap-3">
                <Button onClick={closeModal} variant="ghost" className="text-slate-500 hover:text-white">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white min-w-[100px]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCollege ? 'Update College' : 'Add College'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#0B1120] border border-red-900/30 rounded-2xl p-6 text-center shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Are you sure?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This action cannot be undone. This will permanently delete the college record.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setDeleteConfirm(null)} variant="ghost" className="flex-1 text-slate-500 hover:text-white">
                  Cancel
                </Button>
                <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold">
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

