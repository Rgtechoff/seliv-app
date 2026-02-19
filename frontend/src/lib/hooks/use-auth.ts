'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('seliv_token') : null;
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await usersApi.getMe();
      const user = res.data.data as User;
      if (typeof window !== 'undefined') {
        localStorage.setItem('seliv_user', JSON.stringify(user));
      }
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      localStorage.removeItem('seliv_token');
      localStorage.removeItem('seliv_user');
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { access_token: token, user } = res.data.data as { access_token: string; user: User };
    localStorage.setItem('seliv_token', token);
    localStorage.setItem('seliv_user', JSON.stringify(user));
    // Cookie nécessaire pour le middleware Next.js (server-side)
    document.cookie = `seliv_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    setState({ user, isLoading: false, isAuthenticated: true });
    return user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('seliv_token');
    localStorage.removeItem('seliv_user');
    document.cookie = 'seliv_token=; path=/; max-age=0';
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push('/login');
  }, [router]);

  const updateUser = (updates: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...updates };
      localStorage.setItem('seliv_user', JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  };

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
    updateUser,
    reload: loadUser,
  };
}
