"use client";

import type { User } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // For redirecting after logout

  useEffect(() => {
    const storedUser = localStorage.getItem('decentralizeit-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('decentralizeit-user');
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (email: string, name: string) => {
    const mockUser: User = { 
      id: `user_${Date.now()}`, 
      email, 
      name, 
      walletAddress: `0x${Math.random().toString(16).slice(2, 12)}` 
    };
    setUser(mockUser);
    localStorage.setItem('decentralizeit-user', JSON.stringify(mockUser));
    router.push('/dashboard');
  };
  
  const login = (email: string, name: string) => { // Name passed for simplicity, real login wouldn't need it
    handleAuthSuccess(email, name);
  };

  const register = (email: string, name: string) => {
    handleAuthSuccess(email, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('decentralizeit-user');
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
