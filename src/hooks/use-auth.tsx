
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// NEW FEATURE: Added browserSessionPersistence and setPersistence for session management
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Auth, AuthError, UserCredential } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>; // NEW: Returns user on success
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
        // NEW FEATURE: Set session persistence
        await setPersistence(auth, browserSessionPersistence);
        const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        setLoading(false);
        throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    // NEW FEATURE: Clear local storage on logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('userBranch');
    localStorage.removeItem('userRole');
    setUser(null);
    setLoading(false);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
