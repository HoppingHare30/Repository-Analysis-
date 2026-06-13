import React, { useState } from 'react';

function App() {
  // App State as required
  const [repoPath, setRepoPath] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Temporary function to mock node selection for scaffolding verification
  const mockSelectFile = () => {
    setSelectedFile(selectedFile ? null : 'backend/main.py');
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!repoPath.trim()) return;
    setLoading(true);
    setError(null);
    
    // Scaffolding mock behavior (API integration comes in later chunks)
    setTimeout(() => {
      setLoading(false);
      setGraphData({ nodes: [], edges: [] });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d0d0d] text-neutral-100 font-mono select-none overflow-hidden">
      {/* Header (Height: 56px) */}
      <header className="flex items-center justify-between px-6 h-14 bg-neutral-950 border-b border-neutral-850 border-neutral-800/80 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
            Repo Explorer
          </span>
        </div>
        
        <form onSubmit={handleAnalyze} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Absolute local repository path..."
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            className="w-96 px-3 py-1.5 text-xs bg-neutral-900/90 text-neutral-200 border border-neutral-800 rounded-md focus:border-neutral-500 focus:outline-none transition-all duration-200"
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
      <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden">
        {/* Canvas Area (70% or flex-1) */}
        <main className={`relative h-full transition-all duration-300 ${selectedFile ? 'w-[70%]' : 'w-full'} bg-[#0f0f11] flex flex-col items-center justify-center`}>
          {/* Grid Background Mock */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b1f_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1f_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
          
          <div className="text-center z-10 p-6 max-w-md bg-neutral-950/40 rounded-xl border border-neutral-900 backdrop-blur-sm shadow-xl">
            <h2 className="text-sm font-semibold text-neutral-400 mb-2">Interactive Codebase Canvas</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Enter an absolute path to a local Git repository and click "Analyze" to render its module dependency graph.
            </p>
            <button 
              onClick={mockSelectFile}
              className="mt-4 px-3 py-1 text-[10px] bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Toggle Demo SidePanel
            </button>
          </div>
        </main>

        {/* Side Panel (30% width, conditional render) */}
        {selectedFile && (
          <aside className="w-[30%] h-full bg-[#121214] border-l border-neutral-900 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b border-neutral-900 bg-neutral-950/40">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">File Inspector</span>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1 text-neutral-500 hover:text-neutral-200 rounded hover:bg-neutral-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div>
                <label className="text-[10px] text-neutral-600 uppercase tracking-widest block mb-1">Path</label>
                <div className="text-xs text-blue-400 font-semibold break-all bg-neutral-950/50 p-2.5 rounded border border-neutral-900/60">
                  {selectedFile}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-950/30 p-4 rounded-lg border border-neutral-900">
                  <div className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">LoC</div>
                  <div className="text-lg font-bold text-neutral-300">0</div>
                </div>
                <div className="bg-neutral-950/30 p-4 rounded-lg border border-neutral-900">
                  <div className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Complexity</div>
                  <div className="text-lg font-bold text-neutral-300">0</div>
                </div>
              </div>

              <div className="bg-neutral-950/20 p-4 rounded-lg border border-neutral-900/40">
                <div className="text-[10px] text-neutral-600 uppercase tracking-wider mb-2">AI File Explanation</div>
                <div className="text-xs text-neutral-400 leading-relaxed italic">
                  Select a file from the dependency graph to retrieve its AI summary.
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
