import axios from 'axios';
import { API_URL } from '../utils/constants';
import { supabase } from './supabase';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Auth API
export const authAPI = {
  verify: () => api.get('/auth/verify'),
  me: () => api.get('/auth/me'),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: number) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: number, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// Tasks API
export const tasksAPI = {
  getByProject: (projectId: number) => api.get(`/projects/${projectId}/tasks`),
  create: (projectId: number, data: any) => api.post(`/projects/${projectId}/tasks`, data),
  update: (id: number, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  getMyTasks: () => api.get('/my-tasks'),
};

// Members API
export const membersAPI = {
  getByProject: (projectId: number) => api.get(`/projects/${projectId}/members`),
  add: (projectId: number, data: any) => api.post(`/projects/${projectId}/members`, data),
  update: (projectId: number, userId: string, data: any) => 
    api.put(`/projects/${projectId}/members/${userId}`, data),
  remove: (projectId: number, userId: string) => 
    api.delete(`/projects/${projectId}/members/${userId}`),
};


// Users API (for searching users)
export const usersAPI = {
  search: (email: string) => api.get(`/users/search?email=${encodeURIComponent(email)}`),
  getById: (id: string) => api.get(`/users/${id}`),
};

// Files API
export const filesAPI = {
  getByProject: (projectId: number) => api.get(`/projects/${projectId}/files`),
  upload: (projectId: number, data: any) => api.post(`/projects/${projectId}/files`, data),
  delete: (fileId: number) => api.delete(`/files/${fileId}`),
};

export default api;