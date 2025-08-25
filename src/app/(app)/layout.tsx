
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarContent } from "@/components/layout/sidebar-content";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Header } from "@/components/layout/header";

export const BranchContext = React.createContext<{
  currentBranch: string;
  setCurrentBranch: (branch: string) => void;
}>({
  currentBranch: 'laban',
  setCurrentBranch: () => {},
});


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentBranch, setCurrentBranch] = useState('laban');

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
  );
}
