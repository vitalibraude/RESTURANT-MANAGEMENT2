-- קובץ זה מכיל דאטה דוגמה נוספת שאפשר להוסיף
-- הרץ את זה אחרי schema.sql אם אתה רוצה יותר נתונים לדוגמה

-- הזמנות דוגמה
INSERT INTO orders (table_number, customer_name, items, total_price, status) VALUES
  (5, 'משפחת כהן', '[{"name": "פיצה משפחתית", "quantity": 2, "price": 45}]', 90, 'completed'),
  (3, 'דני לוי', '[{"name": "המבורגר", "quantity": 1, "price": 35}, {"name": "קולה", "quantity": 1, "price": 10}]', 45, 'in-progress'),
  (8, NULL, '[{"name": "סלט יווני", "quantity": 2, "price": 28}]', 56, 'pending');

-- הודעות דוגמה
INSERT INTO messages (sender, content, is_read) VALUES
  ('המלצר', 'שולחן 5 מבקש תפריט קינוחים', false),
  ('המטבח', 'נגמר הבשר לקציצות - צריך לעדכן תפריט', true),
  ('מנהל', 'פגישת צוות ביום ראשון בשעה 10:00', false);

-- רשומות פיננסיות דוגמה
INSERT INTO financial_records (type, category, amount, description, date) VALUES
  ('income', 'מכירות', 1500, 'הכנסות יום שישי', CURRENT_DATE - INTERVAL '1 day'),
  ('expense', 'חומרי גלם', 800, 'קניות בסנפרוסט', CURRENT_DATE - INTERVAL '2 days'),
  ('expense', 'שכר עובדים', 3500, 'משכורות חודש נובמבר', CURRENT_DATE - INTERVAL '10 days'),
  ('income', 'מכירות', 2100, 'הכנסות יום שבת', CURRENT_DATE),
  ('expense', 'חשמל', 450, 'חשבון חשמל חודש נובמבר', CURRENT_DATE - INTERVAL '5 days');

-- פריטי מלאי נוספים
INSERT INTO inventory_items (name, quantity, unit, min_threshold, order_mode) VALUES
  ('בצל', 8, 'ק"ג', 5, 'manual'),
  ('שום', 3, 'ק"ג', 2, 'manual'),
  ('פלפל אדום', 6, 'ק"ג', 4, 'manual'),
  ('גבינת מוצרלה', 12, 'ק"ג', 8, 'semi-auto'),
  ('בקר טחון', 18, 'ק"ג', 10, 'semi-auto'),
  ('עוף שלם', 5, 'יחידות', 3, 'manual'),
  ('אורז', 25, 'ק"ג', 15, 'full-auto'),
  ('פסטה', 10, 'ק"ג', 5, 'semi-auto'),
  ('רוטב עגבניות', 20, 'ליטר', 10, 'full-auto'),
  ('חסה', 4, 'יחידות', 6, 'manual');
