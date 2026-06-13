import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchGraph = async (path) => {
  const response = await api.get('/api/graph', { params: { path } });
  return response.data;
};

export const fetchSummary = async (filePath) => {
  const response = await api.get('/api/summary', { params: { file: filePath } });
  return response.data;
};

export const fetchMetrics = async (filePath) => {
  const response = await api.get('/api/metrics', { params: { file: filePath } });
  return response.data;
};

export default api;
