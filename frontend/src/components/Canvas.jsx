import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from 'reactflow';

// Import React Flow core stylesheet
import 'reactflow/dist/style.css';

// Import our custom FileNode component
import FileNode from './FileNode';

const nodeTypes = {
  fileNode: FileNode,
};

const Canvas = ({ nodes, edges, onNodeClick }) => {
  const handleNodeClick = (event, node) => {
    if (onNodeClick && node && node.data && node.data.filePath) {
      onNodeClick(node.data.filePath);
    }
  };

  // Determine node color in minimap based on file extension
  const getMiniMapNodeColor = (node) => {
    const filePath = node.data?.filePath;
    if (!filePath) return '#6b7280';
    const ext = filePath.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'py':
        return '#3b82f6'; // blue
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return '#f59e0b'; // amber
      case 'c':
      case 'cpp':
      case 'h':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0d0d0e]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        zoomOnScroll={true}
        panOnDrag={true}
        className="w-full h-full"
      >
        {/* Dotted background configuration with #1e293b color */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1e293b"
        />
        
        {/* Controls styling */}
        <Controls
          className="bg-[#1a1a1a] border border-neutral-800 rounded shadow-lg fill-neutral-300"
          style={{
            buttonColor: '#d4d4d4',
          }}
        />
        
        {/* Dark-themed MiniMap */}
        <MiniMap
          nodeColor={getMiniMapNodeColor}
          maskColor="rgba(15, 15, 15, 0.75)"
          className="bg-[#1a1a1a] border border-neutral-800 rounded-lg shadow-lg overflow-hidden hidden sm:block"
          style={{
            backgroundColor: '#111112',
            width: 120,
            height: 80,
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default Canvas;
