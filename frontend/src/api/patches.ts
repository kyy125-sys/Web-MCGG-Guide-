import { api } from './client';
import type { Patch } from '../types';

export const patchApi = {
  getAll: () => api.get<Patch[]>('/patches'),
  getActive: () => api.get<Patch>('/patches/active'),
  getById: (id: string) => api.get<Patch>(`/patches/${id}`),
  create: (data: any) => api.post<Patch>('/patches', data),
  update: (id: string, data: any) => api.put<Patch>(`/patches/${id}`, data),
  delete: (id: string) => api.delete(`/patches/${id}`),
};
