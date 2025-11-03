import axios from 'axios';
import { environment } from '../../environments/environment';

const apiClient = axios.create({
  baseURL: environment.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: any) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores globales
apiClient.interceptors.response.use((response: any) => {
  return response;
}, (error: any) => {
  console.error('API Error:', error.response || error.message);
  
  // Si el error es 401 (No autorizado), eliminar el token y redirigir al login
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  }
  
  return Promise.reject(error);
});

export default apiClient;
