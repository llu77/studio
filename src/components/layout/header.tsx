
"use client";

import React, { useContext } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Building } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BranchContext } from '@/app/(app)/layout';


function getPageTitle(pathname: string) {
    if (pathname === '/') return 'لوحة التحكم';
    if (pathname.startsWith('/revenue')) return 'الإيرادات';
    if (pathname.startsWith('/expenses')) return 'المصاريف';
    if (pathname.startsWith('/bonuses')) return 'البونص';
    if (pathname.startsWith('/requests/employees')) return 'طلبات الموظفين';
    if (pathname.startsWith('/requests/products')) return 'نقطة البيع';
    if (pathname.startsWith('/users')) return 'إدارة المستخدمين';
    if (pathname.startsWith('/reports')) return 'التقارير';
    if (pathname.startsWith('/settings')) return 'الإعدادات';
    return 'BranchFlow';
}


export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { currentBranch, setCurrentBranch } = useContext(BranchContext);


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold md:text-2xl">{pageTitle}</h1>
      </div>

       <div className="flex items-center gap-2 md:gap-4">
        <div className="w-36 md:w-48">
            <Select value={currentBranch} onValueChange={setCurrentBranch}>
                <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground hidden md:block" />
                        <SelectValue placeholder="اختر الفرع..." />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="laban">فرع لبن</SelectItem>
                    <SelectItem value="tuwaiq">فرع طويق</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user?.photoURL || "https://i.pravatar.cc/150"} alt={user?.displayName || "User"} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="ml-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
