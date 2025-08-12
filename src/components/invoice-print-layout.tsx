
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InvoiceItem, PrintFormat } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InvoicePrintLayoutProps {
    invoiceId: string;
    currentDate: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    invoiceItems: InvoiceItem[];
    subtotal: number;
    paidAmount: number;
    dueAmount: number;
    printFormat?: PrintFormat;
}

export const InvoicePrintLayout = React.forwardRef<HTMLDivElement, InvoicePrintLayoutProps>(
  (props, ref) => {
    const {
        invoiceId,
        currentDate,
        customerName,
        customerAddress,
        customerPhone,
        invoiceItems,
        subtotal,
        paidAmount,
        dueAmount,
        printFormat = 'normal'
    } = props;

    const isPos = printFormat === 'pos';

    return (
        <div ref={ref}>
            <Card className={cn("w-full shadow-none border-0 print:shadow-none print:border-0", isPos && "max-w-xs mx-auto")}>
                <CardContent className={cn("p-8 bg-white text-black font-serif", isPos && "p-2 font-sans")}>
                    <div className="text-center mb-6">
                        <h1 className={cn("text-2xl font-bold text-primary", isPos && "text-lg")}>ক্যাশ মেমো (Cash Memo)</h1>
                        <h2 className={cn("text-xl font-bold", isPos && "text-base")}>মাহমুদ ইঞ্জিনিয়ারিং শপ</h2>
                        <p className={cn("text-xs", isPos && "text-[10px]")}>এখানে ওয়েডিং, জিন, শিট সহ সকল প্রকার ওয়র্কশপ এর মালামাল এবং ফার্নিচার সামগ্রি বিক্রয় করা হয়।</p>
                        <p className={cn("text-xs", isPos && "text-[10px]")}>Email: engmahmud.mm@gmail.com</p>
                    </div>
                    <div className={cn("flex justify-between border-b pb-2 mb-4", isPos && "text-xs")}>
                        <span>Inv No: {invoiceId ? invoiceId.slice(-6) : '...'}</span>
                        <span>Date: {currentDate || '...'}</span>
                    </div>
                    <div className={cn("mb-4", isPos && "text-xs")}>
                        <p>Name: {customerName || '..................'}</p>
                        <p>Address: {customerAddress || '..................'}</p>
                        <p>Phone: {customerPhone || '..................'}</p>
                    </div>

                    <Table className={cn(isPos && "text-xs")}>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-black h-auto p-1">Item</TableHead>
                                <TableHead className="text-black text-center h-auto p-1">Qty</TableHead>
                                <TableHead className="text-black text-center h-auto p-1">Rate</TableHead>
                                <TableHead className="text-black text-right h-auto p-1">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoiceItems.length > 0 ? invoiceItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-black p-1">{item.name}</TableCell>
                                    <TableCell className="text-black text-center p-1">{item.quantity}</TableCell>
                                    <TableCell className="text-black text-center p-1">${item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-black text-right p-1">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">No items added yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
                    <div className="mt-6 flex justify-end">
                        <div className={cn("w-64 space-y-2", isPos && "w-full text-xs space-y-1")}>
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Paid:</span>
                                <span>${paidAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-2">
                                <span>Due:</span>
                                <span>${dueAmount < 0 ? '($' + Math.abs(dueAmount).toFixed(2) + ')' : '$' + dueAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {!isPos && (
                        <div className="mt-4 border-t pt-2">
                            <p>টাকায় কথায় (In Words): ............................................</p>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
  }
);

InvoicePrintLayout.displayName = 'InvoicePrintLayout';
