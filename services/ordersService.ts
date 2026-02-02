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
