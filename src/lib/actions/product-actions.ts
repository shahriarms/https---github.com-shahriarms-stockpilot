
'use server';

import type { Product } from '@/lib/types';
import PostgresProductService from '@/services/product-service.postgres';

// This is a Server Action file.
// The logic within this file will only ever run on the server.
// It will only use PostgreSQL if the environment variable is set.

const usePostgres = !!process.env.POSTGRES_URL;

export async function getAllProducts(): Promise<Product[]> {
    if (!usePostgres) return []; // Return empty if no DB, client will use localStorage
    return PostgresProductService.getAllProducts();
}

export async function getProductById(productId: string): Promise<Product | undefined> {
    if (!usePostgres) return undefined;
    return PostgresProductService.getProductById(productId);
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    if (!usePostgres) throw new Error("Database not connected.");
    return PostgresProductService.addProduct(productData);
}

export async function addMultipleProducts(productsData: Omit<Product, 'id'>[]): Promise<Product[]> {
    if (!usePostgres) throw new Error("Database not connected.");
    return PostgresProductService.addMultipleProducts(productsData);
}

export async function updateProduct(productId: string, updatedData: Omit<Product, 'id'>): Promise<Product | null> {
    if (!usePostgres) throw new Error("Database not connected.");
    return PostgresProductService.updateProduct(productId, updatedData);
}

export async function deleteProduct(productId: string): Promise<string | null> {
    if (!usePostgres) throw new Error("Database not connected.");
    return PostgresProductService.deleteProduct(productId);
}
