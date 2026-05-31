import axios from 'axios';

// base axios instance pointing to our FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auth endpoints
export const register = (email: string, password: string, topics: string[]) =>
  api.post('/auth/register', { email, password, topics });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// news endpoints
export const getFeed = () => api.get('/news/feed');
export const getTopics = () => api.get('/news/topics');

// bookmark endpoints
export const getBookmarks = () => api.get('/bookmarks/');
export const addBookmark = (data: object) => api.post('/bookmarks/', data);
export const deleteBookmark = (id: number) => api.delete(`/bookmarks/${id}`);

export default api;

// search endpoints
export const searchNews = (q: string, page: number = 1) =>
  api.get(`/news/search?q=${encodeURIComponent(q)}&page=${page}`);