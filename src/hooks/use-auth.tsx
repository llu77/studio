
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
          // This is the line that might be failing.
          await setDoc(userDocRef, newUserData);
          setUserDetails({ id: userDocRef.id, ...newUserData } as UserData);
        } else {
           setError("User profile not found in initial data.");
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
      setError(null);
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
    setLoading(true);
    setError(null);
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle fetching user details.
    } catch (error) {
      const authError = error as AuthError;
      console.error("Login Error:", authError);
       if (authError.code === 'auth/user-not-found') {
         setError("المستخدم غير موجود. الرجاء التأكد من البريد الإلكتروني.");
       } else if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
         setError("كلمة المرور غير صحيحة. الرجاء المحاولة مرة أخرى.");
       } else {
         setError("حدث خطأ غير متوقع أثناء تسجيل الدخول.");
       }
      setLoading(false);
      throw authError;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserDetails(null);
    } catch (e) {
      console.error("Logout Error:", e);
      setError((e as Error).message);
    }
  };
  
  const clearError = () => setError(null);

  const value = { user, userDetails, loading, error, login, logout, clearError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
