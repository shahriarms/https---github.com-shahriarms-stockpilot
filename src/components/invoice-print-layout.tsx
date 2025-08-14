
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InvoiceItem, PrintFormat, Locale } from '@/lib/types';
import { cn, numberToWords, numberToWordsBn } from '@/lib/utils';
import { translations } from '@/lib/i18n/all';
import type { DraftInvoiceItem } from '@/hooks/use-invoice-form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

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
    isInteractive?: boolean;
    onUpdateItem?: (itemId: string, update: Partial<DraftInvoiceItem>) => void;
    onRemoveItem?: (itemId: string) => void;
    onUpdatePaidAmount?: (amount: number) => void;
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
        isInteractive = false,
        onUpdateItem,
        onRemoveItem,
        onUpdatePaidAmount,
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
                                {isInteractive && <TableHead className="h-auto p-1 w-[40px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoiceItems && invoiceItems.length > 0 ? invoiceItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="p-1">
                                        {item.name}
                                        {isInteractive && (
                                            <p className='text-xs text-muted-foreground'>Suggested: ${(item.originalPrice || item.price).toFixed(2)}</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center p-1">
                                        {isInteractive ? (
                                            <Input 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={e => onUpdateItem?.(item.id, { quantity: parseInt(e.target.value) || 0 })} 
                                                className="w-16 h-8 text-center" 
                                            />
                                        ) : item.quantity}
                                    </TableCell>
                                    <TableCell className="text-center p-1">
                                        {isInteractive ? (
                                             <div className="relative w-24 flex items-center mx-auto">
                                                 <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">$</span>
                                                 <Input 
                                                    type="number" 
                                                    value={item.price} 
                                                    onChange={e => onUpdateItem?.(item.id, { price: parseFloat(e.target.value) || 0 })} 
                                                    className="pl-5 text-right font-medium h-8" 
                                                />
                                            </div>
                                        ) : `$${item.price.toFixed(2)}`}
                                    </TableCell>
                                    <TableCell className="text-right p-1 font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                    {isInteractive && (
                                        <TableCell className="p-1">
                                             <Button variant="ghost" size="icon" onClick={() => onRemoveItem?.(item.id)} className="h-8 w-8">
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={isInteractive ? 5 : 4} className="text-center text-gray-500 py-6">{t('no_items_added')}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
                    <div className="mt-6 flex justify-end">
                        <div className={cn("space-y-2", isPos ? "w-full text-xs space-y-1" : "w-64")}>
                            <div className="flex justify-between items-center">
                                <span>{t('subtotal_label')}:</span>
                                <span className='font-bold'>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>{t('paid_label')}:</span>
                                {isInteractive ? (
                                     <div className="relative w-28 flex items-center gap-1">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">$</span>
                                        <Input
                                            type="number"
                                            value={paidAmount}
                                            onChange={(e) => onUpdatePaidAmount?.(parseFloat(e.target.value) || 0)}
                                            className="font-bold pl-5 text-right h-8"
                                            placeholder="0.00"
                                        />
                                    </div>
                                ) : (
                                    <span>${paidAmount.toFixed(2)}</span>
                                )}
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
