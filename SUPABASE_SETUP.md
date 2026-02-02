# 🚀 הגדרת Supabase למערכת SmartRest

## למה Supabase?

✅ **חינמי לצמיתות** - עד 500MB + 1GB אחסון + 2GB bandwidth  
✅ **PostgreSQL מלא** - דאטאבייס אמיתי עם SQL  
✅ **Realtime** - עדכונים אוטומטיים בזמן אמת  
✅ **אימות משתמשים** מובנה  
✅ **מתאים לשנים** של פעילות למסעדה קטנה-בינונית

---

## 📋 שלב 1: קבל את הפרטים מ-Supabase

1. היכנס ל-**Supabase Dashboard**: https://supabase.com/dashboard
2. בחר בפרויקט שלך (vitalibraude's Project)
3. לחץ על **Settings** ⚙️ בצד שמאל
4. לחץ על **API**
5. העתק:
   - **Project URL** (למעלה, משהו כמו: `https://xxxxx.supabase.co`)
   - **anon public key** (מתחת ל-Project API keys - מפתח ארוך)

---

## 🔑 שלב 2: עדכן את קובץ .env.local

פתח את הקובץ `.env.local` בשורש הפרויקט והחלף:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**עם הערכים האמיתיים** שהעתקת בשלב הקודם.

דוגמה:
```env
VITE_SUPABASE_URL=https://htqutxvjykalxsejfvuv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ שלב 3: צור את הטבלאות בדאטאבייס

1. ב-**Supabase Dashboard**, לחץ על **SQL Editor** 📝 בצד שמאל
2. לחץ על **+ New Query**
3. פתח את הקובץ `database/schema.sql` בפרויקט שלך
4. **העתק את כל התוכן** מהקובץ
5. **הדבק** ב-SQL Editor
6. לחץ על **Run** (או Ctrl+Enter)

אם הכל עבד, תראה הודעת הצלחה והטבלאות ייווצרו:
- ✅ suppliers (ספקים)
- ✅ inventory_items (פריטי מלאי)
- ✅ inventory_suppliers (קשרים בין פריטים לספקים)
- ✅ orders (הזמנות)
- ✅ messages (הודעות)
- ✅ financial_records (נתונים פיננסיים)

---

## ✅ שלב 4: בדוק שהכל עובד

1. ב-Supabase Dashboard, לחץ על **Table Editor** 📊
2. תראה את כל הטבלאות שנוצרו
3. לחץ על **inventory_items** - אמורים להיות 5 פריטים דוגמה
4. לחץ על **suppliers** - אמורים להיות 10 ספקים

---

## 🚀 שלב 5: הרץ את האפליקציה

```bash
npm run dev
```

האפליקציה תתחבר אוטומטית ל-Supabase!

אם תראה שגיאה "Missing Supabase environment variables", חזור לשלב 2.

---

## 📚 מה נוצר?

### Services (שירותים)
- **`services/supabaseClient.ts`** - חיבור ל-Supabase
- **`services/inventoryService.ts`** - ניהול מלאי
- **`services/ordersService.ts`** - ניהול הזמנות
- **`services/financeService.ts`** - ניהול פיננסי
- **`services/messagesService.ts`** - ניהול הודעות

### Database Schema
- **`database/schema.sql`** - מבנה הדאטאבייס המלא

### רכיבים מעודכנים
- **`components/Inventory.tsx`** - עובד עם Supabase במקום mock data

---

## 🔄 Realtime Updates

הפרויקט תומך בעדכונים בזמן אמת! 

לדוגמה, ב-`ordersService.ts` ו-`messagesService.ts` יש פונקציות:
- `subscribeToOrders()` - קבל עדכונים על הזמנות חדשות
- `subscribeToMessages()` - קבל הודעות חדשות בזמן אמת

---

## 💡 טיפים

1. **גיבויים**: Supabase מגבה אוטומטית (בתוכנית החינמית 7 ימים)
2. **מעקב שימוש**: Settings → Usage - עקוב אחר השימוש שלך
3. **API Logs**: Logs → API - ראה את כל הקריאות לדאטאבייס
4. **Security**: Row Level Security כבר מוגדר בטבלאות

---

## 🆘 פתרון בעיות

**שגיאה: "Missing Supabase environment variables"**
- ודא ש-.env.local קיים ומכיל את המפתחות
- הפעל מחדש את `npm run dev`

**שגיאה בטעינת נתונים**
- בדוק ב-Supabase Dashboard → Table Editor שהטבלאות קיימות
- בדוק ב-Logs → API אם יש שגיאות

**אין נתונים בטבלאות**
- הרץ שוב את `database/schema.sql`

---

זהו! המערכת מוכנה לעבודה עם דאטאבייס אמיתי! 🎉
