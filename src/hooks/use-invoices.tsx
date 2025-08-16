
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Invoice, Buyer, AppSettings } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import type { DraftInvoice } from './use-invoice-form';
import { useSettings } from './use-settings';

interface InvoiceContextType {
  invoices: Invoice[];
  buyers: Buyer[];
  saveAndPrintInvoice: (draftInvoice: DraftInvoice) => Promise<void>;
  updateInvoiceDue: (invoiceId: string, amountPaid: number) => void;
  getInvoicesForBuyer: (buyerId: string) => Invoice[];
  isLoading: boolean;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

async function printPosReceipt(settings: AppSettings, orderData: any) {
    const printerConfig = {
        type: settings.posPrinterType,
        options: {
            host: settings.posPrinterHost,
            port: settings.posPrinterPort,
        }
    };

    const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printer: printerConfig,
          data: orderData,
        }),
      });

    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'An unknown error occurred during printing.');
    }
}

function printNormalReceipt() {
    // This uses the browser's native print functionality for A4/normal printing
    // The InvoicePrintLayout is already rendered on the page, so we just trigger print.
    setTimeout(() => window.print(), 100);
}

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { settings } = useSettings();

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

  const saveAndPrintInvoice = useCallback(async (draftInvoice: DraftInvoice) => {
    const newId = `INV-${Date.now()}`;
    const invoiceToSave: Invoice = {
      id: newId,
      customerName: draftInvoice.customerName,
      customerAddress: draftInvoice.customerAddress,
      customerPhone: draftInvoice.customerPhone,
      items: draftInvoice.items.map(({ originalPrice, ...item }) => item),
      subtotal: draftInvoice.subtotal,
      paidAmount: draftInvoice.paidAmount,
      dueAmount: draftInvoice.dueAmount,
      date: new Date().toISOString(),
    };
    
    // Save data to state and localStorage
    setInvoices(prev => [invoiceToSave, ...prev]);
    setBuyers(prevBuyers => {
      const existingBuyerIndex = prevBuyers.findIndex(b => b.name === invoiceToSave.customerName && b.phone === invoiceToSave.customerPhone);
      
      if (existingBuyerIndex > -1) {
        const updatedBuyers = [...prevBuyers];
        const existingBuyer = updatedBuyers[existingBuyerIndex];
        existingBuyer.invoiceIds.push(newId);
        return updatedBuyers;
      } else {
        const newBuyer: Buyer = {
          id: `buyer-${Date.now()}`,
          name: invoiceToSave.customerName,
          address: invoiceToSave.customerAddress,
          phone: invoiceToSave.customerPhone,
          invoiceIds: [newId],
        };
        return [...prevBuyers, newBuyer];
      }
    });

    // Handle printing based on settings
    if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
        const orderData = {
            orderId: newId,
            customerName: invoiceToSave.customerName,
            items: invoiceToSave.items,
            subtotal: invoiceToSave.subtotal,
            tax: 0, // Assuming 0 tax for now
            total: invoiceToSave.subtotal,
        };
        await printPosReceipt(settings, orderData);
    } else {
        printNormalReceipt();
    }
  }, [settings]);
  
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
    
    const invoiceMap = new Map(invoices.map(inv => [inv.id, inv]));
    const uniqueInvoiceIds = [...new Set(buyer.invoiceIds)];

    return uniqueInvoiceIds
        .map(id => invoiceMap.get(id))
        .filter((inv): inv is Invoice => !!inv)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [buyers, invoices]);

  const value = useMemo(() => ({ invoices, buyers, saveAndPrintInvoice, getInvoicesForBuyer, updateInvoiceDue, isLoading }), [invoices, buyers, saveAndPrintInvoice, getInvoicesForBuyer, updateInvoiceDue, isLoading]);

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
