
'use client';
import { ProductProvider } from '@/hooks/use-products.tsx';
import { UserProvider } from '@/hooks/use-user.tsx';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { InvoiceProvider } from '@/hooks/use-invoices';
import { PaymentProvider } from '@/hooks/use-payments';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ProductProvider>
        <InvoiceProvider>
          <PaymentProvider>
            <Providers header={<SiteHeader />}>{children}</Providers>
          </PaymentProvider>
        </InvoiceProvider>
      </ProductProvider>
    </UserProvider>
  );
}
