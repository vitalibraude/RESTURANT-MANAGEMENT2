
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Order {
  id: string;
  table: number;
  items: { item: MenuItem; quantity: number }[];
  status: 'pending' | 'preparing' | 'delivered' | 'paid';
  timestamp: Date;
  total: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: Date;
}

export type View = 'dashboard' | 'orders' | 'inventory' | 'finance' | 'messaging';
