-- רק הוספת נתונים (ללא יצירת טבלאות)
-- הרץ את זה אם הטבלאות כבר קיימות

-- נתונים לדוגמה - מוצרים לספקים קיימים
INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'עגבניות',
  12.50,
  'ק"ג',
  5,
  ARRAY['ראשון', 'שני', 'שלישי', 'רביעי']
FROM suppliers s WHERE s.name = 'סנפרוסט'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'מלפפונים',
  8.00,
  'ק"ג',
  3,
  ARRAY['ראשון', 'שני', 'שלישי', 'רביעי']
FROM suppliers s WHERE s.name = 'סנפרוסט'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'קמח לבן',
  6.50,
  'ק"ג',
  10,
  ARRAY['ראשון', 'שלישי', 'חמישי']
FROM suppliers s WHERE s.name = 'אסם'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'שמן זית',
  45.00,
  'ליטר',
  5,
  ARRAY['ראשון', 'רביעי']
FROM suppliers s WHERE s.name = 'עלית'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'חלב 3%',
  5.50,
  'ליטר',
  20,
  ARRAY['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי']
FROM suppliers s WHERE s.name = 'תנובה'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'ביצים L',
  0.80,
  'יחידה',
  60,
  ARRAY['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי']
FROM suppliers s WHERE s.name = 'תנובה'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_products (supplier_id, product_name, price, unit, min_order_quantity, available_days) 
SELECT 
  s.id,
  'חזה עוף טרי',
  28.00,
  'ק"ג',
  5,
  ARRAY['ראשון', 'שלישי', 'חמישי']
FROM suppliers s WHERE s.name = 'מעדנות יוכנן'
ON CONFLICT DO NOTHING;
