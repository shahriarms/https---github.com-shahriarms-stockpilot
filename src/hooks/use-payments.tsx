
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Payment } from '@/lib/types';
import { useInvoices } from './use-invoices';

interface PaymentContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
  getPaymentsForInvoice: (invoiceId: string) => Payment[];
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const { updateInvoiceDue } = useInvoices();

  useEffect(() => {
    try {
      const savedPayments = localStorage.getItem('stockpilot-payments');
      if (savedPayments) {
        setPayments(JSON.parse(savedPayments));
      }
    } catch (error) {
      console.error("Failed to load payments from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if(payments.length > 0) {
      localStorage.setItem('stockpilot-payments', JSON.stringify(payments));
    }
  }, [payments]);

  const addPayment = useCallback((paymentData: Omit<Payment, 'id' | 'date'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setPayments(prev => [...prev, newPayment]);
    updateInvoiceDue(paymentData.invoiceId, paymentData.amount);
  }, [updateInvoiceDue]);

  const getPaymentsForInvoice = useCallback((invoiceId: string) => {
    return payments
      .filter(p => p.invoiceId === invoiceId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments]);

  const value = useMemo(() => ({ payments, addPayment, getPaymentsForInvoice }), [payments, addPayment, getPaymentsForInvoice]);

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
}
