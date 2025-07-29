'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const initialProducts: Product[] = [
    { id: 'prod-1', name: 'Classic T-Shirt', sku: 'TS-BLK-M', price: 25.99, stock: 150 },
    { id: 'prod-2', name: 'Running Shoes', sku: 'SHOE-RUN-10', price: 89.99, stock: 75 },
    { id: 'prod-3', name: 'Denim Jeans', sku: 'JEAN-BLU-32', price: 59.50, stock: 90 },
    { id: 'prod-4', name: 'Leather Wallet', sku: 'ACC-LW-BRN', price: 45.00, stock: 200 },
    { id: 'prod-5', name: 'Stainless Steel Watch', sku: 'WTCH-STL-01', price: 199.99, stock: 40 },
    { id: 'prod-6', name: 'Canvas Backpack', sku: 'BAG-CNVS-GRY', price: 75.00, stock: 0 },
];

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'stock'> & { stock: number }) => void;
  updateStock: (productId: string, quantityChange: number, type: 'increase' | 'decrease') => void;
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

  const addProduct = (productData: Omit<Product, 'id' | 'stock'> & { stock: number }) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added to your inventory.`,
    });
  };

  const updateStock = (productId: string, quantityChange: number, type: 'increase' | 'decrease') => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newStock = type === 'increase' ? p.stock + quantityChange : p.stock - quantityChange;
          return { ...p, stock: Math.max(0, newStock) };
        }
        return p;
      })
    );
    const product = products.find(p => p.id === productId);
    if(product) {
        toast({
            title: "Stock Updated",
            description: `Stock for ${product.name} has been updated.`,
        });
    }
  };
    
  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };
  
  const value = useMemo(() => ({ products, addProduct, updateStock, getProductById, isLoading }), [products, addProduct, updateStock, getProductById, isLoading]);

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
