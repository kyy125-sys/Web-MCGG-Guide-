import { api } from './client';

export const recommendationApi = {
  generate: (criteria: any) => api.post('/recommendations', criteria),
  getRecommended: (params?: Record<string, any>) => api.get('/recommendations', { params }),
};
