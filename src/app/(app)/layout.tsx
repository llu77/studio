import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarContent } from "@/components/layout/sidebar-content";
// A placeholder for the header to fetch the page title. In a real app, this might come from a different source.
import { headers } from "next/headers";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // This is a simple way to get a "dynamic" title. A more robust solution might use a context or route metadata.
  const pathname = headers().get('next-url') || '/';
  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
        <AppSidebarContent />
        <SidebarInset>
            {/* We will remove the header for now from this layout to be added to each page */}
            {/* <Header pageTitle={pageTitle} /> */}
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}


function getPageTitle(pathname: string) {
    if (pathname === '/') return 'لوحة التحكم';
    if (pathname.startsWith('/revenue')) return 'الإيرادات';
    if (pathname.startsWith('/expenses')) return 'المصاريف';
    if (pathname.startsWith('/bonuses')) return 'البونص';
    if (pathname.startsWith('/requests/employees')) return 'طلبات الموظفين';
    if (pathname.startsWith('/requests/products')) return 'طلبات المنتجات';
    if (pathname.startsWith('/users')) return 'إدارة المستخدمين';
    if (pathname.startsWith('/reports')) return 'التقارير';
    if (pathname.startsWith('/settings')) return 'الإعدادات';
    return 'BranchFlow';
}
