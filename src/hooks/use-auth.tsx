
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  setPersistence, 
  browserSessionPersistence, 
  createUserWithEmailAndPassword,
  type AuthError
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        setUserDetails({ id: userDoc.id, ...userData });
      } else {
        const appUser = initialUsers.find(u => u.email === firebaseUser.email);
        if (appUser) {
          const newUserData: Omit<AppUser, 'id'> & { uid: string, createdAt: any, lastLogin: any, isActive: boolean } = {
             ...appUser,
             uid: firebaseUser.uid,
             createdAt: serverTimestamp(),
             lastLogin: serverTimestamp(),
             isActive: true
          };
          await setDoc(userDocRef, newUserData);
          setUserDetails({ id: userDocRef.id, ...newUserData } as UserData);
        }
      }
    } catch (e: any) {
      console.error("Error fetching/creating user document:", e);
      setError("Error fetching user data. Permissions might be incorrect.");
      await signOut(auth);
      setUser(null);
      setUserDetails(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserDetails(firebaseUser);
      } else {
        setUser(null);
        setUserDetails(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserDetails]);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
        const appUser = initialUsers.find(u => u.email === email);
        if (appUser) {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the rest
          } catch (createError: any) {
            console.error("User Creation Error:", createError);
            setError(createError.message);
            throw createError;
          }
        } else {
            setError("Invalid credentials or user not found in initial list.");
            throw error;
        }
      } else {
         console.error("Login Error:", error);
         setError((error as Error).message);
         throw error;
      }
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout Error:", e);
      setError((e as Error).message);
    }
  };
  
  const clearError = () => setError(null);

  const value = { user, userDetails, loading, error, login, logout, clearError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
