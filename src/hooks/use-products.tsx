
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const initialProducts: Product[] = [
    { id: 'prod-1', name: 'Classic T-Shirt', sku: 'TS-BLK-M', price: 25.99, stock: 150, category: 'Apparel' },
    { id: 'prod-2', name: 'Running Shoes', sku: 'SHOE-RUN-10', price: 89.99, stock: 75, category: 'Footwear' },
    { id: 'prod-3', name: 'Denim Jeans', sku: 'JEAN-BLU-32', price: 59.50, stock: 90, category: 'Apparel' },
    { id: 'prod-4', name: 'Leather Wallet', sku: 'ACC-LW-BRN', price: 45.00, stock: 200, category: 'Accessories' },
    { id: 'prod-5', name: 'Stainless Steel Watch', sku: 'WTCH-STL-01', price: 199.99, stock: 40, category: 'Accessories' },
    { id: 'prod-6', name: 'Canvas Backpack', sku: 'BAG-CNVS-GRY', price: 75.00, stock: 0, category: 'Bags' },
];

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'stock'> & { stock: number }) => void;
  updateProduct: (productId: string, updatedData: Omit<Product, 'id'>) => void;
  getProductById: (productId: string) => Product | undefined;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('stockpilot-products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(initialProducts);
      }
    } catch (error) {
      console.error("Failed to load products from localStorage", error);
      setProducts(initialProducts);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('stockpilot-products', JSON.stringify(products));
    }
  }, [products, isLoading]);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'stock'> & { stock: number }) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added to your inventory.`,
    });
  }, [toast]);

  const updateProduct = useCallback((productId: string, updatedData: Omit<Product, 'id'>) => {
    let productName = '';
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          productName = updatedData.name;
          return { ...p, ...updatedData };
        }
        return p;
      })
    );
    if(productName) {
        toast({
            title: "Product Updated",
            description: `Details for ${productName} have been updated.`,
        });
    }
  }, [toast]);
    
  const getProductById = useCallback((productId: string) => {
    return products.find(p => p.id === productId);
  }, [products]);
  
  const value = useMemo(() => ({ products, addProduct, updateProduct, getProductById, isLoading }), [products, addProduct, updateProduct, getProductById, isLoading]);

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
