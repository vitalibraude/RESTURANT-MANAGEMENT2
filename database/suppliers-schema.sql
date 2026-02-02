-- הרחבה למערכת הספקים
-- הרץ את זה ב-Supabase SQL Editor אחרי schema.sql

-- טבלת מוצרי ספקים
CREATE TABLE supplier_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ק"ג',
  min_order_quantity DECIMAL NOT NULL DEFAULT 1,
  available_days TEXT[] DEFAULT '{}', -- ימים בשבוע: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- עדכון טבלת suppliers עם מידע נוסף
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes TEXT;

-- אינדקס
CREATE INDEX idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_available ON supplier_products(is_available);

-- טריגר לעדכון updated_at
CREATE TRIGGER update_supplier_products_updated_at
  BEFORE UPDATE ON supplier_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- נתונים לדוגמה - מוצרים לספקים קיימים
INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'עגבניות',
  12.50,
  'ק"ג',
  5,
  ARRAY['ראשון', 'שני', 'שלישי', 'רביעי']
FROM suppliers s WHERE s.name = 'סנפרוסט';

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'מלפפונים',
  8.00,
  'ק"ג',
  3,
  ARRAY['ראשון', 'שני', 'שלישי', 'רביעי']
FROM suppliers s WHERE s.name = 'סנפרוסט';

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'קמח לבן',
  6.50,
  'ק"ג',
  10,
  ARRAY['ראשון', 'שלישי', 'חמישי']
FROM suppliers s WHERE s.name = 'אסם';

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'שמן זית',
  45.00,
  'ליטר',
  5,
  ARRAY['ראשון', 'רביעי']
FROM suppliers s WHERE s.name = 'עלית';

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'חלב 3%',
  5.50,
  'ליטר',
  20,
  ARRAY['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי']
FROM suppliers s WHERE s.name = 'תנובה';

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'ביצים L',
  0.80,
  'יחידה',
  60,
  ARRAY['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי']
FROM suppliers s WHERE s.name = 'תנובה';

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'חזה עוף טרי',
  28.00,
  'ק"ג',
  5,
  ARRAY['ראשון', 'שלישי', 'חמישי']
FROM suppliers s WHERE s.name = 'מעדנות יוכנן';
