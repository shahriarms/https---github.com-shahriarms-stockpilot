'use client';
import { ProductProvider } from '@/hooks/use-products.tsx';
import { Providers } from '@/components/providers';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProductProvider>
        <Providers>{children}</Providers>
    </ProductProvider>
  );
}
