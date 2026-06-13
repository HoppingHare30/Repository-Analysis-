import React, { useState } from 'react';
import { useGraph } from './hooks/useGraph';
import Canvas from './components/Canvas';
import SidePanel from './components/SidePanel';

function App() {
  const [repoPath, setRepoPath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Load state and triggers from useGraph hook
  const { nodes, edges, loading, error, fetchGraph } = useGraph();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoPath.trim()) return;
    
    setSelectedFile(null); // Clear previous selection on a new run
    try {
      await fetchGraph(repoPath);
    } catch (err) {
      // Error is caught and stored by useGraph hook
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d0d0d] text-neutral-100 font-mono select-none overflow-hidden">
      {/* Header (Height: 56px) */}
      <header className="flex items-center justify-between px-6 h-14 bg-neutral-950 border-b border-neutral-900 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`}></div>
          <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
            Repo Explorer
          </span>
        </div>
        
        <form onSubmit={handleAnalyze} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Absolute local repository path..."
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            className="w-96 px-3 py-1.5 text-xs bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-md focus:border-neutral-500 focus:outline-none transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-md transition-all duration-200 shadow-md disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden relative">
        {/* Error Display Bar */}
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-red-950/80 border border-red-900 text-red-200 text-xs px-4 py-3 rounded-lg backdrop-blur flex items-center justify-between shadow-2xl max-w-xl mx-auto animate-in fade-in duration-200">
            <span>Error: {error}</span>
          </div>
        )}

        {/* Canvas Area (70% or flex-1) */}
        <main className={`relative h-full transition-all duration-300 ${selectedFile ? 'w-[70%]' : 'w-full'} flex flex-col`}>
          {nodes.length > 0 ? (
            <Canvas
              nodes={nodes}
              edges={edges}
              onNodeClick={setSelectedFile}
            />
          ) : (
            <div className="w-full h-full bg-[#0f0f11] flex flex-col items-center justify-center relative">
              {/* Grid Background Mock */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b1f_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1f_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
              
              <div className="text-center z-10 p-6 max-w-md bg-neutral-950/40 rounded-xl border border-neutral-900 backdrop-blur-sm shadow-xl">
                <h2 className="text-sm font-semibold text-neutral-400 mb-2">Interactive Codebase Canvas</h2>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Enter an absolute path to a local Git repository and click "Analyze" to render its module dependency graph.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Side Panel (30% width, conditional render) */}
        {selectedFile && (
          <SidePanel
            filePath={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
