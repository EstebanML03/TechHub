import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env['API_BASE_URL'] as string,
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
  return Promise.reject(error);
});

export default apiClient;
