
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InvoiceItem } from '@/lib/types';

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
        dueAmount
    } = props;

    return (
        <div ref={ref}>
            <Card className="w-full shadow-none border-0 print:shadow-none print:border-0">
                <CardContent className="p-8 bg-white text-black font-serif">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-primary">ক্যাশ মেমো (Cash Memo)</h1>
                        <h2 className="text-xl font-bold">মাহমুদ ইঞ্জিনিয়ারিং শপ</h2>
                        <p className="text-xs">এখানে ওয়েডিং, জিন, শিট সহ সকল প্রকার ওয়র্কশপ এর মালামাল এবং ফার্নিচার সামগ্রি বিক্রয় করা হয়।</p>
                        <p className="text-xs">Email: engmahmud.mm@gmail.com</p>
                    </div>
                    <div className="flex justify-between border-b pb-2 mb-4">
                        <span>ক্রঃ নং (Inv No): {invoiceId ? invoiceId.slice(-6) : '...'}</span>
                        <span>তারিখ (Date): {currentDate || '...'}</span>
                    </div>
                    <div className="mb-4">
                        <p>নাম (Name): {customerName || '...........................................'}</p>
                        <p>ঠিকানা (Address): {customerAddress || '.....................................'}</p>
                        <p>ফোন (Phone): {customerPhone || '.........................................'}</p>
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
                            {invoiceItems.length > 0 ? invoiceItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-black">{item.name}</TableCell>
                                    <TableCell className="text-black text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-black text-center">${item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-black text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">এখনও কোনো আইটেম যোগ করা হয়নি। (No items added yet.)</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
                    <div className="mt-6 flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span>উপমোট (Subtotal):</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>জমা (Paid):</span>
                                <span>${paidAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-2">
                                <span>বাকী (Due):</span>
                                <span>${dueAmount < 0 ? '($' + Math.abs(dueAmount).toFixed(2) + ')' : '$' + dueAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 border-t pt-2">
                        <p>টাকায় কথায় (In Words): ............................................</p>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
  }
);

InvoicePrintLayout.displayName = 'InvoicePrintLayout';
