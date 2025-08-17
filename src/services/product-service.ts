import type { Product } from '@/lib/types';

// This file acts as a dynamic router for the product service.
// It checks the environment and conditionally imports the correct implementation.
// This prevents the 'pg' module from being bundled into the client-side code.

interface IProductService {
    getAllProducts(): Promise<Product[]>;
    getProductById(productId: string): Promise<Product | undefined>;
    addProduct(productData: Omit<Product, 'id'>): Promise<Product>;
    addMultipleProducts(productsData: Omit<Product, 'id'>[]): Promise<Product[]>;
    updateProduct(productId: string, updatedData: Omit<Product, 'id'>): Promise<Product | null>;
    deleteProduct(productId: string): Promise<string | null>;
}

let ProductService: IProductService;

if (typeof window !== 'undefined') {
    // We are on the client, so use the localStorage version.
    ProductService = require('./product-service.local').default;
} else {
    // We are on the server.
    if (process.env.POSTGRES_URL) {
        // If a database URL is provided, use the PostgreSQL version.
        ProductService = require('./product-service.postgres').default;
    } else {
        // If no database URL, use the localStorage version (for build-time, etc.).
        // This requires a mock localStorage implementation for server environments without a browser.
        // For simplicity in this context, we will assume this case doesn't involve data mutation during build.
        // A more robust solution might involve an in-memory store for the server here.
        ProductService = require('./product-service.local').default;
    }
}

export default ProductService;
