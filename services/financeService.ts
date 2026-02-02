import { supabase } from './supabaseClient';

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
}

// קבלת כל הרשומות הפיננסיות
export async function getFinancialRecords(
  startDate?: string,
  endDate?: string
): Promise<FinancialRecord[]> {
  let query = supabase
    .from('financial_records')
    .select('*')
    .order('date', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// הוספת רשומה פיננסית
export async function addFinancialRecord(
  record: Omit<FinancialRecord, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('financial_records')
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// עדכון רשומה פיננסית
export async function updateFinancialRecord(
  id: string,
  updates: Partial<FinancialRecord>
) {
  const { data, error } = await supabase
    .from('financial_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// מחיקת רשומה פיננסית
export async function deleteFinancialRecord(id: string) {
  const { error } = await supabase
    .from('financial_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// חישוב סטטיסטיקות
export async function getFinancialStats(startDate?: string, endDate?: string) {
  const records = await getFinancialRecords(startDate, endDate);

  const income = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const expenses = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    income,
    expenses,
    profit: income - expenses,
    recordCount: records.length
  };
}
