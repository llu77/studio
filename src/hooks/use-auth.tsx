
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AuthError } from 'firebase/auth';
import { initialUsers } from '@/app/(app)/layout';
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
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserDetails({ id: userDoc.id, ...userDoc.data() } as AppUser & { id: string });
        } else {
            // This case handles when a user is in Auth but not in Firestore.
            // We can create the Firestore doc from our initialUsers list.
            const appUser = initialUsers.find(u => u.email === user.email);
            if (appUser) {
                try {
                    await setDoc(userDocRef, appUser);
                    setUserDetails({ id: userDocRef.id, ...appUser } as AppUser & { id: string });
                } catch (e) {
                     console.error("Error setting user document:", e);
                     setUserDetails(null);
                     await signOut(auth);
                }
            } else {
                // If user is not in our initial list, they shouldn't be here.
                setUserDetails(null);
                await signOut(auth);
            }
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
        return userCredential.user;
    } catch (error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found') {
            const appUser = initialUsers.find(u => u.email === email);
            if (appUser) {
                try {
                    const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                    // The onAuthStateChanged listener will handle setting the userDoc.
                    return newUserCredential.user;
                } catch (createError) {
                    console.error("User Creation Error:", createError);
                    throw createError;
                }
            }
        }
        console.error("Login Error:", error);
        throw error;
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
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
