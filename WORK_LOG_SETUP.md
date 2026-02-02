# הוראות הגדרת יומן עבודה

## ✅ הפיצ'ר כבר דופלוי!

הפיצ'ר החדש **יומן עבודה** כבר עלה לאוויר ב-Vercel!

## צעדים נוספים נדרשים

כדי שיומן העבודה יעבוד במלואו, צריך ליצור טבלה במסד הנתונים Supabase:

### 1️⃣ היכנס ל-Supabase Dashboard
1. גש ל: https://supabase.com/dashboard
2. בחר את הפרויקט שלך
3. לחץ על **SQL Editor** בתפריט הצדדי

### 2️⃣ הרץ את ה-SQL הבא:

העתק והדבק את הקוד הבא ב-SQL Editor ולחץ **Run**:

```sql
-- Create work_logs table for tracking employee work hours
CREATE TABLE IF NOT EXISTS work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL CHECK (hours_worked > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_work_logs_employee_id ON work_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_work_date ON work_logs(work_date);
CREATE INDEX IF NOT EXISTS idx_work_logs_employee_date ON work_logs(employee_id, work_date);

-- Enable RLS
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on work_logs" ON work_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_work_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_work_logs_updated_at
  BEFORE UPDATE ON work_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_work_logs_updated_at();

-- Add comment
COMMENT ON TABLE work_logs IS 'יומן עבודה - מעקב אחר שעות עבודה של עובדים';
```

### 3️⃣ זהו! 🎉

אחרי הרצת ה-SQL, יומן העבודה יהיה פעיל במלואו!

---

## 🌟 תכונות יומן העבודה

### מה הפיצ'ר כולל:

✅ **כפתור "יומן עבודה" בסיידבר** - גישה מהירה ליומן

✅ **יומן חודשי** - צפייה בכל החודש עם ניווט בין חודשים

✅ **הוספת רשומות עבודה**:
- בחירת עובד מרשימת העובדים הפעילים
- הזנת תאריך עבודה
- הזנת מספר שעות (כולל חצאי שעה)
- הערות אופציונליות

✅ **חישוב אוטומטי של משכורת**:
- שעות עבודה × שכר לשעה = משכורת יומית
- סיכום חודשי לכל עובד

✅ **דוח נוכחות מפורט**:
- כמה ימים עבד כל עובד
- סה"כ שעות עבודה
- סה"כ משכורת

✅ **ייצוא לאקסל (CSV)**:
- כפתור "ייצא לאקסל" מייצא דוח מלא
- הקובץ כולל: שם עובד, ימי עבודה, שעות, שכר לשעה, סה"כ משכורת
- ניתן לפתוח ב-Excel/Google Sheets

✅ **תצוגה נוחה**:
- סיכום חודשי עם מספרים מרכזיים
- רשימת רשומות לפי יום
- טבלת סיכום לפי עובד

---

## 📊 איך להשתמש

1. **הוסף רשומת עבודה**: לחץ על "הוסף רשומה", בחר עובד, תאריך ושעות
2. **צפה ביומן**: גלול דרך החודש וראה מי עבד מתי
3. **בדוק משכורות**: טבלת הסיכום מראה לך כמה כל עובד צריך לקבל
4. **ייצא לאקסל**: לחץ על הכפתור הירוק כדי להוריד דוח מלא

---

## 🔗 קישורים

- **האפליקציה**: https://resturant-management-2.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard
- **קובץ SQL**: `database/work-logs-schema.sql`
