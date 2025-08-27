
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  setPersistence, 
  browserSessionPersistence, 
  type AuthError
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { initialUsers } from '@/app/(app)/layout';
import type { User as AppUser, Role, Branch } from '@/app/(app)/layout';

interface UserData extends AppUser {
  uid: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  userDetails: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
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

  const clearError = () => setError(null);

  const fetchUserDetails = useCallback(async (firebaseUser: User): Promise<UserData | null> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let attempts = 0;
    const maxAttempts = 5;
    const delay = 1500; // Increased delay to give Cloud Function more time

    while(attempts < maxAttempts) {
      try {
        console.log(`Fetching user details for UID: ${firebaseUser.uid}, Attempt: ${attempts + 1}`);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          console.log("User document found in Firestore.");
          const userData = userDoc.data() as UserData;
          // Update last login time, but don't block for it
          setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true }).catch(e => console.warn("Failed to update last login:", e));
          return { ...userData, id: userDoc.id };
        } else {
           console.log("User document not found, waiting for Cloud Function to create it...");
           attempts++;
           if(attempts < maxAttempts) await new Promise(resolve => setTimeout(resolve, delay * attempts)); // Exponential backoff
        }

      } catch (e: any) {
        attempts++;
        console.error(`Error in fetchUserDetails (Attempt ${attempts + 1}):`, e);
        if (attempts >= maxAttempts) {
           setError(`Error fetching user data after multiple attempts: ${e.message}. Please contact support.`);
           return null;
        }
        await new Promise(resolve => setTimeout(resolve, delay * attempts));
      }
    }
    
    setError("Failed to fetch user details. The user document might not exist or there are persistent permission issues.");
    // Fallback to mock data if all else fails to prevent a total crash
    const mockUser = initialUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
    if (mockUser) {
        console.warn("CRITICAL FALLBACK: Using mock user data as a last resort.");
        return {
            uid: firebaseUser.uid,
            ...mockUser,
        };
    }

    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      if (firebaseUser) {
          const details = await fetchUserDetails(firebaseUser);
          setUser(firebaseUser);
          setUserDetails(details);
      } else {
        setUser(null);
        setUserDetails(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserDetails]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    clearError();
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle fetching user details.
      return true;
    } catch (error) {
      const authError = error as AuthError;
      console.error("Login Error:", authError);
       if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
         setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
       } else {
         setError("حدث خطأ غير متوقع أثناء تسجيل الدخول.");
       }
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserDetails(null);
    } catch (e) {
      console.error("Logout Error:", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const value = { user, userDetails, loading, error, login, logout, clearError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
