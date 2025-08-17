
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('🔴 Error: POSTGRES_URL environment variable is not set.');
  console.error('Please create a .env.local file and add your database connection string.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

async function setupDatabase() {
  const client = await pool.connect();
  console.log('✅ Connected to the database.');

  try {
    // Create the products table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          sku TEXT NOT NULL UNIQUE,
          price NUMERIC(10, 2) NOT NULL,
          stock INTEGER NOT NULL,
          "mainCategory" TEXT NOT NULL,
          category TEXT NOT NULL,
          "subCategory" TEXT NOT NULL
      );
    `;
    await client.query(createTableQuery);
    console.log("✅ Table 'products' created or already exists.");

    // You can add more table creation queries here in the future
    // For example:
    // await client.query(`CREATE TABLE IF NOT EXISTS invoices (...)`);
    // console.log("✅ Table 'invoices' created or already exists.");

  } catch (err) {
    if (err instanceof Error) {
        console.error('🔴 Error setting up the database:', err.stack);
    } else {
        console.error('🔴 An unknown error occurred:', err);
    }
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
    console.log('✅ Database setup complete. Connection closed.');
  }
}

setupDatabase();
