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
