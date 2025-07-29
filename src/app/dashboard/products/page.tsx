
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from '@/hooks/use-products.tsx';
import type { Product } from '@/lib/types';
import { AddProductDialog } from '@/components/add-product-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { Download, PlusCircle, MoreHorizontal, Loader2, PackageOpen, Pencil, ShieldAlert, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductsPage() {
  const { products, isLoading } = useProducts();
  const { user } = useUser();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [activeTab, setActiveTab] = useState<'Material' | 'Hardware'>('Material');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.mainCategory === activeTab)
      .filter(p => searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
      .filter(p => categoryFilter ? p.category === categoryFilter : true)
      .filter(p => subCategoryFilter ? p.subCategory === subCategoryFilter : true);
  }, [products, activeTab, searchTerm, categoryFilter, subCategoryFilter]);

  const categories = useMemo(() => [...new Set(products.filter(p => p.mainCategory === activeTab).map(p => p.category))], [products, activeTab]);
  const subCategories = useMemo(() => {
    const relevantProducts = products.filter(p => p.mainCategory === activeTab && (!categoryFilter || p.category === categoryFilter));
    return [...new Set(relevantProducts.map(p => p.subCategory))];
  }, [products, activeTab, categoryFilter]);


  const handleDownload = () => {
    const headers = "Main Category,Category,Sub-Category,SKU,Name,Price,Stock\n";
    const csvContent = filteredProducts
      .map((p) => `${p.mainCategory},${p.category},${p.subCategory},${p.sku},"${p.name.replace(/"/g, '""')}",${p.price},${p.stock}`)
      .join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `stock_report_${activeTab}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleEditClick = (product: Product) => {
    if (user.role === 'admin') {
      setEditProduct(product);
    } else {
      setShowAdminAlert(true);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSubCategoryFilter('');
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={isLoading || filteredProducts.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value as 'Material' | 'Hardware');
        resetFilters();
      }}>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Material">Material Items</TabsTrigger>
            <TabsTrigger value="Hardware">Hardware Items</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
            <Card className="w-full flex-1 flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col gap-4">
                {/* Filter Section */}
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search by product name..." 
                            className="pl-8" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Category" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="">All Categories</SelectItem>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Sub-Category" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="">All Sub-Categories</SelectItem>
                            {subCategories.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                {/* Table Section */}
                <div className="relative rounded-md border overflow-auto flex-1">
                {isLoading ? (
                <div className="absolute inset-0 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                ) : filteredProducts.length > 0 ? (
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Sub-Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.subCategory}</TableCell>
                        <TableCell className="text-right">
                            ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${product.stock === 0 ? 'text-destructive' : ''}`}>
                            {product.stock}
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Product
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                ) : (
                <div className="flex justify-center items-center text-center h-full">
                    <div>
                    <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Products Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your filters or add a new product.
                    </p>
                     <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                    </div>
                </div>
                )}
                </div>
            </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      <AddProductDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
      {editProduct && user.role === 'admin' && (
        <EditProductDialog
            key={editProduct.id}
            open={!!editProduct}
            onOpenChange={(open) => {
                if (!open) {
                    setEditProduct(null);
                }
            }}
            product={editProduct}
        />
      )}
       <AlertDialog open={showAdminAlert} onOpenChange={setShowAdminAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="text-destructive"/> Access Denied
            </AlertDialogTitle>
            <AlertDialogDescription>
              You do not have permission to edit products. Please log in as an administrator to perform this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAdminAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
