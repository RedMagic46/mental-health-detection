import { create } from 'zustand';

type UserRole = 'user' | 'admin' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
  loginApi: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerApi: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutApi: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  fetchUser: async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loginApi: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Login gagal.' };
    } catch {
      return { ok: false, error: 'Terjadi kesalahan jaringan.' };
    }
  },

  registerApi: async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Registrasi gagal.' };
    } catch {
      return { ok: false, error: 'Terjadi kesalahan jaringan.' };
    }
  },

  logoutApi: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
