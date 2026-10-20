import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.success) {
          setUser(res.user);
          setProfile(res.profile);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('[AuthContext] Session expired or invalid token.');
        authService.logout();
        setUser(null);
        setProfile(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      // Fetch fresh profile
      try {
        const meRes = await authService.getMe();
        setProfile(meRes.profile);
      } catch (e) {}
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      setUser(res.user);
      setToken(res.token);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success) {
        setUser(res.user);
        setProfile(res.profile);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
