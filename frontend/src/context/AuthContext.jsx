import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('medtrace_token');
    const savedUser = localStorage.getItem('medtrace_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch {
        localStorage.removeItem('medtrace_token');
        localStorage.removeItem('medtrace_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (id, password) => {
    try {
      const res = await api.post('/auth/login', { id, password });
      const { token: backendToken, user: backendUser } = res.data;
      setUser(backendUser);
      setToken(backendToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
      localStorage.setItem('medtrace_token', backendToken);
      localStorage.setItem('medtrace_user', JSON.stringify(backendUser));
      return { success: true, user: backendUser };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Invalid credentials',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('medtrace_token');
    localStorage.removeItem('medtrace_user');
  };

  const value = { user, token, loading, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
