import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import type { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'id' in value && typeof value.id === 'string' &&
    'email' in value && typeof value.email === 'string' &&
    'role' in value && (value.role === 'CUSTOMER' || value.role === 'ADMIN')
  );
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem('tazis_token');
    const storedUser = window.localStorage.getItem('tazis_user');

    if (!storedToken || !storedUser) {
      return;
    }

    try {
      const parsedUser: unknown = JSON.parse(storedUser);
      if (isUser(parsedUser)) {
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch {
      window.localStorage.removeItem('tazis_token');
      window.localStorage.removeItem('tazis_user');
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    window.localStorage.setItem('tazis_token', receivedToken);
    window.localStorage.setItem('tazis_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await api.post<User>('/auth/register', { email, password });
    return response.data;
  }, []);

  const logout = useCallback((): void => {
    window.localStorage.removeItem('tazis_token');
    window.localStorage.removeItem('tazis_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: user !== null && token !== null,
    isAdmin: user?.role === 'ADMIN',
  }), [user, token, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider.');
  }

  return context;
}
