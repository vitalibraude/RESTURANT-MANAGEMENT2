import { supabase } from './supabaseClient';

export interface Order {
  id: string;
  table_number?: number;
  customer_name?: string;
  items: any[];
  total_price: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// קבלת כל ההזמנות
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// הוספת הזמנה חדשה
export async function addOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// עדכון סטטוס הזמנה
export async function updateOrderStatus(id: string, status: Order['status']) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// מחיקת הזמנה
export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// האזנה לשינויים בהזמנות בזמן אמת
export function subscribeToOrders(callback: (order: Order) => void) {
  const subscription = supabase
    .channel('orders_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        callback(payload.new as Order);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// ====== הזמנות מספקים ======
// מחיקת הזמנה מספק
export async function deleteSupplierOrder(id: string) {
  const { error } = await supabase
    .from('supplier_orders')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// עדכון סטטוס הזמנה מספק
export async function updateSupplierOrderStatus(id: string, status: 'pending' | 'confirmed' | 'received' | 'cancelled') {
  const { error } = await supabase
    .from('supplier_orders')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export interface SupplierOrder {
  id: string;
  order_number: number;
  supplier_id: string;
  supplier_name?: string;
  total_cost: number;
  order_date: string;
  can_add_until: string;
  status: 'pending' | 'confirmed' | 'received' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  inventory_item_id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price?: number;
}

export interface OrderWithItems extends SupplierOrder {
  items: OrderItem[];
}

// יצירת הזמנה חדשה
export async function createSupplierOrder(
  supplierId: string,
  items: Omit<OrderItem, 'id' | 'order_id'>[],
  canAddUntil: Date
): Promise<SupplierOrder> {
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);

  const { data: order, error: orderError } = await supabase
    .from('supplier_orders')
    .insert([{
      supplier_id: supplierId,
      total_cost: totalCost,
      can_add_until: canAddUntil.toISOString().split('T')[0],
      status: 'pending'
    }])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map(item => ({
    order_id: order.id,
    ...item
  }));

  const { error: itemsError } = await supabase
    .from('supplier_order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}

// קבלת כל ההזמנות עם הספקים
export async function getSupplierOrders(): Promise<OrderWithItems[]> {
  const { data: orders, error: ordersError } = await supabase
    .from('supplier_orders')
    .select(`
      *,
      suppliers (
        id,
        name
      )
    `)
    .order('order_number', { ascending: false });

  if (ordersError) throw ordersError;

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const { data: items } = await supabase
        .from('supplier_order_items')
        .select('*')
        .eq('order_id', order.id);

      return {
        ...order,
        supplier_name: (order as any).suppliers?.name,
        items: items || []
      };
    })
  );

  return ordersWithItems;
}

