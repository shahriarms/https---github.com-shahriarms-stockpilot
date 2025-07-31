
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Invoice, Buyer } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface InvoiceContextType {
  invoices: Invoice[];
  buyers: Buyer[];
  saveInvoice: (invoice: Omit<Invoice, 'items' | 'id' | 'payments'> & { items: any[], id: string }) => void;
  updateInvoiceDue: (invoiceId: string, amountPaid: number) => void;
  getInvoicesForBuyer: (buyerId: string) => Invoice[];
  isLoading: boolean;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem('stockpilot-invoices');
      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      }
      const savedBuyers = localStorage.getItem('stockpilot-buyers');
      if (savedBuyers) {
        setBuyers(JSON.parse(savedBuyers));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('stockpilot-invoices', JSON.stringify(invoices));
      localStorage.setItem('stockpilot-buyers', JSON.stringify(buyers));
    }
  }, [invoices, buyers, isLoading]);

  const saveInvoice = useCallback((invoiceData: Omit<Invoice, 'payments'>) => {
    const fullInvoice: Invoice = {...invoiceData, payments: [] };
    
    setInvoices(prev => [...prev, fullInvoice]);
    
    setBuyers(prevBuyers => {
      const existingBuyerIndex = prevBuyers.findIndex(b => b.name === invoiceData.customerName && b.phone === invoiceData.customerPhone);
      
      if (existingBuyerIndex > -1) {
        const updatedBuyers = [...prevBuyers];
        const existingBuyer = updatedBuyers[existingBuyerIndex];
        existingBuyer.invoiceIds.push(invoiceData.id);
        return updatedBuyers;
      } else {
        const newBuyer: Buyer = {
          id: `buyer-${Date.now()}`,
          name: invoiceData.customerName,
          address: invoiceData.customerAddress,
          phone: invoiceData.customerPhone,
          invoiceIds: [invoiceData.id],
        };
        return [...prevBuyers, newBuyer];
      }
    });

    toast({
      title: "Invoice Saved",
      description: `Invoice for ${invoiceData.customerName} has been saved successfully.`,
    });
  }, [toast]);
  
  const updateInvoiceDue = useCallback((invoiceId: string, amountPaid: number) => {
    setInvoices(prevInvoices => 
        prevInvoices.map(inv => {
            if (inv.id === invoiceId) {
                const newPaidAmount = inv.paidAmount + amountPaid;
                const newDueAmount = inv.subtotal - newPaidAmount;
                return {
                    ...inv,
                    paidAmount: newPaidAmount,
                    dueAmount: newDueAmount < 0 ? 0 : newDueAmount,
                };
            }
            return inv;
        })
    );
  }, []);

  const getInvoicesForBuyer = useCallback((buyerId: string) => {
    const buyer = buyers.find(b => b.id === buyerId);
    if (!buyer) return [];
    
    // Create a map for quick invoice lookup
    const invoiceMap = new Map(invoices.map(inv => [inv.id, inv]));
    
    return buyer.invoiceIds
        .map(id => invoiceMap.get(id))
        .filter((inv): inv is Invoice => !!inv) // Type guard to filter out undefined
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [buyers, invoices]);

  const value = useMemo(() => ({ invoices, buyers, saveInvoice, getInvoicesForBuyer, updateInvoiceDue, isLoading }), [invoices, buyers, saveInvoice, getInvoicesForBuyer, updateInvoiceDue, isLoading]);

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
}
