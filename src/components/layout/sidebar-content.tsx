
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as UiSidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Award,
  FileText,
  ShoppingBasket,
  Users,
  BarChart3,
  Settings,
  LogOut,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/revenue", label: "الإيرادات", icon: TrendingUp },
  { href: "/expenses", label: "المصاريف", icon: TrendingDown },
  { href: "/bonuses", label: "البونص", icon: Award },
  { href: "/requests/employees", label: "طلبات الموظفين", icon: FileText },
  { href: "/requests/products", label: "طلبات المنتجات", icon: ShoppingBasket },
  { href: "/users", label: "إدارة المستخدمين", icon: Users },
  { href: "/salaries", label: "الرواتب", icon: WalletCards },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function AppSidebarContent() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };


  return (
    <Sidebar side="right" variant="sidebar" collapsible="icon">
      <div className="flex h-full flex-col">
        <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <Logo className="group-data-[collapsible=icon]:hidden" />
            </Link>
        </SidebarHeader>
        <UiSidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                      <item.icon className="ml-2" />
                      <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </UiSidebarContent>
        <SidebarFooter className="p-4">
            <SidebarSeparator />
             <div className="mt-2 text-center text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                <p>&copy; 2024 BranchFlow</p>
                <p>كل الحقوق محفوظة</p>
            </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
