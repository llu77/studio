
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarContent } from "@/components/layout/sidebar-content";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Logo } from "@/components/logo";
import { Header } from "@/components/layout/header";
import { RevenueRecord } from "./revenue/page";
import { Expense } from "./expenses/page";
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc, where, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmployeeRequest } from "./requests/employees/page";


export const initialUsers = [
    // --- فرع لبن ---
    { id: 'USR001', name: 'عبدالحي', email: 'a@1.com', role: 'مشرف فرع', branch: 'فرع لبن' },
    { id: 'USR002', name: 'محمود عماره', email: 'm@1.com', role: 'موظف', branch: 'فرع لبن' },
    { id: 'USR003', name: 'علاء ناصر', email: 'alaa@1.com', role: 'موظف', branch: 'فرع لبن' },
    { id: 'USR004', name: 'السيد', email: 's@1.com', role: 'موظف', branch: 'فرع لبن' },
    // --- فرع طويق ---
    { id: 'USR005', name: 'محمد إسماعيل', email: 'm1@1.com', role: 'مشرف فرع', branch: 'فرع طويق' },
    { id: 'USR006', name: 'محمد ناصر', email: 'mn@1.com', role: 'موظف', branch: 'فرع طويق' },
    { id: 'USR007', name: 'فارس', email: 'f@1.com', role: 'موظف', branch: 'فرع طويق' },
    { id: 'USR008', name: 'السيد (طويق)', email: 's17@1.com', role: 'موظف', branch: 'فرع طويق' },
     // --- الشركاء ---
    { id: 'USR009', name: 'سالم الوادعي', email: 'w@1.com', role: 'شريك', branch: 'كافة الفروع' },
    { id: 'USR010', name: 'عبدالله المطيري', email: 'Ab@1.com', role: 'شريك', branch: 'كافة الفروع' },
    { id: 'USR011', name: 'سعود الجريسي', email: 'sa@1.com', role: 'شريك', branch: 'كافة الفروع' },
     // --- المدير ---
    { id: 'USR012', name: 'مدير النظام', email: 'admin@branchflow.com', role: 'مدير النظام', branch: 'كافة الفروع' },
];

export type User = typeof initialUsers[0];
export type Role = 'مدير النظام' | 'مشرف فرع' | 'موظف' | 'شريك';
export type Branch = 'كافة الفروع' | 'فرع لبن' | 'فرع طويق' | 'غير محدد';

// --- Contexts ---
export const BranchContext = React.createContext<{
  currentBranch: string;
  setCurrentBranch: (branch: string) => void;
}>({
  currentBranch: 'laban',
  setCurrentBranch: () => {},
});

export const UserContext = React.createContext<{
    users: User[];
    addUser: (user: User) => void;
    deleteUser: (userId: string) => void;
}>({
    users: [],
    addUser: () => {},
    deleteUser: () => {},
});


// NEW: Centralized Data Context
export const DataContext = React.createContext<{
    revenueRecords: RevenueRecord[];
    addRevenueRecord: (record: Omit<RevenueRecord, 'id' | 'status'>, branch: string) => Promise<{success: boolean, id?: string, error?: any}>;
    deleteRevenueRecord: (id: string) => Promise<void>;
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<{success: boolean, id?: string, error?: any}>;
    deleteExpense: (id: string) => Promise<void>;
    requests: EmployeeRequest[];
    addRequest: (request: Omit<EmployeeRequest, 'id'>) => Promise<{success: boolean, id?: string, error?: any}>;
    updateRequestStatus: (id: string, status: EmployeeRequest['status'], notes?: string) => Promise<void>;
    loadingData: boolean; 
}>({
    revenueRecords: [],
    addRevenueRecord: async () => ({success: false, error: 'Not implemented'}),
    deleteRevenueRecord: async () => {},
    expenses: [],
    addExpense: async () => ({success: false, error: 'Not implemented'}),
    deleteExpense: async () => {},
    requests: [],
    addRequest: async () => ({success: false, error: 'Not implemented'}),
    updateRequestStatus: async () => {},
    loadingData: true,
});


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, userDetails, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentBranch, setCurrentBranch] = useState('laban');
  const [users, setUsers] = useState<User[]>(initialUsers);

  // --- Centralized State ---
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  
  useEffect(() => {
    // This effect is temporarily disabled to prevent Firestore permission errors.
    // It should be re-enabled once the Firebase project's rule deployment is fixed.
    setLoadingData(false);
    /*
    if (authLoading) return;
    if (!userDetails) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    let active = true;

    const branchNameForQuery = currentBranch === 'laban' ? 'فرع لبن' : 'فرع طويق';
    const unsubscribers: (() => void)[] = [];

    const setupSubscription = (collectionName: string, queryConstraints: any[], setter: React.Dispatch<any>) => {
        try {
            const q = query(collection(db, collectionName), ...queryConstraints);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!active) return;
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setter(docs);
            }, (error) => {
                console.error(`Error fetching ${collectionName}:`, error);
            });
            unsubscribers.push(unsubscribe);
        } catch (error) {
            console.error(`Failed to set up subscription for ${collectionName}:`, error);
        }
    };
    
    const baseQueryOptions = [orderBy('date', 'desc'), limit(100)];
    let branchFilter = where('branch', '==', branchNameForQuery);
    
    if (userDetails.role === 'مدير النظام' || userDetails.role === 'شريك' || userDetails.role === 'مشرف فرع') {
        if (userDetails.role !== 'مشرف فرع') {
           // Admin/Partner can switch branches
           branchFilter = where('branch', '==', branchNameForQuery);
        } else {
           // Supervisor is locked to their branch
           branchFilter = where('branch', '==', userDetails.branch);
        }
        const requestBranchFilter = where('employeeBranch', '==', userDetails.role === 'مشرف فرع' ? userDetails.branch : branchNameForQuery);
        setupSubscription('revenue', [branchFilter, ...baseQueryOptions], setRevenueRecords);
        setupSubscription('expenses', [branchFilter, ...baseQueryOptions], setExpenses);
        setupSubscription('requests', [requestBranchFilter, orderBy('date', 'desc'), limit(100)], setRequests);
    } else { // Employee
        setRevenueRecords([]);
        setExpenses([]);
        setupSubscription('requests', [where('employeeId', '==', userDetails.id), orderBy('date', 'desc'), limit(50)], setRequests);
    }


    setLoadingData(false);

    return () => {
      active = false;
      unsubscribers.forEach(unsub => unsub());
    };
    */
  }, [userDetails, currentBranch, authLoading]);



  const addUser = (user: User) => {
    setUsers(prevUsers => [user, ...prevUsers]);
  };

  const deleteUser = (userId: string) => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const saveDataWithRetry = async (collectionName: string, data: any, docId?: string): Promise<{success: boolean, id?: string, error?: any}> => {
    let attempts = 0;
    const retryCount = 3;
    const retryDelay = 1000;

    while (attempts < retryCount) {
        try {
            const dataToSave = { ...data, updatedAt: serverTimestamp() };
            if (!docId) {
                dataToSave.createdAt = serverTimestamp();
            }

            let docRef;
            if (docId) {
                await updateDoc(doc(db, collectionName, docId), dataToSave);
                docRef = { id: docId };
            } else {
                docRef = await addDoc(collection(db, collectionName), dataToSave);
            }

            return { success: true, id: docRef.id };

        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} to save to ${collectionName} failed:`, error);
            if (attempts < retryCount) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
            } else {
                return { success: false, error };
            }
        }
    }
    return { success: false, error: 'Max retries reached' };
};


  const addRevenueRecord = useCallback(async (record: Omit<RevenueRecord, 'id' | 'status'>, branch: string) => {
    const isMismatched = Math.abs((record.cash + record.card) - record.totalRevenue) > 0.01;
    const distributedTotal = record.distribution.reduce((acc, dist) => acc + (dist.amount || 0), 0);
    const isDistributionUnbalanced = Math.abs(distributedTotal - record.totalRevenue) > 0.01;

    let status: RevenueRecord['status'] = 'Matched';
    if (isDistributionUnbalanced) status = 'Unbalanced';
    else if (isMismatched) status = 'Discrepancy';
    
    const branchName = branch === 'laban' ? 'فرع لبن' : 'فرع طويق';
    const newRecord = { ...record, status, branch: branchName };
    
    return saveDataWithRetry('revenue', newRecord);
  }, []);
  
  const deleteRevenueRecord = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'revenue', id));
    } catch (error) {
      console.error('Error deleting revenue record:', error);
      throw error;
    }
  }, []);
  
  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
     return saveDataWithRetry('expenses', expense);
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }, []);

  const addRequest = useCallback(async (request: Omit<EmployeeRequest, 'id'>) => {
      return saveDataWithRetry('requests', request);
  }, []);

  const updateRequestStatus = useCallback(async (id: string, status: EmployeeRequest['status'], notes?: string) => {
    try {
      const requestDocRef = doc(db, 'requests', id);
      await updateDoc(requestDocRef, { status, notes });
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }, []);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const renderLoadingScreen = (message: string) => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo />
            <p className="text-muted-foreground">{message}</p>
        </div>
    </div>
  );

  if (authLoading) {
    return renderLoadingScreen('جاري التحقق من الهوية...');
  }
  
  if (!userDetails) {
      // Don't show the "loading user data" if we are on the login page
      return router.pathname === '/login' ? <>{children}</> : renderLoadingScreen('جاري تحميل بيانات المستخدم...');
  }

  return (
    <UserContext.Provider value={{ users, addUser, deleteUser }}>
        <BranchContext.Provider value={{ currentBranch, setCurrentBranch }}>
          <DataContext.Provider value={{ revenueRecords, addRevenueRecord, deleteRevenueRecord, expenses, addExpense, deleteExpense, requests, addRequest, updateRequestStatus, loadingData }}>
              <SidebarProvider>
                  <AppSidebarContent />
                  <SidebarInset>
                      <Header />
                      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                          {loadingData ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-center text-muted-foreground">جاري تحميل بيانات الفرع...</p>
                            </div>
                          ) : children}
                      </main>
                  </SidebarInset>
              </SidebarProvider>
          </DataContext.Provider>
        </BranchContext.Provider>
    </UserContext.Provider>
  );
}
