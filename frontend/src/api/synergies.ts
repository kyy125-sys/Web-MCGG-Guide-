import { api } from './client';
import type { Synergy } from '../types';

export const synergyApi = {
  getAll: () => api.get<Synergy[]>('/synergies'),
  getById: (id: string) => api.get<Synergy>(`/synergies/${id}`),
  create: (data: any) => api.post<Synergy>('/synergies', data),
  update: (id: string, data: any) => api.put<Synergy>(`/synergies/${id}`, data),
  delete: (id: string) => api.delete(`/synergies/${id}`),
};
