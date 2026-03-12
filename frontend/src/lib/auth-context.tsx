'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import type { User } from '@/lib/types';
import { AxiosError } from 'axios';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(() => {
    // Hydrate from localStorage immediately to avoid flicker
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('seliv_user');
      const token = localStorage.getItem('seliv_token');
      if (token && cached) {
        try {
          return { user: JSON.parse(cached) as User, isLoading: true, isAuthenticated: true };
        } catch {
          // ignore parse error
        }
      }
    }
    return { user: null, isLoading: true, isAuthenticated: false };
  });

  // Prevent concurrent /users/me calls
  const loadingRef = useRef(false);

  const loadUser = useCallback(async () => {
    if (loadingRef.current) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('seliv_token') : null;
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }
    loadingRef.current = true;
    try {
      const res = await usersApi.getMe();
      const user = res.data.data as User;
      localStorage.setItem('seliv_user', JSON.stringify(user));
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      if (status === 401) {
        // Token invalid/expired — clear and redirect
        localStorage.removeItem('seliv_token');
        localStorage.removeItem('seliv_user');
        document.cookie = 'seliv_token=; path=/; max-age=0';
        setState({ user: null, isLoading: false, isAuthenticated: false });
      } else {
        // 429 or network error — keep cached user, stop loading
        const cached = localStorage.getItem('seliv_user');
        if (cached) {
          try {
            setState({ user: JSON.parse(cached) as User, isLoading: false, isAuthenticated: true });
          } catch {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    const { access_token: token, user } = res.data.data as { access_token: string; user: User };
    localStorage.setItem('seliv_token', token);
    localStorage.setItem('seliv_user', JSON.stringify(user));
    document.cookie = `seliv_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    setState({ user, isLoading: false, isAuthenticated: true });
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('seliv_token');
    localStorage.removeItem('seliv_user');
    document.cookie = 'seliv_token=; path=/; max-age=0';
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...updates };
      localStorage.setItem('seliv_user', JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, reload: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
