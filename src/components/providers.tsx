
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { StockPilotLogo } from './stock-pilot-logo';
import { SiteHeader } from './site-header';
import { ProductProvider } from '@/hooks/use-products.tsx';
import { UserProvider } from '@/hooks/use-user.tsx';
import { LayoutDashboard, Package, FileText } from 'lucide-react';

export function Providers({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            <div className="flex items-center gap-2">
              <StockPilotLogo className="w-14 h-14 transition-all duration-200" />
              <h1 className="text-xl font-semibold transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0">
                <span className="text-foreground">Stock</span>
                <span className="text-primary">Pilot</span>
              </h1>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton
                  isActive={pathname === '/dashboard'}
                  tooltip={{ children: 'Dashboard' }}
                >
                  <LayoutDashboard className="h-6 w-6" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/products">
                <SidebarMenuButton
                  isActive={pathname.startsWith('/dashboard/products')}
                  tooltip={{ children: 'Products' }}
                >
                   <Package className="h-6 w-6" />
                  <span>Products</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/invoice">
                <SidebarMenuButton
                  isActive={pathname.startsWith('/dashboard/invoice')}
                  tooltip={{ children: 'Invoice' }}
                >
                   <FileText className="h-6 w-6" />
                  <span>Invoice</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-svh">
          {header}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
