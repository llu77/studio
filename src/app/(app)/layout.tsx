
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarContent } from "@/components/layout/sidebar-content";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Header } from "@/components/layout/header";

// --- Data ---
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

  const addUser = (user: User) => {
    setUsers(prevUsers => [user, ...prevUsers]);
  };

  const deleteUser = (userId: string) => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

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
            <SidebarProvider>
                <AppSidebarContent />
                <SidebarInset>
                    <Header />
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </BranchContext.Provider>
    </UserContext.Provider>
  );
}
