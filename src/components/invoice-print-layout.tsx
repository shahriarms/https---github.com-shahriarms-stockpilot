
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InvoiceItem, PrintFormat, Locale } from '@/lib/types';
import { cn, numberToWords, numberToWordsBn } from '@/lib/utils';
import { translations } from '@/lib/i18n/all';

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
    locale?: Locale;
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
        printFormat = 'normal',
        locale = 'en',
    } = props;

    const t = (key: keyof (typeof translations)['en'], options?: any) => {
        let text = translations[locale][key] || translations['en'][key];
        if (options) {
            Object.keys(options).forEach(k => {
                text = text.replace(`{{${k}}}`, options[k]);
            });
        }
        return text;
    };

    const isPos = printFormat === 'pos';
    const isBn = locale === 'bn';

    const amountInWords = isBn ? numberToWordsBn(subtotal) : numberToWords(subtotal);

    return (
        <div ref={ref}>
            <Card className={cn("w-full shadow-none border-0 print-card", isPos ? "max-w-xs mx-auto" : "")}>
                <CardContent className={cn("bg-white text-black", isPos ? "p-1 font-sans" : "p-6 font-serif")}>
                    <div className="text-center mb-6">
                        <h1 className={cn("font-bold", isBn ? 'font-bangla' : '', isPos ? "text-lg" : "text-2xl")}>{t('memo_title')}</h1>
                        <h2 className={cn("font-bold", isPos ? "text-base" : "text-xl")}>{t('shop_name')}</h2>
                        <p className={cn(isPos ? "text-[10px]" : "text-xs", isBn ? 'font-bangla' : '')}>{t('shop_description')}</p>
                        <p className={cn(isPos ? "text-[10px]" : "text-xs")}>Email: engmahmud.mm@gmail.com</p>
                    </div>
                    <div className={cn("flex justify-between border-b pb-2 mb-4", isPos ? "text-xs" : "")}>
                        <span>{t('invoice_no_label')}: {invoiceId ? invoiceId.slice(-6) : '...'}</span>
                        <span>{t('date_label')}: {currentDate || '...'}</span>
                    </div>
                    <div className={cn("mb-4", isPos ? "text-xs" : "")}>
                        <p><span className="font-bold">{t('customer_name_label')}:</span> {customerName || '..................'}</p>
                        <p><span className="font-bold">{t('customer_address_label')}:</span> {customerAddress || '..................'}</p>
                        <p><span className="font-bold">{t('customer_phone_label')}:</span> {customerPhone || '..................'}</p>
                    </div>

                    <Table className={cn(isPos ? "text-xs" : "")}>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="h-auto p-1">{t('item_header')}</TableHead>
                                <TableHead className="text-center h-auto p-1">{t('quantity_header')}</TableHead>
                                <TableHead className="text-center h-auto p-1">{t('rate_header')}</TableHead>
                                <TableHead className="text-right h-auto p-1">{t('amount_header')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoiceItems.length > 0 ? invoiceItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="p-1">{item.name}</TableCell>
                                    <TableCell className="text-center p-1">{item.quantity}</TableCell>
                                    <TableCell className="text-center p-1">${item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right p-1">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">{t('no_items_added')}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
                    <div className="mt-6 flex justify-end">
                        <div className={cn("space-y-2", isPos ? "w-full text-xs space-y-1" : "w-64")}>
                            <div className="flex justify-between">
                                <span>{t('subtotal_label')}:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('paid_label')}:</span>
                                <span>${paidAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-2">
                                <span>{t('due_label')}:</span>
                                <span>${dueAmount < 0 ? '($' + Math.abs(dueAmount).toFixed(2) + ')' : '$' + dueAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {!isPos && (
                        <div className="mt-4 border-t pt-2">
                            <p><span className="font-bold">{t('in_words_label')}:</span> {amountInWords}</p>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
  }
);

InvoicePrintLayout.displayName = 'InvoicePrintLayout';
