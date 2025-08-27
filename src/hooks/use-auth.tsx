
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Auth, AuthError } from 'firebase/auth';
import type { User as AppUser, Role, Branch } from '@/app/(app)/layout';

interface AuthContextType {
  user: User | null;
  userDetails: (AppUser & { id: string }) | null; // Now includes the document ID
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<(AppUser & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setLoading(true);
        // Fetch user details from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserDetails({ id: userDoc.id, ...userDoc.data() } as AppUser & { id: string });
        } else {
            // Handle case where user exists in Auth but not Firestore
            setUserDetails(null); 
            // Optional: logout user if their record is deleted from Firestore
            await signOut(auth);
        }
        setLoading(false);
      } else {
        setUserDetails(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
        await setPersistence(auth, browserSessionPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // The onAuthStateChanged listener will handle setting user and userDetails state
        return userCredential.user;
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    } finally {
        setUser(null);
        setUserDetails(null);
    }
  };

  const value = { user, userDetails, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
