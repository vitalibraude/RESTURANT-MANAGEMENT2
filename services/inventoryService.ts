import { supabase } from './supabaseClient';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  min_threshold: number;
  order_mode: 'manual' | 'semi-auto' | 'full-auto';
  suppliers?: Supplier[];
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface InventorySupplier {
  inventory_item_id: string;
  supplier_id: string;
}

// קבלת כל פריטי המלאי עם הספקים שלהם
export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data: items, error: itemsError } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');

  if (itemsError) throw itemsError;

  // קבלת הספקים לכל פריט
  const itemsWithSuppliers = await Promise.all(
    items.map(async (item) => {
      const { data: suppliers } = await supabase
        .from('inventory_suppliers')
        .select(`
          suppliers (
            id,
            name
          )
        `)
        .eq('inventory_item_id', item.id);

      return {
        ...item,
        suppliers: suppliers?.map((s: any) => s.suppliers) || []
      };
    })
  );

  return itemsWithSuppliers;
}

// הוספת פריט מלאי חדש
export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([{
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      min_threshold: item.min_threshold,
      order_mode: item.order_mode
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// עדכון פריט מלאי
export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// מחיקת פריט מלאי
export async function deleteInventoryItem(id: string) {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// קבלת כל הספקים
export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

// הוספת ספק חדש
export async function addSupplier(name: string): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// קישור פריט לספק
export async function linkItemToSupplier(itemId: string, supplierId: string) {
  const { error } = await supabase
    .from('inventory_suppliers')
    .insert([{
      inventory_item_id: itemId,
      supplier_id: supplierId
    }]);

  if (error) throw error;
}

// ניתוק פריט מספק
export async function unlinkItemFromSupplier(itemId: string, supplierId: string) {
  const { error } = await supabase
    .from('inventory_suppliers')
    .delete()
    .eq('inventory_item_id', itemId)
    .eq('supplier_id', supplierId);

  if (error) throw error;
}

// קבלת ספקים של פריט מסוים
export async function getItemSuppliers(itemId: string): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('inventory_suppliers')
    .select(`
      suppliers (
        id,
        name
      )
    `)
    .eq('inventory_item_id', itemId);

  if (error) throw error;
  return data?.map((item: any) => item.suppliers) || [];
}
