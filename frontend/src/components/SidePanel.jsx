import React, { useState, useEffect } from 'react';
import { fetchSummary, fetchMetrics } from '../api';

const SidePanel = ({ filePath, onClose }) => {
  const [metrics, setMetrics] = useState(null);
  const [summary, setSummary] = useState('');
  const [isCached, setIsCached] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filePath) return;

    let isMounted = true;
    setLoading(true);
    setMetrics(null);
    setSummary('');
    setIsCached(false);

    // Call fetchMetrics and fetchSummary in parallel
    Promise.all([
      fetchMetrics(filePath).catch(err => {
        console.error('Metrics fetch error:', err);
        return { loc: 0, complexity: 0 };
      }),
      fetchSummary(filePath).catch(err => {
        console.error('Summary fetch error:', err);
        return { summary: 'Summary unavailable.', cached: false };
      })
    ])
      .then(([metricsData, summaryData]) => {
        if (!isMounted) return;
        setMetrics(metricsData);
        setSummary(summaryData.summary || 'Summary unavailable.');
        setIsCached(!!summaryData.cached);
      })
      .catch(() => {
        if (!isMounted) return;
        setMetrics({ loc: 0, complexity: 0 });
        setSummary('Summary unavailable.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filePath]);

  return (
    <aside className="w-[30%] h-full bg-[#1a1a1a] border-l border-[#2d2d2d] flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d2d] bg-neutral-950/20">
        <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">File Inspector</span>
        <button 
          onClick={onClose}
          className="p-1 text-neutral-500 hover:text-neutral-200 rounded hover:bg-neutral-900 transition-colors"
          aria-label="Close Inspector"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-neutral-900/10">
          <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest animate-pulse">Loading file info...</span>
        </div>
      ) : (
        /* Content Area (padding 24px) */
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* File path heading */}
          <div>
            <label className="text-[9px] text-neutral-600 uppercase tracking-widest block mb-1">File Path</label>
            <h2 className="text-xs text-blue-400 font-bold font-mono break-all bg-neutral-950/40 p-3 rounded-lg border border-[#2d2d2d] leading-relaxed">
              {filePath}
            </h2>
          </div>

          {/* Metric Stat Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900/40 p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-[9px] text-neutral-500 uppercase tracking-wider mb-1">Lines of Code</div>
              <div className="text-xl font-bold text-neutral-200 font-mono">
                {metrics?.loc ?? 0}
              </div>
            </div>
            <div className="bg-neutral-900/40 p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-[9px] text-neutral-500 uppercase tracking-wider mb-1">Complexity</div>
              <div className="text-xl font-bold text-neutral-200 font-mono">
                {metrics?.complexity ?? 0}
              </div>
            </div>
          </div>

          {/* AI Explanation Area */}
          <div className="bg-neutral-900/20 p-5 rounded-lg border border-[#2d2d2d] relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] text-neutral-500 uppercase tracking-wider">AI Summary</label>
              
              {/* Cached badge pill */}
              {isCached && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Cached
                </span>
              )}
            </div>
            
            <p className="text-xs text-neutral-300 leading-relaxed font-sans select-text">
              {summary}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidePanel;
