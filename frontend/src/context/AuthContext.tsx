import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('newsportal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('newsportal_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('newsportal_user', JSON.stringify(res.data.data));
        } catch (err) {
          console.warn('Failed to verify existing session:', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('newsportal_token');
          localStorage.removeItem('newsportal_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('newsportal_token', newToken);
    localStorage.setItem('newsportal_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('newsportal_token');
      localStorage.removeItem('newsportal_user');
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedFields };
      setUser(newUser);
      localStorage.setItem('newsportal_user', JSON.stringify(newUser));
    }
  };

  const role = user?.role;
  const isAuthenticated = !!user;
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isEditor = isAdmin || role === 'EDITOR';
  const isStaff = isEditor || role === 'AUTHOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
        isEditor,
        isStaff,
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
