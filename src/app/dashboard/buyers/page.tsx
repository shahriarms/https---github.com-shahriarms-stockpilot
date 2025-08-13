
'use client';

import React, { useState, useMemo, useRef } from 'react';
import printJS from 'print-js';
import { useInvoices } from '@/hooks/use-invoices';
import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, FileText, ChevronRight, Calendar, DollarSign, Search, Printer } from 'lucide-react';
import type { Buyer, Invoice } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InvoicePrintLayout } from '@/components/invoice-print-layout';


export default function BuyersPage() {
  const { buyers, getInvoicesForBuyer } = useInvoices();
  const { settings } = useSettings();
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [buyerSearchTerm, setBuyerSearchTerm] = useState('');

  const componentToPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (componentToPrintRef.current) {
        const isPos = settings.printFormat === 'pos';
        const printStyles = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla&display=swap');
            
            body { 
                font-family: 'Inter', sans-serif; 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .print-container { 
                margin: 0; 
                padding: 0;
            }
            .print-card { 
                border: none !important; 
                box-shadow: none !important; 
                background-color: white !important;
                color: black !important;
            }
            .print-card * {
                color: black !important;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border-bottom: 1px solid #ccc;
                padding: 4px 2px;
                text-align: left;
            }
            th {
                font-weight: bold;
            }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-bangla { font-family: 'Tiro Bangla', serif; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .pt-2 { padding-top: 0.5rem; }
            .border-b { border-bottom: 1px solid #ccc; }
            .text-center { text-align: center; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            
            ${isPos ? `
                @page {
                    size: 80mm auto;
                    margin: 2mm;
                }
                body {
                    font-size: 10pt;
                    line-height: 1.4;
                }
                .print-card {
                    padding: 0 !important;
                }
                h1 { font-size: 14pt; }
                h2 { font-size: 12pt; }
                p, span, div { font-size: 10pt; }
                th, td { padding: 2px 1px; font-size: 9pt; }
            ` : `
                @page {
                    size: A4;
                    margin: 20mm;
                }
                 body {
                    font-size: 12pt;
                }
            `}
        `;

        printJS({
            printable: componentToPrintRef.current.innerHTML,
            type: 'raw-html',
            style: printStyles,
            scanStyles: false,
            documentTitle: `Invoice - ${selectedInvoice?.id.slice(-6)}`,
        });
    }
  };


  const handleSelectBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    const buyerInvoices = getInvoicesForBuyer(buyer.id);
    setInvoices(buyerInvoices);
    setSelectedInvoice(buyerInvoices.length > 0 ? buyerInvoices[0] : null);
    setInvoiceSearchTerm('');
  };
  
  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  }

  const filteredInvoices = useMemo(() => {
    if (!invoiceSearchTerm) return invoices;
    return invoices.filter(invoice => 
        invoice.id.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        new Date(invoice.date).toLocaleDateString().toLowerCase().includes(invoiceSearchTerm.toLowerCase())
    );
  }, [invoices, invoiceSearchTerm]);
  
  const filteredBuyers = useMemo(() => {
    if (!buyerSearchTerm) return buyers;
    return buyers.filter(buyer => 
        buyer.name.toLowerCase().includes(buyerSearchTerm.toLowerCase()) ||
        (buyer.phone && buyer.phone.toLowerCase().includes(buyerSearchTerm.toLowerCase()))
    );
  }, [buyers, buyerSearchTerm]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Buyers &amp; Invoice History
        </h1>
      </div>
      <div className="grid md:grid-cols-4 gap-6 flex-1">
        {/* Buyers List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="space-y-4">
            <CardTitle>All Buyers</CardTitle>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Search by name or phone..." 
                    className="pl-8" 
                    value={buyerSearchTerm}
                    onChange={e => setBuyerSearchTerm(e.target.value)}
                />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {filteredBuyers.map((buyer) => (
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
                        <p className="text-sm text-muted-foreground">{buyer.address}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Invoice Log List */}
        <Card className="md:col-span-1 flex flex-col">
           <CardHeader className="space-y-4">
             <CardTitle className="truncate">{selectedBuyer ? `${selectedBuyer.name}'s Invoices` : 'Invoice Log'}</CardTitle>
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Search by invoice no or date..." 
                    className="pl-8" 
                    value={invoiceSearchTerm}
                    onChange={e => setInvoiceSearchTerm(e.target.value)}
                    disabled={!selectedBuyer}
                />
            </div>
           </CardHeader>
           <CardContent className="p-0 flex-1">
              <ScrollArea className="h-full">
                 <div className="divide-y">
                  {selectedBuyer ? (
                    filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <button
                          key={invoice.id}
                          onClick={() => handleSelectInvoice(invoice)}
                          className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                            selectedInvoice?.id === invoice.id ? 'bg-muted' : ''
                          }`}
                        >
                            <div className="font-medium">Inv: {invoice.id.slice(-6)}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Calendar className="w-3.5 h-3.5"/>
                                <span>{new Date(invoice.date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                               <DollarSign className="w-3.5 h-3.5"/>
                               <span>${invoice.subtotal.toFixed(2)}</span>
                            </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center p-4 text-sm text-muted-foreground">No invoices found.</div>
                    )
                  ) : (
                    <div className="text-center p-4 text-sm text-muted-foreground">Select a buyer.</div>
                  )}
                 </div>
              </ScrollArea>
           </CardContent>
        </Card>

        {/* Invoice Display */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Invoice Details</h2>
              {selectedInvoice && (
                  <Button onClick={handlePrint} disabled={!selectedInvoice}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print Invoice
                  </Button>
              )}
          </div>
          <ScrollArea className="flex-1 rounded-lg border">
            <div className="p-4 space-y-4 bg-background">
              {selectedInvoice ? (
                   <div ref={componentToPrintRef} className="print-container">
                     <InvoicePrintLayout
                        invoiceId={selectedInvoice.id}
                        currentDate={new Date(selectedInvoice.date).toLocaleDateString()}
                        customerName={selectedInvoice.customerName}
                        customerAddress={selectedInvoice.customerAddress}
                        customerPhone={selectedInvoice.customerPhone}
                        invoiceItems={selectedInvoice.items}
                        subtotal={selectedInvoice.subtotal}
                        paidAmount={selectedInvoice.paidAmount}
                        dueAmount={selectedInvoice.dueAmount}
                        printFormat={settings.printFormat}
                     />
                   </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground h-full flex flex-col justify-center items-center">
                    <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="font-semibold">No Invoice Selected</p>
                    <p className="text-sm">Please select a buyer and then an invoice to view its details.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
