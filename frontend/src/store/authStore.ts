import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      login: (user, token) => {
        localStorage.setItem('mcgg_token', token);
        set({ user, token, isAdmin: user.role === 'admin' });
      },
      logout: () => {
        localStorage.removeItem('mcgg_token');
        localStorage.removeItem('mcgg_user');
        set({ user: null, token: null, isAdmin: false });
      },
    }),
    { name: 'mcgg_auth' }
  )
);
