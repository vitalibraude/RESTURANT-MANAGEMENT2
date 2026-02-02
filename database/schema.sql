-- SmartRest Database Schema
-- הרץ את הקוד הזה ב-Supabase SQL Editor

-- טבלת ספקים
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- טבלת פריטי מלאי
CREATE TABLE inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_threshold DECIMAL NOT NULL DEFAULT 10,
  order_mode TEXT NOT NULL DEFAULT 'manual' CHECK (order_mode IN ('manual', 'semi-auto', 'full-auto')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- טבלת קשרים בין פריטים לספקים
CREATE TABLE inventory_suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(inventory_item_id, supplier_id)
);

-- טבלת הזמנות
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER,
  customer_name TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_price DECIMAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- טבלת הודעות
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- טבלת נתונים פיננסיים
CREATE TABLE financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- אינדקסים לשיפור ביצועים
CREATE INDEX idx_inventory_items_name ON inventory_items(name);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_financial_records_date ON financial_records(date);
CREATE INDEX idx_financial_records_type ON financial_records(type);

-- פונקציה לעדכון updated_at אוטומטית
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- טריגרים לעדכון updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- הוספת ספקים ראשוניים
INSERT INTO suppliers (name) VALUES
  ('טמפו'),
  ('תנובה'),
  ('קוקה קולה'),
  ('אסם'),
  ('יינות ביתן'),
  ('עלית'),
  ('אורז הזהב'),
  ('סנפרוסט'),
  ('זוגלובק'),
  ('מעדנות יוכנן');

-- הוספת פריטי מלאי דוגמה
INSERT INTO inventory_items (name, quantity, unit, min_threshold, order_mode) VALUES
  ('עגבניות', 15, 'ק"ג', 10, 'manual'),
  ('קמח', 5, 'ק"ג', 20, 'semi-auto'),
  ('שמן זית', 40, 'ליטר', 10, 'full-auto'),
  ('ביצים', 24, 'יחידות', 60, 'semi-auto'),
  ('חזה עוף', 12, 'ק"ג', 5, 'manual');
