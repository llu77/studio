
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarContent } from "@/components/layout/sidebar-content";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { Logo } from "@/components/logo";
import { Header } from "@/components/layout/header";
import { RevenueRecord } from "./revenue/page";
import { Expense } from "./expenses/page";
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
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
    addRevenueRecord: (record: Omit<RevenueRecord, 'id' | 'status'>, branch: string) => Promise<void>;
    deleteRevenueRecord: (id: string) => Promise<void>;
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    requests: EmployeeRequest[];
    addRequest: (request: Omit<EmployeeRequest, 'id'>) => Promise<void>;
    updateRequestStatus: (id: string, status: EmployeeRequest['status'], notes?: string) => Promise<void>;
    loadingData: boolean; // NEW FEATURE: Add loading state
}>({
    revenueRecords: [],
    addRevenueRecord: async () => {},
    deleteRevenueRecord: async () => {},
    expenses: [],
    addExpense: async () => {},
    deleteExpense: async () => {},
    requests: [],
    addRequest: async () => {},
    updateRequestStatus: async () => {},
    loadingData: true,
});


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentBranch, setCurrentBranch] = useState('laban');
  const [users, setUsers] = useState<User[]>(initialUsers);

  // --- Centralized State ---
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const loadingCounter = useRef(3); 

  const onDataLoaded = () => {
    loadingCounter.current -= 1;
    if (loadingCounter.current <= 0) {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    setLoadingData(true);
    loadingCounter.current = 3;

    const branchName = currentBranch === 'laban' ? 'فرع لبن' : 'فرع طويق';

    // Revenue Listener
    const revenueQuery = query(collection(db, 'revenue'), orderBy('date', 'desc'));
    const unsubRevenue = onSnapshot(revenueQuery, 
      (snapshot) => {
        const allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RevenueRecord[];
        setRevenueRecords(allRecords.filter(r => r.branch === branchName));
        onDataLoaded();
      }, 
      (error) => {
        console.error("Error fetching revenue: ", error);
        onDataLoaded();
      }
    );

    // Expenses Listener
    const expensesQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsubExpenses = onSnapshot(expensesQuery,
      (snapshot) => {
        const allExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];
        setExpenses(allExpenses.filter(e => e.branch === branchName));
        onDataLoaded();
      },
      (error) => {
        console.error("Error fetching expenses: ", error);
        onDataLoaded();
      }
    );

    // Requests Listener
    const requestsQuery = query(collection(db, 'requests'), orderBy('date', 'desc'));
    const unsubRequests = onSnapshot(requestsQuery,
      (snapshot) => {
        const allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EmployeeRequest[];
        setRequests(allRequests); // Requests are filtered by role in their respective pages
        onDataLoaded();
      },
      (error) => {
        console.error("Error fetching requests: ", error);
        onDataLoaded();
      }
    );
    
    return () => {
      unsubRevenue();
      unsubExpenses();
      unsubRequests();
    };
  }, [user, currentBranch]);



  const addUser = (user: User) => {
    setUsers(prevUsers => [user, ...prevUsers]);
  };

  const deleteUser = (userId: string) => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const addRevenueRecord = async (record: Omit<RevenueRecord, 'id' | 'status'>, branch: string) => {
    const isMismatched = Math.abs((record.cash + record.card) - record.totalRevenue) > 0.01;
    const distributedTotal = record.distribution.reduce((acc, dist) => acc + (dist.amount || 0), 0);
    const isDistributionUnbalanced = Math.abs(distributedTotal - record.totalRevenue) > 0.01;

    let status: RevenueRecord['status'] = 'Matched';
    if (isDistributionUnbalanced) {
      status = 'Unbalanced';
    } else if (isMismatched) {
      status = 'Discrepancy';
    }

    const branchName = branch === 'laban' ? 'فرع لبن' : 'فرع طويق';
    const newRecord = { ...record, status, branch: branchName };
    await addDoc(collection(db, 'revenue'), newRecord);
  };
  
  const deleteRevenueRecord = async (id: string) => {
    await deleteDoc(doc(db, 'revenue', id));
  };
  
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    await addDoc(collection(db, 'expenses'), expense);
  }

  const deleteExpense = async (id: string) => {
    await deleteDoc(doc(db, 'expenses', id));
  }

  const addRequest = async (request: Omit<EmployeeRequest, 'id'>) => {
      await addDoc(collection(db, 'requests'), request);
  };

  const updateRequestStatus = async (id: string, status: EmployeeRequest['status'], notes?: string) => {
      const requestDocRef = doc(db, 'requests', id);
      await updateDoc(requestDocRef, { status, notes });
  };


  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const isLoading = authLoading || loadingData;

  if (isLoading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Logo />
                <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
        </div>
    );
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
                          {children}
                      </main>
                  </SidebarInset>
              </SidebarProvider>
          </DataContext.Provider>
        </BranchContext.Provider>
    </UserContext.Provider>
  );
}

    
