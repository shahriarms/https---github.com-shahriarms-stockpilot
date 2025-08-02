
'use client';
import { ProductProvider } from '@/hooks/use-products.tsx';
import { UserProvider } from '@/hooks/use-user.tsx';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { InvoiceProvider } from '@/hooks/use-invoices';
import { PaymentProvider } from '@/hooks/use-payments';
import { InvoiceFormProvider } from '@/hooks/use-invoice-form';

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
            <InvoiceFormProvider>
              <Providers header={<SiteHeader />}>{children}</Providers>
            </InvoiceFormProvider>
          </PaymentProvider>
        </InvoiceProvider>
      </ProductProvider>
    </UserProvider>
  );
}
