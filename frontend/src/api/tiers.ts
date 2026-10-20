import { api } from './client';
import type { TierEntry } from '../types';

export const tierApi = {
  getAll: (params?: Record<string, any>) => api.get<TierEntry[]>('/tiers', { params }),
  upsert: (data: Partial<TierEntry>) => api.post<TierEntry>('/tiers', data),
  delete: (id: string) => api.delete(`/tiers/${id}`),
};
