import { api } from './client';
import type { Commander } from '../types';

export const commanderApi = {
  getAll: () => api.get<Commander[]>('/commanders'),
  getById: (id: string) => api.get<Commander>(`/commanders/${id}`),
  create: (data: any) => api.post<Commander>('/commanders', data),
  update: (id: string, data: any) => api.put<Commander>(`/commanders/${id}`, data),
  delete: (id: string) => api.delete(`/commanders/${id}`),
};
