
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useProducts } from '@/hooks/use-products.tsx';
import type { Product } from '@/lib/types';
import { AddProductDialog } from '@/components/add-product-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { Download, PlusCircle, MoreHorizontal, Loader2, PackageOpen, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


export default function ProductsPage() {
  const { products, isLoading } = useProducts();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const handleDownload = () => {
    const headers = "SKU,Name,Category,Price,Stock\n";
    const csvContent = products
      .map((p) => `${p.sku},"${p.name.replace(/"/g, '""')}",${p.category},${p.price},${p.stock}`)
      .join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "stock_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      <Card className="w-full flex-1 flex flex-col transition-transform duration-300 ease-in-out hover:scale-101 hover:shadow-xl">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="relative overflow-auto flex-1">
            {isLoading ? (
               <div className="absolute inset-0 flex justify-center items-center">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            ) : products.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
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
                          <DropdownMenuItem onClick={() => setEditProduct(product)}>
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
              <div className="absolute inset-0 flex justify-center items-center text-center">
                <div>
                  <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Products Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by adding your first product.
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
      <AddProductDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
      {editProduct && (
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
    </div>
  );
}
