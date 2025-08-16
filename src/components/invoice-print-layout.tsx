
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InvoiceItem, PrintFormat, Locale } from '@/lib/types';
import { cn, numberToWords, numberToWordsBn } from '@/lib/utils';
import { translations } from '@/lib/i18n/all';
import type { DraftInvoiceItem } from '@/hooks/use-invoice-form';

interface InvoicePrintLayoutProps {
    invoiceId: string;
    currentDate: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    invoiceItems: DraftInvoiceItem[];
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
            <Card className={cn("w-full shadow-none border-0 bg-white", isPos ? "mx-auto" : "p-4 border-2 border-dashed border-gray-300 print:border-2")}>
                <CardContent className={cn("bg-white text-black", isPos ? "p-1 font-sans text-xs" : "p-6 font-serif")}>
                    <header className="text-center mb-6 border-b-2 border-gray-200 pb-4">
                        <h1 className={cn("font-bold", isBn ? 'font-bangla' : '', isPos ? "text-lg" : "text-3xl uppercase")}>{t('memo_title')}</h1>
                        <h2 className={cn("font-bold text-primary", isPos ? "text-base" : "text-2xl")}>{t('shop_name')}</h2>
                        <p className={cn("text-gray-600", isPos ? "text-[10px]" : "text-sm", isBn ? 'font-bangla' : '')}>{t('shop_description')}</p>
                        <p className={cn("text-gray-600", isPos ? "text-[10px]" : "text-sm")}>Email: engmahmud.mm@gmail.com</p>
                    </header>
                    
                    <div className={cn("flex justify-between mb-4", isPos ? "text-xs flex-col" : "text-sm")}>
                        <div className='space-y-1'>
                             <p><span className="font-semibold">{t('customer_name_label')}:</span> {customerName || '..................'}</p>
                             <p><span className="font-semibold">{t('customer_address_label')}:</span> {customerAddress || '..................'}</p>
                             <p><span className="font-semibold">{t('customer_phone_label')}:</span> {customerPhone || '..................'}</p>
                        </div>
                        <div className={cn('text-right space-y-1', isPos ? 'mt-2' : '')}>
                            <p><span className="font-semibold">{t('invoice_no_label')}:</span> {invoiceId ? invoiceId.slice(-6) : '...'}</p>
                            <p><span className="font-semibold">{t('date_label')}:</span> {currentDate || '...'}</p>
                        </div>
                    </div>

                    <Table className={cn(isPos ? "text-xs" : "text-sm")}>
                        <TableHeader>
                            <TableRow className='bg-gray-100'>
                                <TableHead className="text-black h-auto p-2">{t('item_header')}</TableHead>
                                <TableHead className="text-black text-center h-auto p-2">{t('quantity_header')}</TableHead>
                                <TableHead className="text-black text-right h-auto p-2">{t('rate_header')}</TableHead>
                                <TableHead className="text-black text-right h-auto p-2">{t('amount_header')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoiceItems && invoiceItems.length > 0 ? invoiceItems.map(item => (
                                <TableRow key={item.id} className='border-b'>
                                    <TableCell className="p-2">{item.name}</TableCell>
                                    <TableCell className="text-center p-2">{item.quantity}</TableCell>
                                    <TableCell className="text-right p-2">${item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right p-2 font-medium">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">{t('no_items_added')}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
                    <div className={cn("mt-4 flex flex-col items-end", isBn ? "font-bangla" : "")}>
                         <table className={cn("w-auto", isPos ? "w-full text-xs" : "w-72 text-sm")}>
                            <tbody>
                                <tr className='border-t'>
                                    <td className="text-right py-1 pr-4 font-semibold">{t('subtotal_label')}:</td>
                                    <td className="text-right py-1 font-semibold">${subtotal.toFixed(2)}</td>
                                </tr>
                                 <tr>
                                    <td className="text-right py-1 pr-4">{t('paid_label')}:</td>
                                    <td className="text-right py-1">${paidAmount.toFixed(2)}</td>
                                </tr>
                                 <tr className="border-t-2 border-gray-400 font-bold">
                                    <td className="text-right pt-2 pr-4">{t('due_label')}:</td>
                                    <td className="text-right pt-2">${dueAmount < 0 ? '($' + Math.abs(dueAmount).toFixed(2) + ')' : '$' + dueAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                         </table>
                    </div>
                    
                    {!isPos && (
                        <div className="mt-6 border-t pt-2 text-sm">
                            <p><span className="font-semibold">{t('in_words_label')}:</span> {amountInWords}</p>
                        </div>
                    )}
                    
                    <footer className={cn("text-center text-gray-500 mt-8 pt-4 border-t", isPos ? 'text-[10px]' : 'text-xs')}>
                        <p>Thank you for your business!</p>
                        <p>This is a computer generated invoice.</p>
                    </footer>

                </CardContent>
            </Card>
        </div>
    );
  }
);

InvoicePrintLayout.displayName = 'InvoicePrintLayout';
