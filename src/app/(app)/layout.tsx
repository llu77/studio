
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
    { id: 'USR001', name: 'المدير العام', email: 'admin@branchflow.com', role: 'مدير النظام', branch: 'كافة الفروع' },
    { id: 'USR002', name: 'أحمد علي', email: 'ahmed@branchflow.com', role: 'موظف', branch: 'فرع لبن' },
    { id: 'USR003', name: 'يوسف خالد', email: 'youssef@branchflow.com', role: 'مشرف فرع', branch: 'فرع طويق' },
    { id: 'USR004', name: 'عبدالحي', email: 'abdulhai@branchflow.com', role: 'موظف', branch: 'فرع طويق' },
    { id: 'USR005', name: 'فاطمة محمد', email: 'fatima@branchflow.com', role: 'موظف', branch: 'فرع لبن' },
];

export type User = typeof initialUsers[0];
export type Role = 'مدير النظام' | 'مشرف فرع' | 'موظف';
export type Branch = 'كافة الفروع' | 'فرع لبن' | 'فرع طويق' | 'غير محدد';


// --- Mock Data ---
const initialRevenueData: RevenueRecord[] = [
  {
    id: "REV001",
    date: "2024-07-20",
    totalRevenue: 2500,
    cash: 1000,
    card: 1500,
    distribution: [
      { employeeName: "أحمد علي", amount: 1300 },
      { employeeName: "فاطمة محمد", amount: 1200 },
    ],
    status: "Matched",
  },
  {
    id: "REV002",
    date: "2024-07-19",
    totalRevenue: 1800,
    cash: 800,
    card: 1050,
    distribution: [
      { employeeName: "أحمد علي", amount: 1800 },
    ],
    status: "Discrepancy",
    discrepancyReason: "زيادة 50 ريال في صندوق الشبكة."
  },
];

const initialExpensesData: Expense[] = [
    { id: 'EXP001', date: '2024-07-21', branch: 'فرع لبن', category: 'فواتير', amount: 450.00, description: 'فاتورة كهرباء شهر يوليو' },
    { id: 'EXP002', date: '2024-07-20', branch: 'فرع طويق', category: 'صيانة', amount: 1200.00, description: 'إصلاح مكيف الهواء' },
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

  // Inject props into child pages
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
        // A more robust way to pass props, checking the component's type if possible
        // For simplicity, we'll pass all shared state and functions.
        // A more advanced solution might involve a dedicated context provider for shared data.
        return React.cloneElement(child, {
            revenueRecords,
            expenses,
            addRevenueRecord,
            deleteRevenueRecord,
            addExpense,
            deleteExpense
        } as any);
    }
    return child;
  });


  return (
    <UserContext.Provider value={{ users, addUser, deleteUser }}>
        <BranchContext.Provider value={{ currentBranch, setCurrentBranch }}>
            <SidebarProvider>
                <AppSidebarContent />
                <SidebarInset>
                    <Header />
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        {childrenWithProps}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </BranchContext.Provider>
    </UserContext.Provider>
  );
}
