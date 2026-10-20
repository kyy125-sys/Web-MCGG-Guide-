import { api } from './client';
import type { Lineup } from '../types';

export const lineupApi = {
  getAll: (params?: Record<string, any>) => api.get<Lineup[]>('/lineups', { params }),
  getById: (id: string) => api.get<Lineup>(`/lineups/${id}`),
  create: (data: any) => api.post<Lineup>('/lineups', data),
  update: (id: string, data: any) => api.put<Lineup>(`/lineups/${id}`, data),
  delete: (id: string) => api.delete(`/lineups/${id}`),
  duplicate: (id: string) => api.post<Lineup>(`/lineups/${id}/duplicate`),
};
