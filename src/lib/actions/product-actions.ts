
'use server';

import type { Product } from '@/lib/types';
import PostgresProductService from '@/services/product-service.postgres';
import LocalProductService from '@/services/product-service.local';

// This is a Server Action file.
// The logic within this file will only ever run on the server.

const usePostgres = !!process.env.POSTGRES_URL;

const Service = usePostgres ? PostgresProductService : LocalProductService;

export async function getAllProducts(): Promise<Product[]> {
    return Service.getAllProducts();
}

export async function getProductById(productId: string): Promise<Product | undefined> {
    return Service.getProductById(productId);
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    return Service.addProduct(productData);
}

export async function addMultipleProducts(productsData: Omit<Product, 'id'>[]): Promise<Product[]> {
    return Service.addMultipleProducts(productsData);
}

export async function updateProduct(productId: string, updatedData: Omit<Product, 'id'>): Promise<Product | null> {
    return Service.updateProduct(productId, updatedData);
}

export async function deleteProduct(productId: string): Promise<string | null> {
    return Service.deleteProduct(productId);
}
