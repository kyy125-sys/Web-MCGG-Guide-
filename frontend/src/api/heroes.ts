import { api } from './client';
import type { Hero } from '../types';

export const heroApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<{ heroes: Hero[]; total: number; page: number; limit: number }>('/heroes', { params }),
  getById: (id: string) => api.get<Hero>(`/heroes/${id}`),
  create: (data: any) => api.post<Hero>('/heroes', data),
  update: (id: string, data: any) => api.put<Hero>(`/heroes/${id}`, data),
  delete: (id: string) => api.delete(`/heroes/${id}`),
  import: (heroes: any[]) => api.post('/heroes/import', heroes),
};
