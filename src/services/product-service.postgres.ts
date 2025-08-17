
// This file contains the PostgreSQL implementation for the ProductService.
// It is only imported and used on the server-side when a POSTGRES_URL is available.
import { Pool } from 'pg';
import type { Product } from '@/lib/types';

let pool: Pool;
// The check for process.env.POSTGRES_URL is now in the server action,
// so we can safely initialize the pool here.
pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

function formatProduct(row: any): Product {
    return {
        ...row,
        buyingPrice: parseFloat(row.buyingPrice),
        profitMargin: parseFloat(row.profitMargin),
        sellingPrice: parseFloat(row.sellingPrice),
        stock: parseInt(row.stock, 10),
    };
}


class PostgresProductService {
    static async getAllProducts(): Promise<Product[]> {
        const { rows } = await pool.query('SELECT * FROM products ORDER BY name ASC');
        return rows.map(formatProduct);
    }

    static async getProductById(productId: string): Promise<Product | undefined> {
        const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (!rows[0]) return undefined;
        return formatProduct(rows[0]);
    }

    static async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
        const newId = `prod-${Date.now()}`;
        const newProduct: Product = { ...productData, id: newId };

        await pool.query(
            'INSERT INTO products (id, name, sku, "buyingPrice", "profitMargin", "sellingPrice", stock, "mainCategory", category, "subCategory") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [newProduct.id, newProduct.name, newProduct.sku, newProduct.buyingPrice, newProduct.profitMargin, newProduct.sellingPrice, newProduct.stock, newProduct.mainCategory, newProduct.category, newProduct.subCategory]
        );
        return newProduct;
    }
    
    static async addMultipleProducts(productsData: Omit<Product, 'id'>[]): Promise<Product[]> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const newProducts = await Promise.all(productsData.map(async p => {
                const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const newProduct: Product = { ...p, id: newId };
                await client.query(
                    'INSERT INTO products (id, name, sku, "buyingPrice", "profitMargin", "sellingPrice", stock, "mainCategory", category, "subCategory") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                    [newProduct.id, newProduct.name, newProduct.sku, newProduct.buyingPrice, newProduct.profitMargin, newProduct.sellingPrice, newProduct.stock, newProduct.mainCategory, newProduct.category, newProduct.subCategory]
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
        const { name, sku, buyingPrice, profitMargin, sellingPrice, stock, mainCategory, category, subCategory } = updatedData;
        const result = await pool.query(
            'UPDATE products SET name = $1, sku = $2, "buyingPrice" = $3, "profitMargin" = $4, "sellingPrice" = $5, stock = $6, "mainCategory" = $7, category = $8, "subCategory" = $9 WHERE id = $10 RETURNING *',
            [name, sku, buyingPrice, profitMargin, sellingPrice, stock, mainCategory, category, subCategory, productId]
        );
        if (!result.rows[0]) return null;
        return formatProduct(result.rows[0]);
    }

    static async deleteProduct(productId: string): Promise<string | null> {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING name', [productId]);
        return result.rows[0]?.name || null;
    }
}

export default PostgresProductService;

    