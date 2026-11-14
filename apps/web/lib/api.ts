import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('user_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('user_access_token');
      Cookies.remove('user_data');
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/account')) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(path)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);
