
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { AuthError } from 'firebase/auth';
import { initialUsers } from '@/app/(app)/layout';
import type { User as AppUser, Role, Branch } from '@/app/(app)/layout';


interface UserData {
  uid: string;
  email: string;
  name: string;
  role: Role;
  branch: Branch;
  id?: string;
  createdAt?: Timestamp | any;
  lastLogin?: Timestamp | any;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  userDetails: UserData | null; 
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserDetails({ id: userDoc.id, ...userDoc.data() } as UserData);
            } else {
                const appUser = initialUsers.find(u => u.email === user.email);
                if (appUser) {
                    const newUserData = { ...appUser, uid: user.uid, createdAt: serverTimestamp(), lastLogin: serverTimestamp(), isActive: true };
                    await setDoc(userDocRef, newUserData);
                    setUserDetails({ id: userDocRef.id, ...newUserData } as UserData);
                } else {
                    setUserDetails(null);
                }
            }
        } catch (error) {
            console.error("Error fetching/creating user document:", error);
            setError("Error fetching user data.");
            await signOut(auth);
            setUser(null);
            setUserDetails(null);
        }
      } else {
        setUser(null);
        setUserDetails(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
        await setPersistence(auth, browserSessionPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        return userCredential.user;
    } catch (error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
            const appUser = initialUsers.find(u => u.email === email);
            if (appUser) {
                try {
                    const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                    // The onAuthStateChanged listener will handle setting the userDoc.
                    return newUserCredential.user;
                } catch (createError: any) {
                    console.error("User Creation Error:", createError);
                    setError(createError.message);
                    throw createError;
                }
            }
        }
        console.error("Login Error:", error);
        setError((error as Error).message);
        throw error;
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
        setError((error as Error).message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = { user, userDetails, loading, error, login, logout, clearError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
