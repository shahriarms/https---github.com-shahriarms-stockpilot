
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
import { LayoutDashboard, Package, FileText } from 'lucide-react';
import { SiteHeader } from './site-header';
import { useRouter } from 'next/navigation';
import { StockPilotLogo } from './stock-pilot-logo';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
      <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2 justify-center group-data-[collapsible=icon]:justify-start">
                <div className="w-14 h-14">
                  <StockPilotLogo />
                </div>
                <h1 className="text-xl font-semibold transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                   <span className="text-foreground">Stock</span><span className="text-primary">Pilot</span>
                </h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/dashboard" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname === '/dashboard'} icon={<LayoutDashboard />} tooltip={{children: 'Dashboard'}}>
                      Dashboard
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/products" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/dashboard/products')} icon={<Package />} tooltip={{children: 'Products'}}>
                      Products
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/dashboard/invoice" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/dashboard/invoice')} icon={<FileText />} tooltip={{children: 'Invoice'}}>
                      Invoice
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <div className="flex flex-col h-svh">
              <SiteHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background">
                {children}
              </main>
            </div>
          </SidebarInset>
      </SidebarProvider>
  );
}
