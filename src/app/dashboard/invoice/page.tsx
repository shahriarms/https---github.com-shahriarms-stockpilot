
'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProducts } from '@/hooks/use-products.tsx';
import { useInvoices } from '@/hooks/use-invoices';
import { Plus, Trash2, Printer, X, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInvoiceForm } from '@/hooks/use-invoice-form';
import { useToast } from '@/hooks/use-toast';
import { InvoicePrintLayout } from '@/components/invoice-print-layout';
import { useSettings } from '@/hooks/use-settings';
import printJS from 'print-js';
import { useTranslation } from '@/hooks/use-translation';
import type { DraftInvoice } from '@/hooks/use-invoice-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Product } from '@/lib/types';


export default function InvoicePage() {
  const { products } = useProducts();
  const { saveInvoice } = useInvoices();
  const { settings } = useSettings();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const componentToPrintRef = useRef<HTMLDivElement>(null);

  const {
    drafts,
    activeDraftIndex,
    activeDraft,
    addNewDraft,
    removeDraft,
    setActiveDraftIndex,
    updateActiveDraft,
    isFormLoading
  } = useInvoiceForm();
  
  const [draftToDelete, setDraftToDelete] = useState<DraftInvoice | null>(null);

  const [mainCategoryFilter, setMainCategoryFilter] = useState<'Material' | 'Hardware'>('Material');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');

  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  
  // Destructure activeDraft properties only when it's available
  const { id: draftId, items, customerName, customerAddress, customerPhone, paidAmount, subtotal, dueAmount } = activeDraft || {};

  const validateInvoice = () => {
    if (!customerName) {
      toast({ variant: 'destructive', title: t('validation_error_title'), description: t('customer_name_required_error') });
      return false;
    }
    if (!items || items.length === 0) {
      toast({ variant: 'destructive', title: t('validation_error_title'), description: t('invoice_items_required_error') });
      return false;
    }
    return true;
  };

  const performSave = () => {
    if (!validateInvoice() || !activeDraft) return;

    const newId = `INV-${Date.now()}`;
    saveInvoice({
      id: newId,
      customerName: activeDraft.customerName,
      customerAddress: activeDraft.customerAddress,
      customerPhone: activeDraft.customerPhone,
      items: activeDraft.items,
      subtotal: activeDraft.subtotal,
      paidAmount: activeDraft.paidAmount,
      dueAmount: activeDraft.dueAmount,
    });
    
    toast({
        title: t('invoice_saved_toast_title'),
        description: t('invoice_saved_toast_description', { invoiceId: newId.slice(-6) }),
    });

    removeDraft(activeDraft.id);
    router.push('/dashboard/buyers');
  };

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
            @media print {
              body {
                background-color: #fff !important;
              }
              .print-container { 
                  margin: 0; 
                  padding: 0;
                  background-color: #fff !important;
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
            documentTitle: `${t('invoice_title')} - ${draftId!.slice(-6)}`,
            onPrintDialogClose: performSave,
        });
    }
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setSubCategoryFilter('');
    setProductSearch('');
    setCategorySearch('');
    setSubCategorySearch('');
  };
  
  useEffect(() => {
    resetFilters();
  }, [mainCategoryFilter]);
  
  useEffect(() => {
    setSubCategoryFilter('');
    setSubCategorySearch('');
  }, [categoryFilter]);

  const categories = useMemo(() => {
    const allCategories = [...new Set(products.filter(p => p.mainCategory === mainCategoryFilter).map(p => p.category))];
    if (!categorySearch) return allCategories;
    return allCategories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [products, mainCategoryFilter, categorySearch]);
  
  const subCategories = useMemo(() => {
    const allSubCategories = [...new Set(products.filter(p => p.mainCategory === mainCategoryFilter && p.category === categoryFilter).map(p => p.subCategory))];
     if (!subCategorySearch) return allSubCategories;
    return allSubCategories.filter(sc => sc.toLowerCase().includes(subCategorySearch.toLowerCase()));
  }, [products, mainCategoryFilter, categoryFilter, subCategorySearch]);

  const filteredProducts = useMemo(() => {
    let prods = products
      .filter(p => p.mainCategory === mainCategoryFilter)
      .filter(p => categoryFilter ? p.category === categoryFilter : true)
      .filter(p => subCategoryFilter ? p.subCategory === subCategoryFilter : true);

    if (productSearch) {
      prods = prods.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    }
    return prods;
  }, [products, mainCategoryFilter, categoryFilter, subCategoryFilter, productSearch]);


  const handleAddProduct = (product: Product) => {
    if (!activeDraft) return;
    const existingItem = activeDraft.items.find((item) => item.id === product.id);
    const newItems = existingItem
      ? activeDraft.items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...activeDraft.items, { ...product, quantity: 1 }];
    updateActiveDraft({ items: newItems });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (!activeDraft) return;
    const newItems = activeDraft.items.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
    );
    updateActiveDraft({ items: newItems });
  };

  const handleRemoveItem = (productId: string) => {
    if (!activeDraft) return;
    const newItems = activeDraft.items.filter((item) => item.id !== productId);
    updateActiveDraft({ items: newItems });
  };

  const handleDeleteDraftClick = (draft: DraftInvoice) => {
    if (drafts.length <= 1) {
        toast({
            variant: 'destructive',
            title: "Cannot Delete",
            description: "You cannot delete the last remaining memo.",
        });
        return;
    }
    setDraftToDelete(draft);
  };
  
  const confirmDeleteDraft = () => {
    if (draftToDelete) {
        removeDraft(draftToDelete.id);
        setDraftToDelete(null);
    }
  };
  
  if (isFormLoading || !activeDraft) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2 border-b pb-2 flex-wrap">
            {drafts.map((draft, index) => (
                <div key={draft.id} className="relative group">
                    <Button 
                        variant={index === activeDraftIndex ? 'secondary' : 'ghost'}
                        onClick={() => setActiveDraftIndex(index)}
                        className="pr-8"
                    >
                        Memo {index + 1}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 opacity-50 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDraftClick(draft);
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button variant="outline" size="icon" onClick={addNewDraft} disabled={drafts.length >= 10}>
                <Plus className="h-4 w-4"/>
            </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start flex-1 min-h-0">
            {/* Left Column: Customer Details & Product Selection */}
            <div className="flex flex-col gap-4 h-full">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('create_invoice_title')} #{activeDraftIndex+1}</CardTitle>
                        <CardDescription>{t('invoice_no_label')}: {draftId ? draftId.slice(-6) : '...'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customerName">{t('customer_name_label')}</Label>
                                <Input id="customerName" placeholder={t('customer_name_placeholder')} value={customerName} onChange={(e) => updateActiveDraft({ customerName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerPhone">{t('customer_phone_label')}</Label>
                                <Input id="customerPhone" placeholder={t('customer_phone_placeholder')} value={customerPhone} onChange={(e) => updateActiveDraft({ customerPhone: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerAddress">{t('customer_address_label')}</Label>
                            <Input id="customerAddress" placeholder={t('customer_address_placeholder')} value={customerAddress} onChange={(e) => updateActiveDraft({ customerAddress: e.target.value })} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>{t('add_products_label')}</CardTitle>
                        <RadioGroup
                            value={mainCategoryFilter}
                            onValueChange={(value) => setMainCategoryFilter(value as 'Material' | 'Hardware')}
                            className="flex space-x-4 pt-2"
                        >
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Material" id="r-material" /><Label htmlFor="r-material">{t('material_tab')}</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Hardware" id="r-hardware" /><Label htmlFor="r-hardware">{t('hardware_tab')}</Label></div>
                        </RadioGroup>
                    </CardHeader>
                    <CardContent className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                        {/* Category List */}
                        <div className="flex flex-col gap-2">
                           <Label>{t('category_header')}</Label>
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search..." className="pl-8 h-9" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} />
                            </div>
                           <ScrollArea className="border rounded-md flex-1">
                               <div className="p-2 space-y-1">
                                    <Button variant={!categoryFilter ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setCategoryFilter('')}>{t('all_categories')}</Button>
                                    {categories.map(c => <Button key={c} variant={categoryFilter === c ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setCategoryFilter(c)}>{c}</Button>)}
                               </div>
                           </ScrollArea>
                        </div>
                        {/* Sub-Category List */}
                        <div className="flex flex-col gap-2">
                            <Label>{t('subcategory_header')}</Label>
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search..." className="pl-8 h-9" value={subCategorySearch} onChange={e => setSubCategorySearch(e.target.value)} disabled={!categoryFilter}/>
                            </div>
                           <ScrollArea className="border rounded-md flex-1">
                                <div className="p-2 space-y-1">
                                     <Button variant={!subCategoryFilter ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSubCategoryFilter('')} disabled={!categoryFilter}>{t('all_subcategories')}</Button>
                                     {categoryFilter && subCategories.map(sc => <Button key={sc} variant={subCategoryFilter === sc ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSubCategoryFilter(sc)}>{sc}</Button>)}
                                </div>
                           </ScrollArea>
                        </div>
                        {/* Product List */}
                         <div className="flex flex-col gap-2">
                            <Label>{t('products_sidebar')}</Label>
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search..." className="pl-8 h-9" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                            </div>
                           <ScrollArea className="border rounded-md flex-1">
                                <div className="p-2 space-y-1">
                                     {filteredProducts.map(p => <Button key={p.id} variant="ghost" className="w-full justify-start" onClick={() => handleAddProduct(p)}>{p.name}</Button>)}
                                </div>
                           </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Invoice Items & Print Preview */}
            <div className="flex flex-col gap-4 h-full">
                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Invoice Items</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <ScrollArea className="flex-1 -mr-6 pr-6">
                            <div className="space-y-2">
                                {items.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10">Select products to add them here.</div>
                                ) : (
                                    items.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                            <span className="flex-1 font-medium">{item.name}</span>
                                            <Input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.id, parseInt(e.target.value))} className="w-20" />
                                            <span className="w-24 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                        
                        {items.length > 0 && (
                            <div className="mt-auto pt-4 border-t flex items-end justify-end">
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
                                                onChange={(e) => updateActiveDraft({ paidAmount: parseFloat(e.target.value) || 0 })}
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
                        )}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                        <h2 className="text-lg font-semibold">{t('live_print_preview_title')}</h2>
                        <Button onClick={handlePrint} disabled={!items || items.length === 0}>
                            <Printer className="mr-2"/> 
                            {settings.printFormat === 'pos' ? t('save_and_pos_print_button') : t('save_and_print_button')}
                        </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden flex-1 max-h-[50vh]">
                        <ScrollArea className="h-full">
                           <div ref={componentToPrintRef} className="print-container bg-white">
                                <InvoicePrintLayout 
                                    invoiceId={draftId}
                                    currentDate={new Date().toLocaleDateString()}
                                    customerName={customerName}
                                    customerAddress={customerAddress}
                                    customerPhone={customerPhone}
                                    invoiceItems={items}
                                    subtotal={subtotal}
                                    paidAmount={paidAmount}
                                    dueAmount={dueAmount}
                                    printFormat={settings.printFormat}
                                    locale={settings.locale}
                                />
                           </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
        <AlertDialog open={!!draftToDelete} onOpenChange={() => setDraftToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('are_you_sure_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                       Are you sure you want to delete this memo? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteDraft} className="bg-destructive hover:bg-destructive/90">{t('delete_button')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

    