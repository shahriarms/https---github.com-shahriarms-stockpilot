
'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products.tsx';
import { useInvoices } from '@/hooks/use-invoices';
import { PlusCircle, Trash2, Printer, Save } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { useInvoiceForm } from '@/hooks/use-invoice-form';
import { useToast } from '@/hooks/use-toast';
import { InvoicePrintLayout } from '@/components/invoice-print-layout';
import { useSettings } from '@/hooks/use-settings';
import printJS from 'print-js';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';


export default function InvoicePage() {
  const { products } = useProducts();
  const { saveInvoice } = useInvoices();
  const { settings } = useSettings();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const componentToPrintRef = useRef<HTMLDivElement>(null);
  
  const {
    items: invoiceItems,
    customerName,
    customerAddress,
    customerPhone,
    paidAmount,
    setItems: setInvoiceItems,
    setCustomerName,
    setCustomerAddress,
    setCustomerPhone,
    setPaidAmount,
    clearInvoiceForm,
  } = useInvoiceForm();

  const [currentDate, setCurrentDate] = useState('');
  const [invoiceId, setInvoiceId] = useState('');

  const [mainCategoryFilter, setMainCategoryFilter] = useState<'Material' | 'Hardware'>('Material');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');

  useEffect(() => {
    // These need to be in useEffect to avoid hydration errors
    const now = new Date();
    setCurrentDate(now.toLocaleDateString());
    setInvoiceId(`INV-${now.getTime()}`);
  }, []);

  const subtotal = useMemo(() => {
    return invoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [invoiceItems]);

  const dueAmount = useMemo(() => {
    return subtotal - paidAmount;
  }, [subtotal, paidAmount]);

  const validateInvoice = useCallback(() => {
    if (!customerName) {
      toast({ variant: 'destructive', title: t('validation_error_title'), description: t('customer_name_required_error') });
      return false;
    }
    if (invoiceItems.length === 0) {
      toast({ variant: 'destructive', title: t('validation_error_title'), description: t('invoice_items_required_error') });
      return false;
    }
    return true;
  }, [customerName, invoiceItems.length, toast, t]);
  
  const performSave = useCallback(() => {
    if (!validateInvoice()) return null;
    
    const newId = `INV-${Date.now()}`;
    saveInvoice({
      id: newId,
      customerName,
      customerAddress,
      customerPhone,
      items: invoiceItems,
      subtotal,
      paidAmount,
      dueAmount,
    });
    
    toast({
        title: t('invoice_saved_and_printed_toast_title'),
        description: t('invoice_saved_toast_description', { invoiceId: newId.slice(-6) }),
    });

    clearInvoiceForm();
    setInvoiceId(`INV-${Date.now()}`); // Generate a new ID for the next form
    router.push('/dashboard/buyers');
  }, [saveInvoice, customerName, customerAddress, customerPhone, invoiceItems, subtotal, paidAmount, dueAmount, clearInvoiceForm, router, toast, validateInvoice, t]);


  const handlePrint = () => {
    if (!validateInvoice()) return;

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
            documentTitle: `${t('invoice_title')} - ${invoiceId.slice(-6)}`,
            onPrintDialogClose: performSave,
        });
    }
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setSubCategoryFilter('');
  };

  const categories = useMemo(() => {
      return [...new Set(products.filter(p => p.mainCategory === mainCategoryFilter).map(p => p.category))];
  }, [products, mainCategoryFilter]);
  
  const subCategories = useMemo(() => {
    if (!categoryFilter) {
      return [...new Set(products.filter(p => p.mainCategory === mainCategoryFilter).map(p => p.subCategory))];
    }
    return [...new Set(products.filter(p => p.mainCategory === mainCategoryFilter && p.category === categoryFilter).map(p => p.subCategory))];
  }, [products, mainCategoryFilter, categoryFilter]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.mainCategory === mainCategoryFilter)
      .filter(p => categoryFilter ? p.category === categoryFilter : true)
      .filter(p => subCategoryFilter ? p.subCategory === subCategoryFilter : true);
  }, [products, mainCategoryFilter, categoryFilter, subCategoryFilter]);


  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const existingItem = invoiceItems.find((item) => item.id === productId);
      if (existingItem) {
        setInvoiceItems(
          invoiceItems.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        setInvoiceItems([...invoiceItems, { ...product, quantity: 1 }]);
      }
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setInvoiceItems(
      invoiceItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== productId));
  };
  
  const handleSaveAndRedirect = () => {
     if (!validateInvoice()) return;

    const newId = `INV-${Date.now()}`;
    saveInvoice({
      id: newId,
      customerName,
      customerAddress,
      customerPhone,
      items: invoiceItems,
      subtotal,
      paidAmount,
      dueAmount,
    });
    
    toast({
        title: t('invoice_saved_toast_title'),
        description: t('invoice_saved_toast_description', { invoiceId: newId.slice(-6) }),
    });

    clearInvoiceForm();
    setInvoiceId(`INV-${Date.now()}`); // Generate a new ID for the next form
    router.push('/dashboard/buyers');
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Invoice Form */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('create_invoice_title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="font-medium">{t('invoice_no_label')}: {invoiceId ? invoiceId.slice(-6) : '...'}</span>
                      <span className="text-muted-foreground">{t('date_label')}: {currentDate || '...'}</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerName">{t('customer_name_label')}</Label>
                    <Input id="customerName" placeholder={t('customer_name_placeholder')} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">{t('customer_address_label')}</Label>
                    <Input id="customerAddress" placeholder={t('customer_address_placeholder')} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">{t('customer_phone_label')}</Label>
                    <Input id="customerPhone" placeholder={t('customer_phone_placeholder')} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                  </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                  <Label>{t('add_products_label')}</Label>
                  
                  <RadioGroup
                      value={mainCategoryFilter}
                      onValueChange={(value) => {
                          setMainCategoryFilter(value as 'Material' | 'Hardware');
                          resetFilters();
                      }}
                      className="flex space-x-4"
                      >
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Material" id="r-material" />
                          <Label htmlFor="r-material">{t('material_tab')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Hardware" id="r-hardware" />
                          <Label htmlFor="r-hardware">{t('hardware_tab')}</Label>
                      </div>
                  </RadioGroup>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value === 'all' ? '' : value); setSubCategoryFilter(''); }}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('filter_by_category_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('all_categories')}</SelectItem>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={subCategoryFilter} onValueChange={(value) => setSubCategoryFilter(value === 'all' ? '' : value)} disabled={!categoryFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('filter_by_subcategory_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('all_subcategories')}</SelectItem>
                            {subCategories.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                      <Select onValueChange={handleAddProduct}>
                          <SelectTrigger>
                              <SelectValue placeholder={t('select_product_placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                              {filteredProducts.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <Button onClick={() => filteredProducts.length > 0 && handleAddProduct(filteredProducts[0].id)}><PlusCircle className="mr-2"/>{t('add_item_button')}</Button>
                  </div>

                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                      {invoiceItems.map(item => (
                          <div key={item.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                              <span className="flex-1">{item.name}</span>
                              <Input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.id, parseInt(e.target.value))} className="w-20" />
                              <span className="w-24 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                          </div>
                      ))}
                  </div>

                  <div className="mt-6 pt-4 border-t flex items-end justify-end">
                      <div className="space-y-2 text-right">
                          <div className="flex justify-end items-center gap-4">
                              <span className="font-medium">{t('subtotal_label')}:</span>
                              <span className="font-bold w-28">${subtotal.toFixed(2)}</span>
                          </div>
                           <div className="flex justify-end items-center gap-4">
                              <span className="font-medium">{t('paid_label')}:</span>
                              <div className="relative w-28 flex items-center gap-1">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">$</span>
                                  <Input
                                      type="number"
                                      value={paidAmount}
                                      onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                      className="font-bold pl-5 text-right"
                                      placeholder="0.00"
                                  />
                              </div>
                          </div>
                           <div className="flex justify-end items-center gap-4 text-primary">
                              <span className="font-medium">{t('due_label')}:</span>
                              <span className="font-bold w-28">${dueAmount < 0 ? '($' + Math.abs(dueAmount).toFixed(2) + ')' : '$' + dueAmount.toFixed(2)}</span>
                          </div>
                      </div>
                  </div>
              </div>
              
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Print Preview */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{t('live_print_preview_title')}</h2>
              <Button onClick={handlePrint} disabled={invoiceItems.length === 0}>
                  <Printer className="mr-2"/> 
                  {settings.printFormat === 'pos' ? t('save_and_pos_print_button') : t('save_and_print_button')}
              </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div ref={componentToPrintRef} className="print-container">
             <InvoicePrintLayout 
                invoiceId={invoiceId}
                currentDate={currentDate}
                customerName={customerName}
                customerAddress={customerAddress}
                customerPhone={customerPhone}
                invoiceItems={invoiceItems}
                subtotal={subtotal}
                paidAmount={paidAmount}
                dueAmount={dueAmount}
                printFormat={settings.printFormat}
                locale={settings.locale}
            />
            </div>
          </div>
        </div>
      </div>
  );
}

    
