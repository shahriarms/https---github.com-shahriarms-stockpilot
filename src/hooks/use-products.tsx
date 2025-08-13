
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import ProductService from '@/services/product-service';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  addMultipleProducts: (products: Omit<Product, 'id'>[]) => void;
  updateProduct: (productId: string, updatedData: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = () => {
        setIsLoading(true);
        try {
            const allProducts = ProductService.getAllProducts();
            setProducts(allProducts);
        } catch (error) {
            console.error("Failed to load products", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load product data."
            });
        } finally {
            setIsLoading(false);
        }
    };
    loadProducts();
  }, [toast]);


  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    try {
        const newProduct = ProductService.addProduct(productData);
        setProducts(prev => [...prev, newProduct]);
        toast({
            title: "Product Added",
            description: `${newProduct.name} has been added to your inventory.`,
        });
    } catch(error) {
        console.error("Failed to add product", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add product." });
    }
  }, [toast]);
  
  const addMultipleProducts = useCallback((productsData: Omit<Product, 'id'>[]) => {
    try {
        const newProducts = ProductService.addMultipleProducts(productsData);
        setProducts(prev => [...prev, ...newProducts]);
        toast({
            title: "Upload Successful",
            description: `${newProducts.length} products have been added.`,
        });
    } catch(error) {
        console.error("Failed to add multiple products", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add products from file." });
    }
  }, [toast]);

  const updateProduct = useCallback((productId: string, updatedData: Omit<Product, 'id'>) => {
    try {
        const updatedProduct = ProductService.updateProduct(productId, updatedData);
        if (updatedProduct) {
             setProducts(prev =>
                prev.map(p => (p.id === productId ? updatedProduct : p))
            );
            toast({
                title: "Product Updated",
                description: `Details for ${updatedProduct.name} have been updated.`,
            });
        }
    } catch(error) {
        console.error("Failed to update product", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update product." });
    }
  }, [toast]);
    
  const deleteProduct = useCallback((productId: string) => {
    try {
        const deletedProductName = ProductService.deleteProduct(productId);
        if(deletedProductName) {
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast({
                title: "Product Deleted",
                description: `${deletedProductName} has been removed.`,
            });
        }
    } catch(error) {
        console.error("Failed to delete product", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete product." });
    }
  }, [toast]);

  const getProductById = useCallback((productId: string) => {
    return products.find(p => p.id === productId);
  }, [products]);
  
  const value = useMemo(() => ({ products, addProduct, addMultipleProducts, updateProduct, deleteProduct, getProductById, isLoading }), [products, addProduct, addMultipleProducts, updateProduct, deleteProduct, getProductById, isLoading]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
