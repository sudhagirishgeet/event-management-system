import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eventflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('eventflow_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          localStorage.setItem('eventflow_user', JSON.stringify(res.data.data.user));
        } catch (err) {
          console.error('Failed to fetch user session:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = res.data.data;
    setUser(user);
    localStorage.setItem('eventflow_user', JSON.stringify(user));
    localStorage.setItem('eventflow_token', accessToken);
    localStorage.setItem('eventflow_refresh_token', refreshToken);
    return user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { user, accessToken, refreshToken } = res.data.data;
    setUser(user);
    localStorage.setItem('eventflow_user', JSON.stringify(user));
    localStorage.setItem('eventflow_token', accessToken);
    localStorage.setItem('eventflow_refresh_token', refreshToken);
    return user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventflow_user');
    localStorage.removeItem('eventflow_token');
    localStorage.removeItem('eventflow_refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
