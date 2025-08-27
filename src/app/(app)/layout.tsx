
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarContent } from "@/components/layout/sidebar-content";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Header } from "@/components/layout/header";
import { RevenueRecord } from "./revenue/page";
import { Expense } from "./expenses/page";


const initialUsers = [
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


// --- Mock Data ---
const initialRevenueData: RevenueRecord[] = [
  {
    id: "REV001",
    date: "2024-07-28",
    totalRevenue: 3250,
    cash: 1250,
    card: 2000,
    distribution: [
      { employeeName: "محمود عماره", amount: 1600 },
      { employeeName: "علاء ناصر", amount: 1650 },
    ],
    status: "Matched",
  },
  {
    id: "REV002",
    date: "2024-07-27",
    totalRevenue: 2900,
    cash: 900,
    card: 2000,
    distribution: [
      { employeeName: "عبدالحي", amount: 2900 },
    ],
    status: "Matched",
  },
   {
    id: "REV003",
    date: "2024-07-26",
    totalRevenue: 1800,
    cash: 800,
    card: 1050,
    distribution: [
      { employeeName: "السيد", amount: 1800 },
    ],
    status: "Discrepancy",
    discrepancyReason: "زيادة 50 ريال في صندوق الشبكة."
  },
];

const initialExpensesData: Expense[] = [
    { id: 'EXP001', date: '2024-07-28', branch: 'فرع لبن', category: 'فواتير', amount: 450.00, description: 'فاتورة كهرباء شهر يوليو' },
    { id: 'EXP002', date: '2024-07-27', branch: 'فرع طويق', category: 'صيانة', amount: 1200.00, description: 'إصلاح مكيف الهواء' },
    { id: 'EXP003', date: '2024-07-25', branch: 'فرع لبن', category: 'مستلزمات تشغيلية', amount: 350.00, description: 'شراء مواد تنظيف' },
];


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
    addRevenueRecord: (record: Omit<RevenueRecord, 'id' | 'status'>) => void;
    deleteRevenueRecord: (id: string) => void;
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    deleteExpense: (id: string) => void;
}>({
    revenueRecords: [],
    addRevenueRecord: () => {},
    deleteRevenueRecord: () => {},
    expenses: [],
    addExpense: () => {},
    deleteExpense: () => {},
});


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentBranch, setCurrentBranch] = useState('laban');
  const [users, setUsers] = useState<User[]>(initialUsers);

  // --- Centralized State ---
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>(initialRevenueData);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpensesData);

  const addUser = (user: User) => {
    setUsers(prevUsers => [user, ...prevUsers]);
  };

  const deleteUser = (userId: string) => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const addRevenueRecord = (record: Omit<RevenueRecord, 'id' | 'status'>) => {
    const isMismatched = Math.abs((record.cash + record.card) - record.totalRevenue) > 0.01;
    const distributedTotal = record.distribution.reduce((acc, dist) => acc + (dist.amount || 0), 0);
    const isDistributionUnbalanced = Math.abs(distributedTotal - record.totalRevenue) > 0.01;

    let status: RevenueRecord['status'] = 'Matched';
    if (isDistributionUnbalanced) {
      status = 'Unbalanced';
    } else if (isMismatched) {
      status = 'Discrepancy';
    }

    const newRecord: RevenueRecord = {
      id: `REV${String(revenueRecords.length + 1).padStart(3, '0')}`,
      ...record,
      status,
    };
    setRevenueRecords(prev => [newRecord, ...prev]);
  };
  
  const deleteRevenueRecord = (id: string) => {
    setRevenueRecords(prev => prev.filter(record => record.id !== id));
  };
  
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
        id: `EXP${String(expenses.length + 1).padStart(3, '0')}`,
        ...expense
    };
    setExpenses(prev => [newExpense, ...prev]);
  }

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  }


  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
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
          <DataContext.Provider value={{ revenueRecords, addRevenueRecord, deleteRevenueRecord, expenses, addExpense, deleteExpense }}>
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
