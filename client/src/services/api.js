import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nivara_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If network error / offline
    if (!error.response) {
      console.warn('[Network/Offline Error]', error.message);
      return Promise.reject({
        isOffline: true,
        message: 'Network unreachable or offline. Saved data is still accessible.',
      });
    }
    return Promise.reject(error.response.data || { message: error.message });
  }
);

export default API;
