
import type { Product } from '@/lib/types';
import { Pool } from 'pg';

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

const usePostgres = !!process.env.POSTGRES_URL;

let pool: Pool;
if (usePostgres) {
    pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });
}

/**
 * This service class abstracts the data source for products.
 * If POSTGRES_URL environment variable is set, it connects to a PostgreSQL database.
 * Otherwise, it falls back to using localStorage, acting as an emulator for development.
 */
class ProductService {
    // --- LocalStorage "Emulator" Methods ---
    private static getProductsFromStorage(): Product[] {
        if (typeof window === 'undefined') return [];
        try {
            const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
            if (savedProducts) {
                return JSON.parse(savedProducts);
            } else {
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
                return initialProducts;
            }
        } catch (error) {
            console.error("Failed to parse products from localStorage", error);
            return initialProducts;
        }
    }

    private static saveProductsToStorage(products: Product[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }
    
    // --- Universal Public Methods ---

    static async getAllProducts(): Promise<Product[]> {
        if (!usePostgres) {
            const products = this.getProductsFromStorage();
            return Promise.resolve(products);
        }
        
        const { rows } = await pool.query('SELECT * FROM products ORDER BY name ASC');
        return rows.map(row => ({
            ...row,
            mainCategory: row.mainCategory,
            subCategory: row.subCategory
        }));
    }

    static async getProductById(productId: string): Promise<Product | undefined> {
        if (!usePostgres) {
            const products = this.getProductsFromStorage();
            return Promise.resolve(products.find(p => p.id === productId));
        }

        const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
        return rows[0] ? {
            ...rows[0],
            mainCategory: rows[0].mainCategory,
            subCategory: rows[0].subCategory
        } : undefined;
    }

    static async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
        const newId = `prod-${Date.now()}`;
        const newProduct: Product = { ...productData, id: newId };

        if (!usePostgres) {
            const products = this.getProductsFromStorage();
            const updatedProducts = [...products, newProduct];
            this.saveProductsToStorage(updatedProducts);
            return Promise.resolve(newProduct);
        }

        await pool.query(
            'INSERT INTO products (id, name, sku, price, stock, "mainCategory", category, "subCategory") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [newProduct.id, newProduct.name, newProduct.sku, newProduct.price, newProduct.stock, newProduct.mainCategory, newProduct.category, newProduct.subCategory]
        );
        return newProduct;
    }
    
    static async addMultipleProducts(productsData: Omit<Product, 'id'>[]): Promise<Product[]> {
        if (!usePostgres) {
            const products = this.getProductsFromStorage();
            const newProducts: Product[] = productsData.map(p => ({
                ...p,
                id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            }));
            const updatedProducts = [...products, ...newProducts];
            this.saveProductsToStorage(updatedProducts);
            return Promise.resolve(newProducts);
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const newProducts = await Promise.all(productsData.map(async p => {
                const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const newProduct: Product = { ...p, id: newId };
                await client.query(
                    'INSERT INTO products (id, name, sku, price, stock, "mainCategory", category, "subCategory") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [newProduct.id, newProduct.name, newProduct.sku, newProduct.price, newProduct.stock, newProduct.mainCategory, newProduct.category, newProduct.subCategory]
                );
                return newProduct;
            }));
            await client.query('COMMIT');
            return newProducts;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async updateProduct(productId: string, updatedData: Omit<Product, 'id'>): Promise<Product | null> {
        if (!usePostgres) {
            let products = this.getProductsFromStorage();
            let updatedProduct: Product | null = null;
            const updatedProducts = products.map(p => {
                if (p.id === productId) {
                    updatedProduct = { ...p, ...updatedData };
                    return updatedProduct;
                }
                return p;
            });

            if (updatedProduct) {
                this.saveProductsToStorage(updatedProducts);
            }
            return Promise.resolve(updatedProduct);
        }
        
        const { name, sku, price, stock, mainCategory, category, subCategory } = updatedData;
        const result = await pool.query(
            'UPDATE products SET name = $1, sku = $2, price = $3, stock = $4, "mainCategory" = $5, category = $6, "subCategory" = $7 WHERE id = $8 RETURNING *',
            [name, sku, price, stock, mainCategory, category, subCategory, productId]
        );
        return result.rows[0] ? {
             ...result.rows[0],
            mainCategory: result.rows[0].mainCategory,
            subCategory: result.rows[0].subCategory
        } : null;
    }

    static async deleteProduct(productId: string): Promise<string | null> {
        if (!usePostgres) {
            let products = this.getProductsFromStorage();
            const productToDelete = products.find(p => p.id === productId);
            if (!productToDelete) return Promise.resolve(null);
            
            const updatedProducts = products.filter(p => p.id !== productId);
            this.saveProductsToStorage(updatedProducts);
            return Promise.resolve(productToDelete.name);
        }

        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING name', [productId]);
        return result.rows[0]?.name || null;
    }
}

export default ProductService;
