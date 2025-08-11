
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products.tsx';
import { useInvoices } from '@/hooks/use-invoices';
import { PlusCircle, Trash2, Printer, FileText, Save } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { useInvoiceForm } from '@/hooks/use-invoice-form';
import { useReactToPrint } from 'react-to-print';
import { useToast } from '@/hooks/use-toast';


export default function InvoicePage() {
  const { products } = useProducts();
  const { saveInvoice } = useInvoices();
  const router = useRouter();
  const { toast } = useToast();
  
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

  const printComponentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // These need to be in useEffect to avoid hydration errors
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-GB'));
    setInvoiceId(`INV-${now.getTime()}`);
  }, []);

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
  
  const subtotal = useMemo(() => {
    return invoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [invoiceItems]);

  const dueAmount = useMemo(() => {
    return subtotal - paidAmount;
  }, [subtotal, paidAmount]);

  const validateInvoice = () => {
    if (!customerName) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please enter the customer\'s name.' });
      return false;
    }
    if (invoiceItems.length === 0) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please add at least one item to the invoice.' });
      return false;
    }
    return true;
  };
  
  const performSave = useCallback(() => {
    saveInvoice({
      id: invoiceId,
      customerName,
      customerAddress,
      customerPhone,
      items: invoiceItems,
      subtotal,
      paidAmount,
      dueAmount,
    });
    clearInvoiceForm();
    setInvoiceId(`INV-${Date.now()}`); // Reset for next invoice
  }, [saveInvoice, invoiceId, customerName, customerAddress, customerPhone, invoiceItems, subtotal, paidAmount, dueAmount, clearInvoiceForm]);

  const handleSaveAndRedirect = () => {
    if (!validateInvoice()) return;
    performSave();
    router.push('/dashboard/buyers');
  };
  
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    onAfterPrint: () => {
        // After printing, save the invoice and redirect.
        performSave();
        router.push('/dashboard/buyers');
    }
  });
  
  const handleSaveAndPrint = () => {
    if (!validateInvoice()) return;
    // The save operation is now handled in onAfterPrint
    handlePrint();
  };


  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Invoice Form */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Invoice No: {invoiceId ? invoiceId.slice(-6) : '...'}</span>
                    <span className="text-muted-foreground">তারিখ (Date): {currentDate || '...'}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">নাম (Name)</Label>
                  <Input id="customerName" placeholder="ক্রেতার নাম লিখুন" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">ঠিকানা (Address)</Label>
                  <Input id="customerAddress" placeholder="ক্রেতার ঠিকানা লিখুন" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">ফোন (Phone)</Label>
                  <Input id="customerPhone" placeholder="Enter phone number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <Label>পণ্য যোগ করুন (Add Products)</Label>
                
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
                        <Label htmlFor="r-material">Material</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Hardware" id="r-hardware" />
                        <Label htmlFor="r-hardware">Hardware</Label>
                    </div>
                </RadioGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value === 'all' ? '' : value); setSubCategoryFilter(''); }}>
                      <SelectTrigger>
                          <SelectValue placeholder="Filter by Category" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  <Select value={subCategoryFilter} onValueChange={(value) => setSubCategoryFilter(value === 'all' ? '' : value)} disabled={!categoryFilter}>
                      <SelectTrigger>
                          <SelectValue placeholder="Filter by Sub-Category" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">All Sub-Categories</SelectItem>
                          {subCategories.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                    <Select onValueChange={handleAddProduct}>
                        <SelectTrigger>
                            <SelectValue placeholder="পণ্য নির্বাচন করুন (Select Product)" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredProducts.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => filteredProducts.length > 0 && handleAddProduct(filteredProducts[0].id)}><PlusCircle className="mr-2"/> Add Item</Button>
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
                            <span className="font-medium">উপমোট (Subtotal):</span>
                            <span className="font-bold w-28">${subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-end items-center gap-4">
                            <span className="font-medium">জমা (Paid):</span>
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
                            <span className="font-medium">বাকী (Due):</span>
                            <span className="font-bold w-28">${dueAmount < 0 ? '($' + Math.abs(dueAmount).toFixed(2) + ')' : '$' + dueAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
             <Button className="w-full mt-6" onClick={handleSaveAndRedirect}>
                <Save className="mr-2 h-4 w-4"/> চালান সেভ করুন (Save Invoice)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Print Preview */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Print Preview</h2>
            <div className="flex gap-2">
                <Button variant="outline"><FileText className="mr-2" /> POS Receipt</Button>
                <Button onClick={handleSaveAndPrint}><Printer className="mr-2"/> Save & Print</Button>
            </div>
        </div>
        <div ref={printComponentRef}>
          <Card className="w-full">
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
      </div>
    </div>
  );
}

    