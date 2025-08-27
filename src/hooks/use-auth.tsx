
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
    const delay = 1000;

    while(attempts < maxAttempts) {
      try {
        console.log(`Fetching user details for UID: ${firebaseUser.uid}, Attempt: ${attempts + 1}`);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          console.log("User document found in Firestore.");
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
          return userDoc.data() as UserData;
        } else {
           console.log("User document not found, attempting to create it...");
           const initialUserData = initialUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
           if (initialUserData) {
             const newUserDoc = {
                uid: firebaseUser.uid,
                name: initialUserData.name,
                email: firebaseUser.email,
                role: initialUserData.role,
                branch: initialUserData.branch,
                isActive: true,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            };
            await setDoc(userDocRef, newUserDoc);
            console.log(`Successfully created Firestore document for user: ${firebaseUser.uid}`);
            // Return a snapshot-like object after creation
            return { ...newUserDoc, createdAt: new Timestamp(Date.now()/1000, 0), lastLogin: new Timestamp(Date.now()/1000, 0)} as UserData;
           } else {
             throw new Error(`No initial user data found for email: ${firebaseUser.email}`);
           }
        }
      } catch (e: any) {
        attempts++;
        console.error(`Error in fetchUserDetails (Attempt ${attempts}):`, e);
        if(attempts >= maxAttempts) {
          break; 
        }
        await new Promise(resolve => setTimeout(resolve, delay * attempts));
      }
    }
    
    console.error("Failed to fetch user details from Firestore after multiple attempts.");
    setError("فشل الاتصال بقاعدة البيانات. الرجاء التأكد من صلاحيات الوصول.");
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
      // Let onAuthStateChanged handle the rest.
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
