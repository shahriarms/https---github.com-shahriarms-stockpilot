
'use client';

import { useState } from 'react';
import { useInvoices } from '@/hooks/use-invoices';
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
import { Users, FileText, ChevronRight } from 'lucide-react';
import type { Buyer, Invoice } from '@/lib/types';

export default function BuyersPage() {
  const { buyers, getInvoicesForBuyer } = useInvoices();
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handleSelectBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    const buyerInvoices = getInvoicesForBuyer(buyer.id);
    setInvoices(buyerInvoices);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Users className="w-6 h-6" />
        Buyers &amp; Invoice History
      </h1>
      <div className="grid md:grid-cols-3 gap-6 flex-1">
        {/* Buyers List */}
        <Card className="md:col-span-1 flex flex-col transition-transform duration-300 ease-in-out hover:scale-101 hover:shadow-xl">
          <CardHeader>
            <CardTitle>All Buyers</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {buyers.map((buyer) => (
                  <button
                    key={buyer.id}
                    onClick={() => handleSelectBuyer(buyer)}
                    className={`w-full text-left p-4 hover:bg-muted ${
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

        {/* Invoice Display */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {selectedBuyer ? `${selectedBuyer.name}'s Invoices` : 'Select a Buyer'}
          </h2>
          <ScrollArea className="flex-1 rounded-lg border">
            <div className="p-4 space-y-4 bg-background">
              {selectedBuyer ? (
                invoices.length > 0 ? (
                  invoices.map((invoice) => (
                     <Card key={invoice.id} className="w-full transition-transform duration-300 ease-in-out hover:scale-101 hover:shadow-xl">
                        <CardContent className="p-8 bg-white text-black font-serif">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-blue-600">ক্যাশ মেমো (Cash Memo)</h1>
                                <h2 className="text-xl font-bold">মাহমুদ ইঞ্জিনিয়ারিং শপ</h2>
                                <p className="text-xs">এখানে ওয়েডিং, জিন, শিট সহ সকল প্রকার ওয়র্কশপ এর মালামাল এবং ফার্নিচার সামগ্রি বিক্রয় করা হয়।</p>
                                <p className="text-xs">Email: engmahmud.mm@gmail.com</p>
                            </div>
                            <div className="flex justify-between border-b pb-2 mb-4">
                                <span>ক্রঃ নং (Inv No): {invoice.id.slice(-6)}</span>
                                <span>তারিখ (Date): {invoice.date}</span>
                            </div>
                            <div className="mb-4">
                                <p>নাম (Name): {invoice.customerName}</p>
                                <p>ঠিকানা (Address): {invoice.customerAddress}</p>
                                <p>ফোন (Phone): {invoice.customerPhone}</p>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-black">মালের বিবরণ (Item Description)</TableHead>
                                        <TableHead className="text-black text-center">পরিমাণ (Qty)</TableHead>
                                        <TableHead className="text-black text-center">দর (Rate)</TableHead>
                                        <TableHead className="text-black text-right">টাকা (Amount)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-black">{item.name}</TableCell>
                                            <TableCell className="text-black text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-black text-center">${item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-black text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            <div className="mt-6 flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between">
                                        <span>উপমোট (Subtotal):</span>
                                        <span>${invoice.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>জমা (Paid):</span>
                                        <span>${invoice.paidAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t pt-2">
                                        <span>বাকী (Due):</span>
                                        <span>${invoice.dueAmount < 0 ? `($${Math.abs(invoice.dueAmount).toFixed(2)})` : `$${invoice.dueAmount.toFixed(2)}`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>ফেরত (Change):</span>
                                        <span>${invoice.change.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No invoices found for this buyer.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a buyer from the list to view their invoice history.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
