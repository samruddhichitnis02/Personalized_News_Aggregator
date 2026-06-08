import axios from 'axios';

// In development: uses http://localhost:8000
// In production:  uses VITE_API_URL set at Docker build time
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const register = (email: string, password: string, topics: string[], country: string) =>
  api.post('/auth/register', { email, password, topics, country });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

export const updatePreferences = (topics: string[], country: string) =>
  api.put('/auth/preferences', { topics, country });

// News endpoints
export const getFeed = () => api.get('/news/feed');
export const getTopics = () => api.get('/news/topics');
export const getCountries = () => api.get('/news/countries');

// Search endpoints
export const searchNews = (q: string, page: number = 1) =>
  api.get(`/news/search?q=${encodeURIComponent(q)}&page=${page}`);

// Bookmark endpoints
export const getBookmarks = () => api.get('/bookmarks/');
export const addBookmark = (data: object) => api.post('/bookmarks/', data);
export const deleteBookmark = (id: number) => api.delete(`/bookmarks/${id}`);

export default api;