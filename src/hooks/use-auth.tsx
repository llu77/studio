
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

  const fetchUserDetails = useCallback(async (firebaseUser: User): Promise<UserData | null> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      console.log(`Fetching user details for UID: ${firebaseUser.uid}`);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        console.log('User document exists. Updating last login.');
        const userData = userDoc.data() as UserData;
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        return { id: userDoc.id, ...userData };
      } else {
        console.log('User document does not exist. Attempting to create from initialUsers.');
        const appUser = initialUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
        if (appUser) {
          const newUserData: Omit<AppUser, 'id'> & { uid: string, createdAt: any, lastLogin: any, isActive: boolean } = {
             ...appUser,
             uid: firebaseUser.uid,
             createdAt: serverTimestamp(),
             lastLogin: serverTimestamp(),
             isActive: true
          };
          delete (newUserData as any).id;
          await setDoc(userDocRef, newUserData);
          console.log('New user document created successfully from initialUsers.');
          return { id: userDocRef.id, ...newUserData } as UserData;
        } else {
           console.error("User profile not found in initial static data.");
           throw new Error("User profile not found in initial data.");
        }
      }
    } catch (e: any) {
      console.error("Error in fetchUserDetails:", e);
      // **الحل البديل الفوري**
      console.warn("Firestore access failed. Falling back to mock user data.");
      const mockUser = initialUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
      if (mockUser) {
        setError("فشل الاتصال بقاعدة البيانات، تم استخدام بيانات محلية.");
        return {
          uid: firebaseUser.uid,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          branch: mockUser.branch,
          id: mockUser.id
        } as UserData;
      }
      // إذا فشل كل شيء، قم بتسجيل الخروج لمنع حالة غير متناسقة
      await signOut(auth);
      setError(`Error fetching user data: ${e.message}. Please check Firestore rules and network.`);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!userDetails || userDetails.uid !== firebaseUser.uid) { // Prevent re-fetching on token refresh
          setLoading(true);
          const details = await fetchUserDetails(firebaseUser);
          setUserDetails(details);
          setUser(firebaseUser);
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      const authError = error as AuthError;
      console.error("Login Error:", authError);
       if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
         setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
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
