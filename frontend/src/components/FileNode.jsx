import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const FileNode = ({ data, selected }) => {
  const { label, metrics, filePath } = data;
  const loc = metrics?.loc ?? 0;

  // Determine left border color class based on file extension
  const getBorderLeftColor = (path) => {
    if (!path) return 'border-l-[#6b7280]';
    const ext = path.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'py':
        return 'border-l-[#3b82f6]'; // blue
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return 'border-l-[#f59e0b]'; // amber
      case 'c':
      case 'cpp':
      case 'h':
        return 'border-l-[#10b981]'; // green
      default:
        return 'border-l-[#6b7280]'; // gray
    }
  };

  const borderLeftColor = getBorderLeftColor(filePath);

  return (
    <div
      className={`px-4 py-3 rounded-lg bg-[#1a1a1a] border ${
        selected 
          ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.35)]' 
          : 'border-neutral-800'
      } border-l-4 ${borderLeftColor} min-w-[185px] transition-all duration-200 hover:brightness-110 shadow-lg relative`}
    >
      {/* Target handle for incoming edges */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#52525b', border: 'none', width: '6px', height: '6px' }}
      />
      
      <div className="flex flex-col gap-1 select-none">
        <span className="text-xs font-bold text-neutral-200 truncate font-mono block">
          {label}
        </span>
        <span className="text-[10px] text-neutral-500 font-mono block">
          LoC: <span className="text-neutral-400 font-semibold">{loc}</span>
        </span>
      </div>

      {/* Source handle for outgoing edges */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#52525b', border: 'none', width: '6px', height: '6px' }}
      />
    </div>
  );
};

export default memo(FileNode);
