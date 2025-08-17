
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { getAllProducts, addProduct as addProductAction, updateProduct as updateProductAction, deleteProduct as deleteProductAction, addMultipleProducts as addMultipleProductsAction } from '@/lib/actions/product-actions';


interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addMultipleProducts: (products: Omit<Product, 'id'>[]) => Promise<void>;
  updateProduct: (productId: string, updatedData: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
        const allProducts = await getAllProducts();
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
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);


  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
        const newProduct = await addProductAction(productData);
        if (newProduct) {
            setProducts(prev => [...prev, newProduct]);
            toast({
                title: "Product Added",
                description: `${newProduct.name} has been added to your inventory.`,
            });
        } else {
            throw new Error("Server did not return the new product.");
        }
    } catch(error) {
        console.error("Failed to add product", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add product." });
    }
  }, [toast]);
  
  const addMultipleProducts = useCallback(async (productsData: Omit<Product, 'id'>[]) => {
    try {
        const newProducts = await addMultipleProductsAction(productsData);
        if (newProducts) {
             setProducts(prev => [...prev, ...newProducts]);
            toast({
                title: "Upload Successful",
                description: `${newProducts.length} products have been added.`,
            });
        } else {
             throw new Error("Server did not return the new products.");
        }
    } catch(error) {
        console.error("Failed to add multiple products", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add products from file." });
    }
  }, [toast]);

  const updateProduct = useCallback(async (productId: string, updatedData: Omit<Product, 'id'>) => {
    try {
        const updatedProduct = await updateProductAction(productId, updatedData);
        if (updatedProduct) {
             setProducts(prev =>
                prev.map(p => (p.id === productId ? updatedProduct : p))
            );
            toast({
                title: "Product Updated",
                description: `Details for ${updatedProduct.name} have been updated.`,
            });
        } else {
            throw new Error("Server did not return the updated product.");
        }
    } catch(error) {
        console.error("Failed to update product", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update product." });
    }
  }, [toast]);
    
  const deleteProduct = useCallback(async (productId: string) => {
    try {
        const deletedProductName = await deleteProductAction(productId);
        if(deletedProductName) {
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast({
                title: "Product Deleted",
                description: `${deletedProductName} has been removed.`,
            });
        } else {
             throw new Error("Server did not return the name of the deleted product.");
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
