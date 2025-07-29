
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const initialProducts: Product[] = [
    { id: 'prod-1', name: 'Angel 1" 4mm', sku: 'ANG-1-4', price: 10.50, stock: 150, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-2', name: 'Angel 1.5" 5mm', sku: 'ANG-1.5-5', price: 12.75, stock: 120, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-3', name: 'Pati 1" 11', sku: 'PAT-1-11', price: 8.00, stock: 200, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-4', name: 'Chanel 2"', sku: 'CHA-2', price: 25.00, stock: 80, mainCategory: 'Material', category: 'Chanel', subCategory: 'Heavy' },
    { id: 'prod-5', name: 'Local Bar 1/2"', sku: 'LBAR-0.5', price: 5.25, stock: 300, mainCategory: 'Material', category: 'Bar', subCategory: 'Local' },
    { id: 'prod-6', name: 'Hammer 500g', sku: 'HMR-500', price: 15.00, stock: 50, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Hand Tools' },
    { id: 'prod-7', name: 'Screwdriver Set', sku: 'SCR-SET-10', price: 22.50, stock: 75, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Hand Tools' },
    { id: 'prod-8', name: 'Drill Machine 12V', sku: 'DRL-12V', price: 120.00, stock: 25, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Power Tools' },
    { id: 'prod-9', name: 'Nails 2" (box)', sku: 'NAIL-2-BOX', price: 7.50, stock: 100, mainCategory: 'Hardware', category: 'Fasteners', subCategory: 'Nails' },
    { id: 'prod-10', name: 'Screws 1" (box)', sku: 'SCRW-1-BOX', price: 9.00, stock: 150, mainCategory: 'Hardware', category: 'Fasteners', subCategory: 'Screws' },
];


interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
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

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
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
