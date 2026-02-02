import { supabase } from './supabaseClient';

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_name: string;
  price: number;
  unit: string;
  min_order_quantity: number;
  available_days: string[];
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierWithProducts extends Supplier {
  products?: SupplierProduct[];
}

// קבלת כל הספקים עם המוצרים שלהם
export async function getSuppliersWithProducts(): Promise<SupplierWithProducts[]> {
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');

  if (suppliersError) throw suppliersError;

  const suppliersWithProducts = await Promise.all(
    suppliers.map(async (supplier) => {
      const { data: products } = await supabase
        .from('supplier_products')
        .select('*')
        .eq('supplier_id', supplier.id)
        .eq('is_available', true)
        .order('product_name');

      return {
        ...supplier,
        products: products || []
      };
    })
  );

  return suppliersWithProducts;
}

// עדכון פרטי ספק
export async function updateSupplier(id: string, updates: Partial<Supplier>) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// הוספת מוצר לספק
export async function addSupplierProduct(product: Omit<SupplierProduct, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('supplier_products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// עדכון מוצר של ספק
export async function updateSupplierProduct(id: string, updates: Partial<SupplierProduct>) {
  const { data, error } = await supabase
    .from('supplier_products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// מחיקת מוצר של ספק
export async function deleteSupplierProduct(id: string) {
  const { error } = await supabase
    .from('supplier_products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// קבלת מוצרים של ספק ספציפי
export async function getSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
  const { data, error } = await supabase
    .from('supplier_products')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('product_name');

  if (error) throw error;
  return data;
}
