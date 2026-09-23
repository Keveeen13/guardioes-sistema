import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Anexa o token de acesso salvo (se houver) em toda requisição
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('gcs.session');
  if (raw) {
    const session = JSON.parse(raw);
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }
  return config;
});

export default api;
