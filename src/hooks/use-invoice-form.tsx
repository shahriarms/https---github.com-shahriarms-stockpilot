
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { InvoiceItem } from '@/lib/types';

interface InvoiceFormState {
    items: InvoiceItem[];
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    paidAmount: number;
}

interface InvoiceFormContextType extends InvoiceFormState {
    setItems: React.Dispatch<React.SetStateAction<InvoiceItem[]>>;
    setCustomerName: React.Dispatch<React.SetStateAction<string>>;
    setCustomerAddress: React.Dispatch<React.SetStateAction<string>>;
    setCustomerPhone: React.Dispatch<React.SetStateAction<string>>;
    setPaidAmount: React.Dispatch<React.SetStateAction<number>>;
    clearInvoiceForm: () => void;
}

const InvoiceFormContext = createContext<InvoiceFormContextType | undefined>(undefined);

const initialState: InvoiceFormState = {
    items: [],
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    paidAmount: 0,
};

export function InvoiceFormProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InvoiceItem[]>(initialState.items);
  const [customerName, setCustomerName] = useState(initialState.customerName);
  const [customerAddress, setCustomerAddress] = useState(initialState.customerAddress);
  const [customerPhone, setCustomerPhone] = useState(initialState.customerPhone);
  const [paidAmount, setPaidAmount] = useState(initialState.paidAmount);

  const clearInvoiceForm = useCallback(() => {
    setItems(initialState.items);
    setCustomerName(initialState.customerName);
    setCustomerAddress(initialState.customerAddress);
    setCustomerPhone(initialState.customerPhone);
    setPaidAmount(initialState.paidAmount);
  }, []);

  const value = useMemo(() => ({
    items,
    customerName,
    customerAddress,
    customerPhone,
    paidAmount,
    setItems,
    setCustomerName,
    setCustomerAddress,
    setCustomerPhone,
    setPaidAmount,
    clearInvoiceForm,
  }), [
    items, 
    customerName, 
    customerAddress, 
    customerPhone, 
    paidAmount, 
    clearInvoiceForm
  ]);

  return (
    <InvoiceFormContext.Provider value={value}>
      {children}
    </InvoiceFormContext.Provider>
  );
}

export function useInvoiceForm() {
  const context = useContext(InvoiceFormContext);
  if (context === undefined) {
    throw new Error('useInvoiceForm must be used within an InvoiceFormProvider');
  }
  return context;
}
