import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kavy_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kavy_token');
    const saved = localStorage.getItem('kavy_user');

    if (!token && !saved) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        if (res?.user) {
          setUser(res.user);
          localStorage.setItem('kavy_user', JSON.stringify(res.user));
        } else {
          setUser(null);
          localStorage.removeItem('kavy_user');
          localStorage.removeItem('kavy_token');
        }
      })
      .catch((err) => {
        // If unauthorized or token invalid, clear state
        if (err.status === 401 || err.status === 403) {
          setUser(null);
          localStorage.removeItem('kavy_user');
          localStorage.removeItem('kavy_token');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await api.post('/auth/login', { email: cleanEmail, password });

    if (res.token) {
      localStorage.setItem('kavy_token', res.token);
    }
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('kavy_user', JSON.stringify(res.user));
    }

    return {
      user: res.user,
      redirectTo: res.redirectTo || (res.user?.role === 'admin' ? '/kavy-admin-x7' : '/account'),
    };
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);

    if (res.token) {
      localStorage.setItem('kavy_token', res.token);
    }
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('kavy_user', JSON.stringify(res.user));
    }

    return {
      user: res.user,
      redirectTo: res.redirectTo || '/account',
    };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore logout network errors
    } finally {
      setUser(null);
      localStorage.removeItem('kavy_user');
      localStorage.removeItem('kavy_token');
    }
  };

  const refetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('kavy_user', JSON.stringify(res.user));
      }
    } catch (e) {
      // ignore
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
