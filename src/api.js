import axios from 'axios';

const api = axios.create({
  // URL da API hospedada na Vercel
  baseURL: "https://taskflow-api-gamma-orcin.vercel.app"
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