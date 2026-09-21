import axios from 'axios';

const api = axios.create({
  // Em desenvolvimento local use: "http://localhost:3000"
  // Em produção use a URL da sua API na Vercel/Render
  baseURL: "http://localhost:3000"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;