
'use client';

import React from 'react';
import type { Buyer, Invoice, Payment } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PaymentReceiptProps {
  buyer: Buyer;
  invoice: Invoice;
  paymentHistory: Payment[];
}

export const PaymentReceipt = ({ buyer, invoice, paymentHistory }: PaymentReceiptProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-8 bg-white text-black font-serif">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">পেমেন্ট রশিদ (Payment Receipt)</h1>
          <h2 className="text-xl font-bold">মাহমুদ ইঞ্জিনিয়ারিং শপ</h2>
          <p className="text-xs">এখানে ওয়েডিং, জিন, শিট সহ সকল প্রকার ওয়র্কশপ এর মালামাল এবং ফার্নিচার সামগ্রি বিক্রয় করা হয়।</p>
          <p className="text-xs">Email: engmahmud.mm@gmail.com</p>
        </div>
        <div className="flex justify-between border-b pb-2 mb-4">
          <span>ক্রঃ নং (Inv No): {invoice.id.slice(-6)}</span>
          <span>তারিখ (Date): {new Date(invoice.date).toLocaleDateString()}</span>
        </div>
        <div className="mb-4">
          <p>নাম (Name): {buyer.name}</p>
          <p>ঠিকানা (Address): {buyer.address}</p>
          <p>ফোন (Phone): {buyer.phone}</p>
        </div>
        
        <h3 className="font-bold mb-2">মূল চালান (Original Invoice)</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-black">বিবরণ (Item)</TableHead>
              <TableHead className="text-black text-right">টাকা (Amount)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-black">উপমোট (Subtotal)</TableCell>
              <TableCell className="text-black text-right">${invoice.subtotal.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <h3 className="font-bold mt-6 mb-2">লেনদেন ইতিহাস (Payment History)</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-black">তারিখ (Date)</TableHead>
              <TableHead className="text-black text-right">জমা (Paid Amount)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentHistory.length > 0 ? paymentHistory.map(payment => (
              <TableRow key={payment.id}>
                <TableCell className="text-black">{new Date(payment.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-black text-right">${payment.amount.toFixed(2)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500 py-4">No payments recorded yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>মোট জমা (Total Paid):</span>
              <span>${invoice.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>বর্তমান বাকী (Current Due):</span>
              <span>${invoice.dueAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-xs">
          <p>This is a computer-generated receipt.</p>
        </div>
      </CardContent>
    </Card>
  );
};

PaymentReceipt.displayName = 'PaymentReceipt';
