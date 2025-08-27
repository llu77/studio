
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
          const userData = userDoc.data() as UserData;
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
          return { ...userData, id: userDoc.id };
        } else {
           console.log("User document not found, waiting for Cloud Function to create it...");
           attempts++;
           if(attempts < maxAttempts) await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (e: any) {
        console.error(`Error in fetchUserDetails (Attempt ${attempts + 1}):`, e);
        attempts++;
        if(attempts >= maxAttempts) {
           setError(`Error fetching user data: ${e.message}. Please check Firestore rules and network.`);
           return null;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    setError("Failed to fetch user details after multiple attempts. The user document might not exist or there are persistent permission issues.");
    // Fallback to mock data if all attempts fail, to allow UI to render
    const mockUser = initialUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
    if (mockUser) {
        console.warn("Falling back to mock user data.");
        return {
            uid: firebaseUser.uid,
            ...mockUser,
        };
    }

    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
          if (!userDetails || userDetails.uid !== firebaseUser.uid) {
              setLoading(true);
              const details = await fetchUserDetails(firebaseUser);
              setUser(firebaseUser);
              setUserDetails(details);
              setLoading(false);
          }
      } else {
        setUser(null);
        setUserDetails(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchUserDetails, userDetails]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    clearError();
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
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
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout Error:", e);
      setError((e as Error).message);
    }
  };

  const value = { user, userDetails, loading, error, login, logout, clearError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
