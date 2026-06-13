import { useState, useCallback } from 'react';
import { fetchGraph as apiFetchGraph } from '../api';

export const useGraph = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGraph = useCallback(async (repoPath) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchGraph(repoPath);
      
      // Transform API nodes to React Flow nodes format:
      // [{ id, type: 'fileNode', position: { x, y }, data: { label, metrics, filePath } }]
      const transformedNodes = (data.nodes || []).map((node) => ({
        id: node.id,
        type: 'fileNode',
        position: node.position,
        data: {
          label: node.label,
          metrics: node.metrics,
          filePath: node.id, // node.id is the relative file path from repository root
        },
      }));

      // Transform API edges to React Flow edges format:
      // [{ id, source, target, animated: false, style: { stroke: '#334155' } }]
      const transformedEdges = (data.edges || []).map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: false,
        style: { stroke: '#334155' },
      }));

      setNodes(transformedNodes);
      setEdges(transformedEdges);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to fetch repository graph.';
      setError(errMsg);
      setNodes([]);
      setEdges([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { nodes, edges, loading, error, fetchGraph };
};
