
'use client';
import { ProductProvider } from '@/hooks/use-products.tsx';
import { UserProvider } from '@/hooks/use-user.tsx';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { InvoiceProvider } from '@/hooks/use-invoices';
import { PaymentProvider } from '@/hooks/use-payments';
import { InvoiceFormProvider } from '@/hooks/use-invoice-form';
import { ExpenseProvider } from '@/hooks/use-expenses';
import { EmployeeProvider } from '@/hooks/use-employees';

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
            <ExpenseProvider>
              <EmployeeProvider>
                <InvoiceFormProvider>
                  <Providers header={<SiteHeader />}>{children}</Providers>
                </InvoiceFormProvider>
              </EmployeeProvider>
            </ExpenseProvider>
          </PaymentProvider>
        </InvoiceProvider>
      </ProductProvider>
    </UserProvider>
  );
}
