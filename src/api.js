import axios from 'axios'

const api = axios.create({
  // Coloque a URL do seu BACKEND (ex: https://task-flow-backend.vercel.app ou Render/Railway)
  baseURL: "https://seu-backend.vercel.app"
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api