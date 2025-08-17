
export interface Product {
  id: string;
  name: string;
  sku: string;
  buyingPrice: number;
  profitMargin: number;
  sellingPrice: number;
  stock: number;
  mainCategory: 'Material' | 'Hardware';
  category: string;
  subCategory: string;
}

export interface InvoiceItem {
  id: string; // This will be the product ID
  name: string;
  quantity: number;
  price: number; // This will be the sellingPrice at the time of sale
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
  payments?: Payment[];
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

export interface Employee {
    id: string;
    name: string;
    phone: string;
    address: string;
    role: 'Manager' | 'Sales' | 'Worker' | 'Accountant' | string;
    salary: number;
    joiningDate: string; // ISO 8601 date string
}

export type AttendanceStatus = 'Present' | 'Absent' | 'On Leave';

export interface Attendance {
    id: string;
    employeeId: string;
    date: string; // ISO 8601 date string
    status: AttendanceStatus;
}

export interface SalaryPayment {
    id: string;
    employeeId: string;
    amount: number;
    date: string; // ISO 8601 date string
    paidBy: string; // user email or id
}

export type PrintFormat = 'normal' | 'pos';
export type Locale = 'en' | 'bn';
export type POSPrinterType = 'disabled' | 'usb' | 'tcp';

export interface AppSettings {
    printFormat: PrintFormat;
    locale: Locale;
    posPrinterType: POSPrinterType;
    posPrinterHost: string;
    posPrinterPort: number;
    materialProfitMargin: number;
    hardwareProfitMargin: number;
}

    