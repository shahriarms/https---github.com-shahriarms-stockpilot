
'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useInvoices } from '@/hooks/use-invoices';
import { usePayments } from '@/hooks/use-payments';
import type { Buyer, Invoice, Payment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, FileText, ChevronRight, DollarSign, HandCoins, History, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaymentReceipt } from '@/components/payment-receipt';

// Define the printable component separately. This is a robust way to avoid findDOMNode errors.
const PrintableReceipt = React.forwardRef<HTMLDivElement, { 
    buyer: Buyer;
    invoice: Invoice;
    paymentHistory: Payment[];
    newPaymentAmount: number;
}>(({ buyer, invoice, paymentHistory, newPaymentAmount }, ref) => {
    return (
        <div ref={ref}>
            <PaymentReceipt
                buyer={buyer}
                invoice={invoice}
                paymentHistory={paymentHistory}
                newPaymentAmount={newPaymentAmount}
            />
        </div>
    );
});
PrintableReceipt.displayName = 'PrintableReceipt';


export default function BuyersDuePage() {
  const { buyers, getInvoicesForBuyer } = useInvoices();
  const { addPayment, getPaymentsForInvoice } = usePayments();
  const { toast } = useToast();

  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  
  const receiptRef = useRef<HTMLDivElement>(null);

  const buyersWithDue = useMemo(() => {
    return buyers.filter(buyer => {
      const invoices = getInvoicesForBuyer(buyer.id);
      return invoices.some(inv => inv.dueAmount > 0);
    });
  }, [buyers, getInvoicesForBuyer]);

  const dueInvoices = useMemo(() => {
    if (!selectedBuyer) return [];
    return getInvoicesForBuyer(selectedBuyer.id).filter(inv => inv.dueAmount > 0);
  }, [selectedBuyer, getInvoicesForBuyer]);
  
  const paymentHistory = useMemo(() => {
    if (!selectedInvoice) return [];
    return getPaymentsForInvoice(selectedInvoice.id);
  }, [selectedInvoice, getPaymentsForInvoice]);

  const handleSelectBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setSelectedInvoice(null);
  };

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount('');
  };
  
  const completePaymentTransaction = useCallback(() => {
    if (!selectedInvoice || !paymentAmount || paymentAmount <= 0) return;

    addPayment({
      invoiceId: selectedInvoice.id,
      buyerId: selectedBuyer!.id,
      amount: paymentAmount as number,
    });
    
    toast({
        title: 'Payment Received',
        description: `Successfully recorded payment of $${(paymentAmount as number).toFixed(2)} for invoice ${selectedInvoice.id.slice(-6)}.`,
    });

    setPaymentAmount('');
    
    // Refresh data - a bit of a trick to force re-render with updated due amounts
    const updatedBuyer = buyers.find(b => b.id === selectedBuyer!.id);
    if(updatedBuyer) {
        // Find the specific buyer and re-set it to trigger updates
        const freshBuyerData = JSON.parse(JSON.stringify(buyers.find(b => b.id === selectedBuyer!.id)));
        setSelectedBuyer(freshBuyerData);
    }
  }, [addPayment, paymentAmount, selectedBuyer, selectedInvoice, toast, buyers]);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => {
      completePaymentTransaction();
    },
  });

  const handleAddPaymentAndPrint = () => {
    if (!selectedInvoice || !paymentAmount || paymentAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
      });
      return;
    }

    if (paymentAmount > selectedInvoice.dueAmount) {
        toast({
          variant: 'destructive',
          title: 'Overpayment Error',
          description: `Payment cannot be greater than the due amount of $${selectedInvoice.dueAmount.toFixed(2)}.`,
        });
        return;
    }
    
    handlePrint();
  };

  const receiptPaymentHistory = useMemo(() => {
    if (!selectedInvoice || !paymentAmount) return paymentHistory;
    const pendingPayment: Payment = {
        id: 'pending',
        invoiceId: selectedInvoice.id,
        buyerId: selectedBuyer!.id,
        amount: paymentAmount as number,
        date: new Date().toISOString(),
    };
    return [pendingPayment, ...paymentHistory];
  }, [paymentHistory, paymentAmount, selectedInvoice, selectedBuyer]);


  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <HandCoins className="w-6 h-6" />
        Buyers Due
      </h1>
      <div className="grid md:grid-cols-3 gap-6 flex-1">
        {/* Buyers with Due List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Buyers with Due Balance</CardTitle>
            <CardDescription>Select a buyer to see their due invoices.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {buyersWithDue.length > 0 ? buyersWithDue.map((buyer) => (
                  <button
                    key={buyer.id}
                    onClick={() => handleSelectBuyer(buyer)}
                    className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                      selectedBuyer?.id === buyer.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{buyer.name}</p>
                        <p className="text-sm text-muted-foreground">{buyer.phone}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                )) : (
                    <div className="p-4 text-center text-muted-foreground">No buyers with due balances.</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Due Invoices List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="truncate">{selectedBuyer ? `${selectedBuyer.name}'s Due Invoices` : 'Select a Buyer'}</CardTitle>
             <CardDescription>Invoices with an outstanding balance.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {selectedBuyer ? (
                  dueInvoices.length > 0 ? (
                    dueInvoices.map((invoice) => (
                      <button
                        key={invoice.id}
                        onClick={() => handleSelectInvoice(invoice)}
                        className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                          selectedInvoice?.id === invoice.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex justify-between font-medium">
                            <span>Inv: {invoice.id.slice(-6)}</span>
                            <span className="text-destructive">${invoice.dueAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">This buyer has no due invoices.</div>
                  )
                ) : (
                  <div className="p-4 text-center text-muted-foreground">Select a buyer to see their due invoices.</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Payment Section */}
        <Card className="md:col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle>Receive Payment</CardTitle>
                <CardDescription>Record a new payment for the selected invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {selectedInvoice ? (
                    <>
                        <div className="flex justify-between items-start">
                           <div>
                              <p>Invoice: <span className="font-mono">{selectedInvoice.id.slice(-6)}</span></p>
                              <p>Due Amount: <span className="font-bold text-destructive">${selectedInvoice.dueAmount.toFixed(2)}</span></p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    placeholder="Enter amount..."
                                    className="pl-8"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                />
                            </div>
                            <Button onClick={handleAddPaymentAndPrint}><Printer className="mr-2 h-4 w-4"/> Receive & Print</Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground py-8">Select an invoice to receive payment.</div>
                )}
            </CardContent>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 px-6 pt-4">
                    <History className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Transaction History</h3>
                </div>
                <div className="p-6 pt-2 flex-1">
                    <ScrollArea className="h-full">
                         {selectedInvoice ? (
                            paymentHistory.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentHistory.map(payment => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            ) : (
                                <div className="text-center text-muted-foreground pt-4">No payment history for this invoice.</div>
                            )
                         ) : (
                             <div className="text-center text-muted-foreground pt-4">Select an invoice to see its history.</div>
                         )}
                    </ScrollArea>
                </div>
            </div>
        </Card>
      </div>
       <div className="hidden">
        {selectedBuyer && selectedInvoice && (
          <PrintableReceipt 
            ref={receiptRef}
            buyer={selectedBuyer}
            invoice={selectedInvoice}
            paymentHistory={receiptPaymentHistory}
            newPaymentAmount={typeof paymentAmount === 'number' ? paymentAmount : 0}
          />
        )}
      </div>
    </div>
  );
}
