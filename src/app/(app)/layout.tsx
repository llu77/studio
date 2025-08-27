
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
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc, where } from 'firebase/firestore';
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
    loadingData: boolean; 
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
    // **الحل الجذري:** لا تحاول جلب البيانات إلا بعد التأكد من اكتمال المصادقة وتحميل بيانات المستخدم
    if (authLoading || !userDetails) {
        setLoadingData(authLoading);
        return;
    }
    
    setLoadingData(true);
    let active = true;

    const branchName = currentBranch === 'laban' ? 'فرع لبن' : 'فرع طويق';
    
    // مصفوفة للاحتفاظ بجميع المستمعين لإلغاء الاشتراك عند الخروج
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
                // هنا يمكن إضافة منطق لمعالجة أخطاء الصلاحيات بشكل خاص
                if (error.code === 'permission-denied') {
                    // عرض رسالة للمستخدم أو إعادة التوجيه
                }
            });
            unsubscribers.push(unsubscribe);
        } catch (error) {
            console.error(`Failed to set up subscription for ${collectionName}:`, error);
        }
    };

    // جلب البيانات بناءً على دور المستخدم والفرع المحدد
    if (userDetails.role === 'مدير النظام' || userDetails.role === 'شريك') {
        setupSubscription('revenue', [where('branch', '==', branchName)], setRevenueRecords);
        setupSubscription('expenses', [where('branch', '==', branchName)], setExpenses);
        setupSubscription('requests', [orderBy('date', 'desc')], setRequests);
    } else if (userDetails.role === 'مشرف فرع') {
        setupSubscription('revenue', [where('branch', '==', userDetails.branch)], setRevenueRecords);
        setupSubscription('expenses', [where('branch', '==', userDetails.branch)], setExpenses);
        setupSubscription('requests', [where('employeeBranch', '==', userDetails.branch)], setRequests);
    } else { // موظف
        // الموظف يرى طلباته فقط، ويتم فلترتها في المكون الخاص بها
        // لا حاجة لجلب بيانات الإيرادات والمصاريف على مستوى الـ layout للموظف العادي
        setRevenueRecords([]);
        setExpenses([]);
        // جلب الطلبات الخاصة بالموظف
        setupSubscription('requests', [where('employeeId', '==', userDetails.uid)], setRequests);
    }

    setLoadingData(false);

    return () => {
      active = false;
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userDetails, currentBranch, authLoading]);



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

  if (authLoading || !userDetails) { // عرض شاشة التحميل طالما أن المصادقة أو جلب البيانات لم يكتمل
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Logo />
                <p className="text-muted-foreground">
                    {authLoading ? 'جاري التحقق من الهوية...' : 'جاري تحميل بيانات المستخدم...'}
                </p>
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
