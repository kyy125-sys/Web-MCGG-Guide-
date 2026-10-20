import { api } from './client';
import type { User } from '../types';

export const authApi = {
  login: (data: { email: string; password?: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', data),
  register: (data: { email: string; password?: string }) =>
    api.post<{ user: User; token: string }>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
};
