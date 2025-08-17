
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { getAllProducts, addProduct as addProductAction, updateProduct as updateProductAction, deleteProduct as deleteProductAction, addMultipleProducts as addMultipleProductsAction } from '@/lib/actions/product-actions';

const PRODUCTS_STORAGE_KEY = 'stockpilot-products';

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
  const [isUsingDB, setIsUsingDB] = useState(false);
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
        const allProducts = await getAllProducts();
        // If we get data from server action, we assume the DB is connected.
        if (allProducts && allProducts.length > 0) {
            setProducts(allProducts);
            setIsUsingDB(true);
        } else {
             // Fallback to localStorage if DB returns nothing (or server action isn't connected)
            const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
            if (savedProducts) {
                setProducts(JSON.parse(savedProducts));
            } else {
                setProducts(initialProducts);
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
            }
            setIsUsingDB(false);
        }
    } catch (error) {
        console.error("Failed to load products from server, falling back to localStorage", error);
        const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        else {
            setProducts(initialProducts);
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
        }
        setIsUsingDB(false);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
      // Persist to localStorage only if we are not using the database
      if (!isUsingDB && !isLoading) {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      }
  }, [products, isLoading, isUsingDB]);


  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
        const newProduct = await addProductAction(productData);
        setProducts(prev => [newProduct, ...prev]);
        toast({
            title: "Product Added",
            description: `${newProduct.name} has been added to your inventory.`,
        });
    } catch(error) {
        console.error("Failed to add product", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add product. Check DB connection." });
    }
  }, [toast]);
  
  const addMultipleProducts = useCallback(async (productsData: Omit<Product, 'id'>[]) => {
    try {
        const newProducts = await addMultipleProductsAction(productsData);
        setProducts(prev => [...prev, ...newProducts]);
        toast({
            title: "Upload Successful",
            description: `${newProducts.length} products have been added.`,
        });
    } catch(error) {
        console.error("Failed to add multiple products", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add products from file. Check DB connection." });
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
        }
    } catch(error) {
        console.error("Failed to update product", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update product. Check DB connection." });
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
        }
    } catch(error) {
        console.error("Failed to delete product", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete product. Check DB connection." });
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
