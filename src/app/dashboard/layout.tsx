
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
import { SalaryProvider } from '@/hooks/use-salaries';
import { SettingsProvider } from '@/hooks/use-settings';
import { TranslationProvider } from '@/hooks/use-translation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SettingsProvider>
        <TranslationProvider>
          <ProductProvider>
            <InvoiceFormProvider>
              <InvoiceProvider>
                <PaymentProvider>
                  <ExpenseProvider>
                    <EmployeeProvider>
                      <SalaryProvider>
                          <Providers header={<SiteHeader />}>{children}</Providers>
                      </SalaryProvider>
                    </EmployeeProvider>
                  </ExpenseProvider>
                </PaymentProvider>
              </InvoiceProvider>
            </InvoiceFormProvider>
          </ProductProvider>
        </TranslationProvider>
      </SettingsProvider>
    </UserProvider>
  );
}
