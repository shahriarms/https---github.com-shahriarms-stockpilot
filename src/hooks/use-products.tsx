
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const initialProducts: Product[] = [
    { id: 'prod-1', name: 'Angel 1" 4mm', sku: 'ANG-1-4', price: 10.50, stock: 597, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-2', name: 'Angel 1" 5mm', sku: 'ANG-1-5', price: 12.75, stock: 847, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-3', name: 'Angel 1" patla', sku: 'ANG-1-P', price: 9.50, stock: 214, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-4', name: 'Angel 1" 3mm', sku: 'ANG-1-3', price: 10.00, stock: 248, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-5', name: 'Angel 1" 6mm', sku: 'ANG-1-6', price: 13.00, stock: 293, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-6', name: 'Angel 1-1/2" 4mm', sku: 'ANG-1.5-4', price: 15.00, stock: 1927, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-7', name: 'Angel 1-1/2" cutting 5mm', sku: 'ANG-1.5-C-5', price: 16.50, stock: 491, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-8', name: 'Angel 1-1/2" cutting 3mm', sku: 'ANG-1.5-C-3', price: 14.50, stock: 437, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-9', name: 'Pati 1" 5mm', sku: 'PAT-1-5', price: 8.00, stock: 142, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-10', name: 'Pati 1" 4mm', sku: 'PAT-1-4', price: 7.50, stock: 98, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-11', name: 'Pati 3/4" 5mm', sku: 'PAT-0.75-5', price: 6.50, stock: 450, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-12', name: 'Chanel 5"', sku: 'CHA-5', price: 30.00, stock: 110, mainCategory: 'Material', category: 'Chanel', subCategory: 'Heavy' },
    { id: 'prod-13', name: 'Local Bar 12mm', sku: 'LBAR-12', price: 5.50, stock: 40, mainCategory: 'Material', category: 'Bar', subCategory: 'Local' },
    { id: 'prod-14', name: 'Plain rod', sku: 'PROD-PLAIN', price: 4.00, stock: 75, mainCategory: 'Material', category: 'Bar', subCategory: 'Plain' },
    { id: 'prod-15', name: 'Hammer 500g', sku: 'HMR-500', price: 15.00, stock: 50, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Hand Tools' },
    { id: 'prod-16', name: 'Screwdriver Set', sku: 'SCR-SET-10', price: 22.50, stock: 75, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Hand Tools' },
    { id: 'prod-17', name: 'Drill Machine 12V', sku: 'DRL-12V', price: 120.00, stock: 25, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Power Tools' },
    { id: 'prod-18', name: 'Nails 2" (box)', sku: 'NAIL-2-BOX', price: 7.50, stock: 100, mainCategory: 'Hardware', category: 'Fasteners', subCategory: 'Nails' },
    { id: 'prod-19', name: 'Screws 1" (box)', sku: 'SCRW-1-BOX', price: 9.00, stock: 150, mainCategory: 'Hardware', category: 'Fasteners', subCategory: 'Screws' },
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
