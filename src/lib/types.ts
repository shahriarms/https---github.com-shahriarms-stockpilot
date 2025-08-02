
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  mainCategory: 'Material' | 'Hardware';
  category: string;
  subCategory: string;
}

export interface InvoiceItem extends Product {
  quantity: number;
}

export interface Payment {
    id: string;
    invoiceId: string;
    buyerId: string;
    amount: number;
    date: string; // ISO 8601 date string
}

export interface Invoice {
  id: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  paidAmount: number;
  dueAmount: number;
  date: string; // ISO 8601 date string
  payments: Payment[];
}

export interface Buyer {
  id: string;
  name: string;
  address: string;
  phone: string;
  invoiceIds: string[];
}

export interface Expense {
    id: string;
    category: 'Rent' | 'Utility' | 'Salary' | 'Equipment' | 'Misc' | string;
    description: string;
    amount: number;
    date: string; // ISO 8601 date string
    paymentMethod: 'Cash' | 'bKash' | 'Card' | 'Bank' | string;
}
