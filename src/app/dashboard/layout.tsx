
'use client';
import { ProductProvider } from '@/hooks/use-products.tsx';
import { UserProvider } from '@/hooks/use-user.tsx';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { CalculatorProvider } from '@/hooks/use-calculator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ProductProvider>
        <CalculatorProvider>
          <Providers header={<SiteHeader />}>{children}</Providers>
        </CalculatorProvider>
      </ProductProvider>
    </UserProvider>
  );
}
