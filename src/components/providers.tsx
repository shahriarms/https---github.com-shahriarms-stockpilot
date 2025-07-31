
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

const DashboardIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M3 20v-6" />
      <path d="M9 20V8" />
      <path d="M15 20v-9" />
      <path d="M21 20V4" />
    </svg>
);

const ProductsIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
        <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2" />
        <path d="M3 14v-4" />
        <path d="m21 14-7 4-7-4" />
        <path d="M12 22v-8" />
        <path d="M7 12.5 3.5 14" />
        <path d="m17 12.5 3.5 1.5" />
    </svg>
);

const InvoiceIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);


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
          <div className="flex items-center gap-2 p-2 justify-center">
            <div className="w-14 h-14">
              <StockPilotLogo />
            </div>
            <h1 className="text-xl font-semibold transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0">
              <span className="text-foreground">Stock</span>
              <span className="text-primary">Pilot</span>
            </h1>
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
                  <DashboardIcon />
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
                   <ProductsIcon />
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
                   <InvoiceIcon />
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
