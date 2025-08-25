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
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

const menuItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/revenue", label: "الإيرادات", icon: TrendingUp },
  { href: "/expenses", label: "المصاريف", icon: TrendingDown },
  { href: "/bonuses", label: "البونص", icon: Award },
  { href: "/requests/employees", label: "طلبات الموظفين", icon: FileText },
  { href: "/requests/products", label: "طلبات المنتجات", icon: ShoppingBasket },
  { href: "/users", label: "إدارة المستخدمين", icon: Users },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function AppSidebarContent() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" variant="sidebar" collapsible="icon">
      <div className="flex h-full flex-col">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="group-data-[collapsible=icon]:hidden" />
          </Link>
        </SidebarHeader>
        <UiSidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="font-headline"
                  >
                    <item.icon className="ms-2" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </UiSidebarContent>
        <SidebarFooter className="p-4">
            <SidebarSeparator />
            <div className="mt-2">
                 <Button variant="ghost" className="w-full justify-start gap-2">
                    <LogOut className="ms-2 size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">تسجيل الخروج</span>
                 </Button>
            </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
