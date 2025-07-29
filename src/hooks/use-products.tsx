
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const initialProducts: Product[] = [
    { id: 'prod-1', name: 'Angel 1" 4mm', sku: 'ANG-1-4', price: 10.5, stock: 597, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-2', name: 'Angel 1" 5mm', sku: 'ANG-1-5', price: 12.75, stock: 847, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-3', name: 'Angel 1" patla', sku: 'ANG-1-P', price: 9.5, stock: 214, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-4', name: 'Angel 1" 3mm', sku: 'ANG-1-3', price: 10, stock: 248, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-5', name: 'Angel 1" 6mm', sku: 'ANG-1-6', price: 13, stock: 293, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-6', name: 'Angel 1-1/2" 4mm', sku: 'ANG-1.5-4', price: 15, stock: 1927, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-7', name: 'Angel 1-1/2" cutting 5mm', sku: 'ANG-1.5-C-5', price: 16.5, stock: 491, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-8', name: 'Angel 1-1/2" cutting 3mm', sku: 'ANG-1.5-C-3', price: 14.5, stock: 437, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-9', name: 'Pati 1" 5mm', sku: 'PAT-1-5', price: 8, stock: 142, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-10', name: 'Pati 1" 4mm', sku: 'PAT-1-4', price: 7.5, stock: 98, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-11', name: 'Pati 3/4" 5mm', sku: 'PAT-0.75-5', price: 6.5, stock: 450, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-12', name: 'Chanel 5"', sku: 'CHA-5', price: 30, stock: 110, mainCategory: 'Material', category: 'Chanel', subCategory: 'Heavy' },
    { id: 'prod-13', name: 'Local Bar 12mm', sku: 'LBAR-12', price: 5.5, stock: 40, mainCategory: 'Material', category: 'Bar', subCategory: 'Local' },
    { id: 'prod-14', name: 'Plain rod', sku: 'PROD-PLAIN', price: 4, stock: 75, mainCategory: 'Material', category: 'Bar', subCategory: 'Plain' },
    { id: 'prod-15', name: 'Hammer 500g', sku: 'HMR-500', price: 15, stock: 50, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Hand Tools' },
    { id: 'prod-16', name: 'Screwdriver Set', sku: 'SCR-SET-10', price: 22.5, stock: 75, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Hand Tools' },
    { id: 'prod-17', name: 'Drill Machine 12V', sku: 'DRL-12V', price: 120, stock: 25, mainCategory: 'Hardware', category: 'Tools', subCategory: 'Power Tools' },
    { id: 'prod-18', name: 'Nails 2" (box)', sku: 'NAIL-2-BOX', price: 7.5, stock: 100, mainCategory: 'Hardware', category: 'Fasteners', subCategory: 'Nails' },
    { id: 'prod-19', name: 'Screws 1" (box)', sku: 'SCRW-1-BOX', price: 9, stock: 150, mainCategory: 'Hardware', category: 'Fasteners', subCategory: 'Screws' },
    { id: 'prod-20', name: 'Angel 1" patla 2mm', price: 8.5, sku: "ANG-1-P-2", stock: 150, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-21', name: 'Angel 1" patla 3mm', price: 9, sku: "ANG-1-P-3", stock: 120, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-22', name: 'Angel 1-1/4" 4mm', price: 14, sku: "ANG-1.25-4", stock: 300, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-23', name: 'Angel 1-1/4" 5mm', price: 15.5, sku: "ANG-1.25-5", stock: 250, mainCategory: 'Material', category: 'Angel', subCategory: '28' },
    { id: 'prod-24', name: 'Pati 1" 3mm', price: 7, sku: "PAT-1-3", stock: 200, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-25', name: 'Pati 1/2" 4mm', price: 5, sku: "PAT-0.5-4", stock: 500, mainCategory: 'Material', category: 'Pati', subCategory: '11' },
    { id: 'prod-26', name: 'Flatbar 2"', price: 20, sku: "FBAR-2", stock: 80, mainCategory: 'Material', category: 'Flatbar', subCategory: '28' },
];


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
  
  const addMultipleProducts = useCallback((productsData: Omit<Product, 'id'>[]) => {
    const newProducts: Product[] = productsData.map(p => ({
        ...p,
        id: `prod-${Date.now()}-${Math.random()}`
    }));
    setProducts(prev => [...prev, ...newProducts]);
  }, []);

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
    
  const deleteProduct = useCallback((productId: string) => {
    let productName = '';
    setProducts(prev => prev.filter(p => {
        if(p.id === productId) {
            productName = p.name;
            return false;
        }
        return true;
    }));

     if(productName) {
        toast({
            title: "Product Deleted",
            description: `${productName} has been removed from your inventory.`,
        });
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

    