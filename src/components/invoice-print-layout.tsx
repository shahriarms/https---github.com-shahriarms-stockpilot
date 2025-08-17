
'use client';

import React from 'react';
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
            <div className="card">
                <div className="card-content">
                    <header className="header">
                        <h1>{t('memo_title')}</h1>
                        <h2>{t('shop_name')}</h2>
                        <p className={cn(isBn ? 'font-bangla' : '')}>{t('shop_description')}</p>
                        <p>Email: engmahmud.mm@gmail.com</p>
                    </header>
                    
                    <div className="customer-details">
                        <div>
                             <p><span className="font-semibold">{t('customer_name_label')}:</span> {customerName || '..................'}</p>
                             <p><span className="font-semibold">{t('customer_address_label')}:</span> {customerAddress || '..................'}</p>
                             <p><span className="font-semibold">{t('customer_phone_label')}:</span> {customerPhone || '..................'}</p>
                        </div>
                        <div className="text-right">
                            <p><span className="font-semibold">{t('invoice_no_label')}:</span> {invoiceId ? invoiceId.slice(-6) : '...'}</p>
                            <p><span className="font-semibold">{t('date_label')}:</span> {currentDate || '...'}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>{t('item_header')}</th>
                                <th className="text-center">{t('quantity_header')}</th>
                                <th className="text-right">{t('rate_header')}</th>
                                <th className="text-right">{t('amount_header')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceItems && invoiceItems.length > 0 ? invoiceItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-right">${item.price.toFixed(2)}</td>
                                    <td className="text-right font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center" style={{padding: '1.5rem', color: '#6b7280'}}>{t('no_items_added')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    <div className="totals-section">
                         <table className="totals-table">
                            <tbody>
                                <tr>
                                    <td className="text-right font-semibold">{t('subtotal_label')}:</td>
                                    <td className="text-right font-semibold">${subtotal.toFixed(2)}</td>
                                </tr>
                                 <tr>
                                    <td className="text-right">{t('paid_label')}:</td>
                                    <td className="text-right">${paidAmount.toFixed(2)}</td>
                                </tr>
                                 <tr className="total-row">
                                    <td className="text-right">{t('due_label')}:</td>
                                    <td className="text-right">${dueAmount < 0 ? '($' + Math.abs(dueAmount).toFixed(2) + ')' : '$' + dueAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                         </table>
                    </div>
                    
                    {!isPos && (
                        <div className={cn("in-words", isBn ? "font-bangla" : "")}>
                            <p><span className="font-semibold">{t('in_words_label')}:</span> {amountInWords}</p>
                        </div>
                    )}
                    
                    <footer className="footer">
                        <p>Thank you for your business!</p>
                        <p>This is a computer generated invoice.</p>
                    </footer>

                </div>
            </div>
        </div>
    );
  }
);

InvoicePrintLayout.displayName = 'InvoicePrintLayout';
