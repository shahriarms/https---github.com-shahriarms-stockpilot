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
import { ProductProvider } from '@/hooks/use-products.tsx';
import { LayoutDashboard, Package, Bot } from 'lucide-react';
import { SiteHeader } from './site-header';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProductProvider>
      <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2 justify-center group-data-[collapsible=icon]:justify-start">
                <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">StockPilot</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname === '/'} icon={<LayoutDashboard />} tooltip={{children: 'Dashboard'}}>
                      Dashboard
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/products" legacyBehavior passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/products')} icon={<Package />} tooltip={{children: 'Products'}}>
                      Products
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
    </ProductProvider>
  );
}
