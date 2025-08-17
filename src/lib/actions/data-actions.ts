
'use server';

import { Pool } from 'pg';
import type { Product, Invoice, Buyer, Expense, Employee, SalaryPayment, Payment } from '@/lib/types';

// This is a Server Action file. It will only run on the server.
const usePostgres = !!process.env.POSTGRES_URL;

interface BackupData {
    products: Product[];
    // Future tables can be added here
    // invoices: Invoice[];
    // buyers: Buyer[];
    // expenses: Expense[];
    // employees: Employee[];
    // salaryPayments: SalaryPayment[];
    // payments: Payment[];
}

let pool: Pool;
if (usePostgres) {
    pool = new Pool({ connectionString: process.env.POSTGRES_URL });
}


export async function exportAllData(): Promise<BackupData> {
    if (!usePostgres) {
        throw new Error("Database not connected. Cannot export data.");
    }
    const products = await pool.query('SELECT * FROM products');
    // In the future, query all other tables here
    
    return {
        products: products.rows,
        // invoices: invoices.rows,
        // ... and so on for other tables
    };
}


export async function importAllData(data: BackupData): Promise<{ success: boolean; message: string }> {
    if (!usePostgres) {
        throw new Error("Database not connected. Cannot import data.");
    }
    
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Clear existing data from tables in the correct order to avoid foreign key constraints
        // Example: await client.query('TRUNCATE payments, salaryPayments, invoices, buyers, expenses, employees, products RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE products RESTART IDENTITY CASCADE');
        console.log('Truncated existing tables.');

        // Import products
        if (data.products && data.products.length > 0) {
            for (const p of data.products) {
                 await client.query(
                    'INSERT INTO products (id, name, sku, "buyingPrice", "profitMargin", "sellingPrice", stock, "mainCategory", category, "subCategory") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                    [p.id, p.name, p.sku, p.buyingPrice, p.profitMargin, p.sellingPrice, p.stock, p.mainCategory, p.category, p.subCategory]
                );
            }
            console.log(`Imported ${data.products.length} products.`);
        }
        
        // Add loops for other data types here in the future
        // e.g., for (const invoice of data.invoices) { ... }

        await client.query('COMMIT');
        return { success: true, message: "Data imported successfully." };
    } catch (e: any) {
        await client.query('ROLLBACK');
        console.error('Import failed, transaction rolled back.', e);
        return { success: false, message: e.message || "An unknown error occurred during import." };
    } finally {
        client.release();
    }
}

    