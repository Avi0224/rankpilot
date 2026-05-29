'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Database, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DataUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const [targetTable, setTargetTable] = useState<'colleges' | 'branches' | 'cutoffs'>('colleges');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          let successCount = 0;
          let failedCount = 0;

          // Process in batches of 100
          const batchSize = 100;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize).map(row => {      
              const cleanRow: any = { ...(row as any) };
              
              // Standardize case-sensitive fields
               if (cleanRow.category) {
                 const c = cleanRow.category.toLowerCase().trim();
                 if (c === 'open' || c === 'general') cleanRow.category = 'OPEN';
                 else if (c.includes('obc')) cleanRow.category = 'OBC-NCL';
                 else cleanRow.category = cleanRow.category.toUpperCase().trim();
               }

               if (cleanRow.quota) {
                 const q = cleanRow.quota.toLowerCase().trim();
                 if (q === 'all india' || q === 'ai') cleanRow.quota = 'AI';
                 else if (q === 'home state' || q === 'hs') cleanRow.quota = 'HS';
                 else if (q === 'other state' || q === 'os') cleanRow.quota = 'OS';
                 else cleanRow.quota = cleanRow.quota.toUpperCase().trim();
               }
              
              // Standardize Gender (Gender-Neutral or Female-only)
              if (cleanRow.gender) {
                const g = cleanRow.gender.toLowerCase();
                if (g.includes('female')) cleanRow.gender = 'Female-only';
                else cleanRow.gender = 'Gender-Neutral';
              }

              // Ensure numeric fields are actually numbers
              if (cleanRow.year) cleanRow.year = parseInt(cleanRow.year);
              if (cleanRow.round) cleanRow.round = parseInt(cleanRow.round);
              if (cleanRow.opening_rank) cleanRow.opening_rank = parseInt(cleanRow.opening_rank);
              if (cleanRow.closing_rank) cleanRow.closing_rank = parseInt(cleanRow.closing_rank);
              if (cleanRow.nirf_rank) cleanRow.nirf_rank = parseInt(cleanRow.nirf_rank);
              if (cleanRow.avg_package) cleanRow.avg_package = parseFloat(cleanRow.avg_package);

              return cleanRow;
            });
            
            const { error } = await supabase.from(targetTable).insert(batch);
            
            if (error) {
              console.error(`Batch error in ${targetTable}:`, error);
              failedCount += batch.length;
            } else {
              successCount += batch.length;
            }
          }

          setResults({ success: successCount, failed: failedCount });
          toast.success(`Import complete: ${successCount} added`);
        } catch (err: any) {
          toast.error(err.message || 'Import failed');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Data Ingestion</h1>
        <p className="text-slate-400 text-sm">Bulk import CSV data for colleges, branches, and historical cutoffs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {(['colleges', 'branches', 'cutoffs'] as const).map((table) => (
          <button
            key={table}
            onClick={() => setTargetTable(table)}
            className={`p-6 rounded-2xl border transition-all text-left ${
              targetTable === table 
                ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                : 'bg-[#0B1120] border-blue-900/30 text-slate-500 hover:border-blue-500/30'
            }`}
          >
            <Database className="w-6 h-6 mb-3" />
            <div className="font-bold capitalize">{table}</div>
            <div className="text-[10px] mt-1 opacity-60">Import {table} metadata</div>
          </button>
        ))}
      </div>

      <div className="glass-card rounded-3xl border border-blue-900/30 p-10 flex flex-col items-center justify-center border-dashed relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        
        <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mb-6">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>

        {file ? (
          <div className="text-center">
            <p className="text-white font-medium mb-1">{file.name}</p>
            <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(2)} KB • CSV File</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="mt-4 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white font-medium mb-1">Click or drag CSV file to upload</p>
            <p className="text-slate-500 text-xs">Only .csv files are supported</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Importing to {targetTable}...</span>
            </div>
          ) : (
            `Start ${targetTable} Import`
          )}
        </Button>
      </div>

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 p-6 bg-[#0B1120] rounded-2xl border border-blue-900/30 grid grid-cols-2 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{results.success}</div>
              <div className="text-slate-500 text-[10px] uppercase">Successful</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{results.failed}</div>
              <div className="text-slate-500 text-[10px] uppercase">Failed/Skipped</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
