
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Invoice, Buyer, AppSettings } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import type { DraftInvoice } from './use-invoice-form';
import { useSettings } from './use-settings';

interface InvoiceContextType {
  invoices: Invoice[];
  buyers: Buyer[];
  saveAndPrintInvoice: (draftInvoice: DraftInvoice, printRef: React.RefObject<HTMLDivElement>) => Promise<boolean>;
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

function printNormalReceipt(printRef: React.RefObject<HTMLDivElement>): Promise<boolean> {
    return new Promise(async (resolve) => {
        const printContents = printRef.current?.innerHTML;
        if (!printContents) {
            resolve(false);
            return;
        }

        const printWindow = window.open('', '', 'height=800,width=800');

        if (printWindow) {
            try {
                printWindow.document.write('<html><head><title>Print Invoice</title>');
                // Inject styles directly
                printWindow.document.write('</head><body>');
                printWindow.document.write(printContents);
                printWindow.document.write('</body></html>');
                printWindow.document.close();

                let printed = false;
                const handleAfterPrint = () => {
                    printed = true;
                    printWindow.close();
                    resolve(true);
                };
                
                printWindow.addEventListener('afterprint', handleAfterPrint);

                // A short delay to ensure content is fully rendered before printing
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    // If the print dialog is closed without printing, `onafterprint` might not fire.
                    // We use a timeout to check if it was likely cancelled.
                    setTimeout(() => {
                       if (!printed) {
                           printWindow.close();
                           resolve(false);
                       }
                    }, 500); 
                }, 250);

            } catch (error) {
                console.error("Error preparing print window:", error);
                alert("Could not prepare print window. Please try again.");
                printWindow.close();
                resolve(false);
            }

        } else {
            alert("Your browser is blocking popups. Please allow popups for this site to print.");
            resolve(false);
        }
    });
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

  const saveInvoiceData = (draftInvoice: DraftInvoice) => {
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
  };

  const saveAndPrintInvoice = useCallback(async (draftInvoice: DraftInvoice, printRef: React.RefObject<HTMLDivElement>): Promise<boolean> => {
    if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
      const orderData = {
        orderId: `INV-${Date.now()}`,
        customerName: draftInvoice.customerName,
        items: draftInvoice.items,
        subtotal: draftInvoice.subtotal,
        tax: 0,
        total: draftInvoice.subtotal,
      };
      // For POS, we assume success and save immediately. The error will be caught and shown to the user.
      saveInvoiceData(draftInvoice);
      await printPosReceipt(settings, orderData);
      return true; 
    } else {
      // For Normal print, we wait for confirmation from the print dialog.
      const printed = await printNormalReceipt(printRef);
      if (printed) {
        saveInvoiceData(draftInvoice);
        return true;
      }
      toast({
        variant: "destructive",
        title: "Print Cancelled",
        description: "The invoice was not saved because the print process was cancelled.",
      });
      return false;
    }
  }, [settings, toast]);
  
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
