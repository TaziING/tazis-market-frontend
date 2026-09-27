export interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  stock: number;
  isRare: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  productId: string;
  product?: Product;
}

export interface Order {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
}
