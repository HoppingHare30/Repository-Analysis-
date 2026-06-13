import React, { useState } from 'react';
import { useGraph } from './hooks/useGraph';
import Canvas from './components/Canvas';
import SidePanel from './components/SidePanel';

function App() {
  const [repoPath, setRepoPath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Load state and triggers from useGraph hook
  const { nodes, edges, loading, error, fetchGraph } = useGraph();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoPath.trim()) return;
    
    setSelectedFile(null); // Clear selected file when a new graph is loaded
    setHasAnalyzed(false); // Reset analysis state before fetching
    try {
      await fetchGraph(repoPath);
      setHasAnalyzed(true);
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
          {/* Node count display in header once graph loads */}
          {nodes.length > 0 && (
            <span className="text-xs text-neutral-500 font-mono pl-2 border-l border-neutral-800">
              {nodes.length} files
            </span>
          )}
        </div>
        
        <form onSubmit={handleAnalyze} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter absolute path to repository..."
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            className="w-96 px-3 py-1.5 text-xs bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-md focus:border-neutral-500 focus:outline-none transition-all duration-200"
          />
          {/* Disable Analyze button while loading */}
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
        
        {/* Error State: Invalid/unreachable path -> red banner below header */}
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-red-950/90 border border-red-900 text-red-200 text-xs px-4 py-3 rounded-lg backdrop-blur flex items-center justify-between shadow-2xl max-w-xl mx-auto animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Could not load repository. Check the path and ensure the backend is running.</span>
            </div>
          </div>
        )}

        {/* Canvas Area (70% or flex-1) */}
        <main className={`relative h-full transition-all duration-300 ${selectedFile ? 'w-[70%]' : 'w-full'} flex flex-col`}>
          {loading ? (
            /* Loading state -> subtle spinner centered on the canvas area */
            <div className="w-full h-full bg-[#0f0f11] flex flex-col items-center justify-center relative z-40">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs text-neutral-455 text-neutral-400 uppercase tracking-widest animate-pulse">Parsing repository structure...</span>
            </div>
          ) : nodes.length > 0 ? (
            /* Render Canvas */
            <Canvas
              nodes={nodes}
              edges={edges}
              onNodeClick={setSelectedFile}
            />
          ) : hasAnalyzed && nodes.length === 0 ? (
            /* Empty graph (0 nodes) -> centered message on canvas */
            <div className="w-full h-full bg-[#0f0f11] flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b1f_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1f_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
              
              <div className="text-center z-10 p-6 max-w-sm bg-neutral-950/50 rounded-xl border border-neutral-900 backdrop-blur-sm shadow-xl animate-in zoom-in-95 duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-sm font-semibold text-neutral-400 mb-2">No Files Found</h2>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  No supported files found in this repository.
                </p>
              </div>
            </div>
          ) : (
            /* Initial state */
            <div className="w-full h-full bg-[#0f0f11] flex flex-col items-center justify-center relative">
              {/* Grid Background */}
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
